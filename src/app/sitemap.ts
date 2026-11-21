import type { MetadataRoute } from "next"

import { guideSections, nodeApi, projects } from "@/lib/data"
import { routes, siteConfig } from "@/lib/site"

export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/node-api/",
    "/node-api/reference/",
    "/node-api/versions/",
    "/projects/",
    "/ecosystem/",
    "/activity/",
    "/privacy/",
    ...guideSections.map((s) => routes.section(s.id)),
    ...nodeApi.symbols.map((s) => routes.symbol(s.name)),
    ...projects.flatMap((p) => [
      routes.project(p.slug),
      routes.projectActivity(p.slug),
      ...(p.data.releases.length ? [routes.projectReleases(p.slug)] : []),
      ...(p.data.changelog ? [routes.projectChangelog(p.slug)] : []),
      ...(p.data.docs.length ? [`/projects/${p.slug}/docs/`] : []),
      ...p.data.docs.map((d) => routes.projectDocs(p.slug, d.slug)),
    ]),
  ]
  return paths.map((path) => ({ url: `${siteConfig.url}${path}` }))
}
