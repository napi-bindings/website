import { guideSections, nodeApi, projects } from "@/lib/data"
import type { SearchEntry } from "@/lib/search"
import { mainNav, routes } from "@/lib/site"

// Emitted as a static file by `next build` (output: "export").
export const dynamic = "force-static"

export function GET(): Response {
  const entries: SearchEntry[] = [
    ...mainNav.map((item) => ({ group: "Pages", title: item.title, href: item.href })),
    { group: "Pages", title: "Node-API versions", href: "/node-api/versions/" },
    ...projects.map((p) => ({
      group: "Projects",
      title: p.name,
      href: routes.project(p.slug),
      description: p.tagline,
    })),
    ...projects.flatMap((p) => [
      ...p.data.docs.map((d) => ({
        group: "Project docs",
        title: d.title,
        href: routes.projectDocs(p.slug, d.slug),
        description: `${p.name} · ${d.path}`,
      })),
      ...(p.data.releases.length
        ? [{ group: "Project docs", title: `${p.name} releases`, href: routes.projectReleases(p.slug) }]
        : []),
    ]),
    ...guideSections.map((s) => ({
      group: "Node-API guide",
      title: s.title,
      href: routes.section(s.id),
    })),
    ...nodeApi.symbols.map((s) => ({
      group: "Node-API reference",
      title: s.name,
      href: routes.symbol(s.name),
      description: s.summary,
      mono: true,
    })),
  ]
  return Response.json(entries)
}
