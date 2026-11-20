import "server-only"

import rehypeShikiFromHighlighter from "@shikijs/rehype/core"
import type { Element, ElementContent, Root as HastRoot } from "hast"
import { toString } from "hast-util-to-string"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeRaw from "rehype-raw"
import rehypeSanitize, { defaultSchema, type Options as SanitizeSchema } from "rehype-sanitize"
import rehypeSlug from "rehype-slug"
import rehypeStringify from "rehype-stringify"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { createHighlighter, type Highlighter } from "shiki"
import { unified } from "unified"
import { visit } from "unist-util-visit"

import { routes, withBasePath } from "@/lib/site"

/* ------------------------------------------------------------------ */
/* Link context: how relative URLs found in a document are resolved.   */
/* ------------------------------------------------------------------ */

export type RepoLinkContext = {
  kind: "repo"
  slug: string
  repo: string
  branch: string
  /** Path of the document inside the repository (README.md, docs/guide.md). */
  path: string
  /** Repository paths of the documents that have a page on this site. */
  docs: Map<string, string[]>
  hasChangelog: boolean
}

export type NodeApiLinkContext = {
  kind: "node-api"
  symbols: Set<string>
  sections: Set<string>
}

export type LinkContext = RepoLinkContext | NodeApiLinkContext

const NODE_DOCS = "https://nodejs.org/docs/latest/api/"
const IMAGE_EXT = /\.(png|jpe?g|gif|svg|webp|avif)$/i

function isExternal(url: string): boolean {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url)
}

function joinRepoPath(base: string, relative: string): string {
  const parts = base.split("/").slice(0, -1)
  for (const seg of relative.replace(/^\.\//, "").split("/")) {
    if (seg === "..") parts.pop()
    else if (seg !== "." && seg !== "") parts.push(seg)
  }
  return parts.join("/")
}

function resolveRepoUrl(url: string, ctx: RepoLinkContext, asImage: boolean): string {
  const githubBlob = new RegExp(`^https://github\\.com/${ctx.repo}/blob/[^/]+/(.+)$`, "i").exec(url)
  if (!githubBlob && isExternal(url)) return url
  if (url.startsWith("#")) return url

  const [rawPath = "", hash = ""] = (githubBlob?.[1] ?? url).split("#")
  const target = githubBlob ? rawPath : rawPath.startsWith("/") ? rawPath.slice(1) : joinRepoPath(ctx.path, rawPath)
  const anchor = hash ? `#${hash}` : ""

  if (asImage || IMAGE_EXT.test(target)) {
    return `https://raw.githubusercontent.com/${ctx.repo}/${ctx.branch}/${target}`
  }
  const lower = target.toLowerCase()
  if (lower === "readme.md" || lower === "") return withBasePath(routes.project(ctx.slug)) + anchor
  if (lower === "changelog.md" && ctx.hasChangelog) return withBasePath(routes.projectChangelog(ctx.slug)) + anchor
  const doc = ctx.docs.get(lower) ?? ctx.docs.get(`${lower.replace(/\/$/, "")}/readme.md`)
  if (doc) return withBasePath(routes.projectDocs(ctx.slug, doc)) + anchor
  return `https://github.com/${ctx.repo}/blob/${ctx.branch}/${target}${anchor}`
}

function resolveNodeApiUrl(url: string, ctx: NodeApiLinkContext): string {
  if (isExternal(url)) return url
  if (url.startsWith("#")) {
    const id = url.slice(1)
    if (ctx.symbols.has(id)) return withBasePath(routes.symbol(id))
    if (ctx.sections.has(id)) return withBasePath(routes.section(id))
    return `${NODE_DOCS}n-api.html${url}`
  }
  // Links to other pages of the Node.js API docs, e.g. addons.md#hello-world.
  const [file = "", hash = ""] = url.split("#")
  return `${NODE_DOCS}${file.replace(/\.md$/, ".html")}${hash ? `#${hash}` : ""}`
}

function rehypeResolveLinks(ctx: LinkContext) {
  return (tree: HastRoot) => {
    visit(tree, "element", (node: Element) => {
      const attr = node.tagName === "a" ? "href" : node.tagName === "img" ? "src" : null
      if (!attr) return
      const value = node.properties[attr]
      if (typeof value !== "string" || !value) return
      const resolved =
        ctx.kind === "repo"
          ? resolveRepoUrl(value, ctx, node.tagName === "img")
          : resolveNodeApiUrl(value, ctx)
      node.properties[attr] = resolved
      if (node.tagName === "a" && isExternal(resolved)) {
        node.properties.target = "_blank"
        node.properties.rel = ["noreferrer", "noopener"]
      }
      if (node.tagName === "img") node.properties.loading = "lazy"
    })
  }
}

/* ------------------------------------------------------------------ */
/* Other rehype plugins                                                 */
/* ------------------------------------------------------------------ */

export type TocItem = { id: string; text: string; depth: 2 | 3 }

/** Collects h2/h3 headings (after rehype-slug assigned their ids). */
function rehypeCollectToc(toc: TocItem[]) {
  return (tree: HastRoot) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "h2" && node.tagName !== "h3") return
      const id = node.properties.id
      if (typeof id !== "string") return
      toc.push({ id, text: toString(node).trim(), depth: node.tagName === "h2" ? 2 : 3 })
    })
  }
}

