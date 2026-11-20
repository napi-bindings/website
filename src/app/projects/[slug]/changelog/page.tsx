import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { Markdown } from "@/components/markdown"
import { TableOfContents } from "@/components/toc"
import { getProject, projects } from "@/lib/data"
import { renderMarkdown } from "@/lib/markdown"
import { repoLinks } from "@/lib/repo-links"
import { routes } from "@/lib/site"

export const dynamicParams = false

export function generateStaticParams() {
  return projects.filter((p) => p.data.changelog !== null).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]/changelog">): Promise<Metadata> {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) return {}
  return {
    title: `${project.name} changelog`,
    alternates: { canonical: routes.projectChangelog(slug) },
  }
}

export default async function ChangelogPage({ params }: PageProps<"/projects/[slug]/changelog">) {
  const { slug } = await params
  const project = getProject(slug)
  if (!project?.data.changelog) notFound()

  const { html, toc } = await renderMarkdown(project.data.changelog, {
    links: repoLinks(project, "CHANGELOG.md"),
    dropTitle: true,
  })

  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_13rem]">
      <article className="min-w-0">
        <Markdown html={html} />
      </article>
      <aside className="hidden xl:block">
        <div className="sticky top-20">
          <TableOfContents items={toc.filter((t) => t.depth === 2)} />
        </div>
      </aside>
    </div>
  )
}
