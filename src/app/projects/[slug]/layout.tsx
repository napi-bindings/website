import { ExternalLinkIcon, GitForkIcon, ScaleIcon, StarIcon, TagIcon } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { GitHubIcon } from "@/components/icons"
import { Container } from "@/components/page-header"
import { CATEGORY_ICONS } from "@/components/project-card"
import { ProjectNav, type ProjectNavItem } from "@/components/project-nav"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { categoryLabel, getProject, latestRelease, projects } from "@/lib/data"
import { routes } from "@/lib/site"
import { formatCount, formatDate } from "@/lib/utils"

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }))
}

export default async function ProjectLayout({ children, params }: LayoutProps<"/projects/[slug]">) {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) notFound()

  const { data } = project
  const release = latestRelease(project)
  const Icon = CATEGORY_ICONS[project.category]

  const nav: ProjectNavItem[] = [
    { title: "Overview", href: routes.project(slug) },
    ...(data.docs.length ? [{ title: "Docs", href: `/projects/${slug}/docs/`, count: data.docs.length }] : []),
    ...(data.releases.length
      ? [{ title: "Releases", href: routes.projectReleases(slug), count: data.releases.length }]
      : []),
    ...(data.changelog ? [{ title: "Changelog", href: routes.projectChangelog(slug) }] : []),
    { title: "Activity", href: routes.projectActivity(slug) },
  ]

  return (
    <>
      <div className="bg-muted/30 border-b">
        <Container className="flex flex-col gap-5 pt-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex max-w-3xl flex-col gap-3">
              <Link
                href="/projects/"
                className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1.5 text-xs"
              >
                <Icon className="size-3.5" />
                {categoryLabel(project)}
              </Link>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-mono text-3xl font-semibold tracking-tight">{project.name}</h1>
                {project.status && <Badge variant="outline">{project.status}</Badge>}
              </div>
              <p className="text-muted-foreground text-pretty">{project.tagline}</p>
              <div className="text-muted-foreground flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                <span className="flex items-center gap-1.5">
                  <StarIcon className="size-4" />
                  {formatCount(data.meta.stars)} {data.meta.stars === 1 ? "star" : "stars"}
                </span>
                <span className="flex items-center gap-1.5">
                  <GitForkIcon className="size-4" />
                  {formatCount(data.meta.forks)} {data.meta.forks === 1 ? "fork" : "forks"}
                </span>
                {release && (
                  <Link href={routes.projectReleases(slug)} className="hover:text-foreground flex items-center gap-1.5">
                    <TagIcon className="size-4" />
                    <span className="font-mono">{release.tag}</span>
                    <span>· {formatDate(release.publishedAt)}</span>
                  </Link>
                )}
                {data.meta.license && (
                  <span className="flex items-center gap-1.5">
                    <ScaleIcon className="size-4" />
                    {data.meta.license}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                render={<a href={`https://github.com/${project.repo}`} target="_blank" rel="noreferrer" />}
              >
                <GitHubIcon data-icon="inline-start" />
                Repository
              </Button>
              {project.links?.map((link) => (
                <Button
                  key={link.href}
                  variant="ghost"
                  render={<a href={link.href} target="_blank" rel="noreferrer" />}
                >
                  {link.label}
                  <ExternalLinkIcon data-icon="inline-end" />
                </Button>
              ))}
            </div>
          </div>
          <ProjectNav items={nav} />
        </Container>
      </div>
      <Container className="py-10">{children}</Container>
    </>
  )
}
