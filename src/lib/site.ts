import { ORG_URL } from "@/config/projects"

export const siteConfig = {
  name: "napi-bindings",
  title: "napi-bindings — Node-API hub",
  description:
    "The reference hub for Node-API (N-API): documentation, versions, ecosystem, and the napi-bindings native addon tooling for C, C++, Go and QuickJS.",
  url: "https://www.napi-bindings.dev",
  github: ORG_URL,
  nodeApiDocs: "https://nodejs.org/docs/latest/api/n-api.html",
} as const

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

/**
 * Prefixes an internal path with the base path. Only needed for URLs that do
 * not go through next/link (raw HTML from Markdown, fetch, <img src>).
 */
export function withBasePath(href: string): string {
  return href.startsWith("/") ? `${BASE_PATH}${href}` : href
}

export const mainNav = [
  { title: "Node-API", href: "/node-api/" },
  { title: "Reference", href: "/node-api/reference/" },
  { title: "Projects", href: "/projects/" },
  { title: "Ecosystem", href: "/ecosystem/" },
  { title: "Activity", href: "/activity/" },
] as const

export const routes = {
  project: (slug: string) => `/projects/${slug}/`,
  projectDocs: (slug: string, doc: string[]) => `/projects/${slug}/docs/${doc.join("/")}/`,
  projectReleases: (slug: string) => `/projects/${slug}/releases/`,
  projectChangelog: (slug: string) => `/projects/${slug}/changelog/`,
  projectActivity: (slug: string) => `/projects/${slug}/activity/`,
  symbol: (name: string) => `/node-api/reference/${name}/`,
  section: (id: string) => `/node-api/docs/${id}/`,
} as const