/** Removes the first <h1>, used where the page header already shows the title. */
function rehypeDropTitle() {
  return (tree: HastRoot) => {
    const index = tree.children.findIndex((n) => n.type === "element" && n.tagName === "h1")
    if (index !== -1) tree.children.splice(index, 1)
  }
}

/** ```mermaid blocks become <pre class="mermaid"> rendered on the client. */
function rehypeMermaid() {
  return (tree: HastRoot) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName !== "pre" || !parent || index === undefined) return
      const code = node.children.find((c): c is Element => c.type === "element" && c.tagName === "code")
      const classes = code?.properties.className
      if (!Array.isArray(classes) || !classes.includes("language-mermaid")) return
      const replacement: ElementContent = {
        type: "element",
        tagName: "pre",
        properties: { className: ["mermaid"] },
        children: [{ type: "text", value: toString(code as Element) }],
      }
      parent.children[index] = replacement
    })
  }
}

const sanitizeSchema: SanitizeSchema = {
  ...defaultSchema,
  // Keep heading ids identical to GitHub so that #anchors keep working.
  clobberPrefix: "",
  clobber: [],
  attributes: {
    ...defaultSchema.attributes,
    "*": [...(defaultSchema.attributes?.["*"] ?? []), "align"],
    img: [...(defaultSchema.attributes?.img ?? []), "width", "height", "align"],
    code: [...(defaultSchema.attributes?.code ?? []), ["className", /^language-./]],
    th: [...(defaultSchema.attributes?.th ?? []), "scope"],
  },
  tagNames: [...(defaultSchema.tagNames ?? []), "picture", "source"],
}

/* ------------------------------------------------------------------ */
/* Highlighter (one instance for the whole build)                      */
/* ------------------------------------------------------------------ */

const LANGS = [
  "c", "cpp", "go", "zig", "rust", "js", "ts", "json", "jsonc", "sh", "bash", "shell", "powershell",
  "bat", "cmake", "yaml", "toml", "ini", "diff", "make", "dockerfile", "python", "html", "markdown",
] as const

let highlighter: Promise<Highlighter> | undefined

function getHighlighter(): Promise<Highlighter> {
  highlighter ??= createHighlighter({ themes: ["github-light", "github-dark"], langs: [...LANGS] })
  return highlighter
}

/* ------------------------------------------------------------------ */

export type RenderOptions = {
  links: LinkContext
  /** Drop the first H1 of the document. */
  dropTitle?: boolean
}

export type RenderedMarkdown = { html: string; toc: TocItem[] }

export async function renderMarkdown(markdown: string, options: RenderOptions): Promise<RenderedMarkdown> {
  const toc: TocItem[] = []
  const hl = await getHighlighter()

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSanitize, sanitizeSchema)
    .use(options.dropTitle ? rehypeDropTitle : () => undefined)
    .use(rehypeSlug)
    // Resolve the document's own links before adding the heading anchors,
    // which must stay on this page.
    .use(rehypeResolveLinks, options.links)
    .use(rehypeAutolinkHeadings, {
      behavior: "wrap",
      properties: { className: ["heading-anchor"] },
      test: ["h2", "h3", "h4"],
    })
    .use(rehypeCollectToc, toc)
    .use(rehypeMermaid)
    .use(rehypeShikiFromHighlighter, hl, {
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: "light",
      defaultLanguage: "text",
      fallbackLanguage: "text",
      // Fences with other names; anything else falls back to plain text.
      langAlias: {
        console: "sh",
        "shell-session": "sh",
        mjs: "js",
        cjs: "js",
        "c++": "cpp",
        cc: "cpp",
        hpp: "cpp",
        h: "c",
        gyp: "json",
      },
      onError: () => undefined,
    })
    .use(rehypeStringify)
    .process(markdown)

  return { html: String(file), toc }
}

/** Plain-text highlighted snippet, used outside Markdown documents. */
export async function highlightCode(code: string, lang: string): Promise<string> {
  const hl = await getHighlighter()
  const language = hl.getLoadedLanguages().includes(lang) ? lang : "text"
  return hl.codeToHtml(code, {
    lang: language,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: "light",
  })
}
