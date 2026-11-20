import { ExternalLinkIcon, TagIcon } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { Markdown } from "@/components/markdown"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getProject, latestRelease, projects } from "@/lib/data"
import { renderMarkdown } from "@/lib/markdown"
import { repoLinks } from "@/lib/repo-links"
import { routes } from "@/lib/site"
import { formatDate } from "@/lib/utils"

export const dynamicParams = false

export function generateStaticParams() {
  return projects.filter((p) => p.data.releases.length > 0).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]/releases">): Promise<Metadata> {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) return {}
  return {
    title: `${project.name} releases`,
    description: `Release notes of ${project.name}: ${project.data.releases.length} releases.`,
    alternates: { canonical: routes.projectReleases(slug) },
  }
}

export default async function ReleasesPage({ params }: PageProps<"/projects/[slug]/releases">) {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) notFound()

  const latest = latestRelease(project)
  const releases = await Promise.all(
    project.data.releases.map(async (release) => ({
      release,
      html: release.body
        ? (await renderMarkdown(release.body, { links: repoLinks(project, "RELEASES.md") })).html
        : "",
    }))
  )

  return (
    <div className="flex max-w-4xl flex-col gap-10">
      <h2 className="sr-only">Releases</h2>
      {releases.map(({ release, html }) => (
        <section
          key={release.tag}
          id={release.tag}
          className="grid scroll-mt-20 gap-4 border-b pb-10 last:border-b-0 md:grid-cols-[10rem_minmax(0,1fr)]"
        >
          <div className="flex flex-col gap-1.5">
            <span className="flex items-center gap-1.5 font-mono text-sm font-medium">
              <TagIcon className="text-brand size-4" />
              {release.tag}
            </span>
            <span className="text-muted-foreground text-xs">{formatDate(release.publishedAt)}</span>
            <span className="flex flex-wrap gap-1">
              {release === latest && <Badge>Latest</Badge>}
              {release.prerelease && <Badge variant="outline">Pre-release</Badge>}
            </span>
          </div>
          <div className="flex min-w-0 flex-col gap-4">
            <h3 className="text-xl font-semibold tracking-tight">{release.name}</h3>
            {html ? (
              <Markdown html={html} />
            ) : (
              <p className="text-muted-foreground text-sm">No release notes were published for this release.</p>
            )}
            <div>
              <Button variant="outline" size="sm" render={<a href={release.url} target="_blank" rel="noreferrer" />}>
                Assets on GitHub
                <ExternalLinkIcon data-icon="inline-end" />
              </Button>
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}
