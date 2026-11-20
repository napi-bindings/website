import { ArrowLeftIcon, ArrowRightIcon, PencilIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Markdown } from "@/components/markdown"
import { TableOfContents } from "@/components/toc"
import { Button } from "@/components/ui/button"
import { findDoc, getProject, projects } from "@/lib/data"
import { renderMarkdown } from "@/lib/markdown"
import { repoLinks } from "@/lib/repo-links"
import { routes } from "@/lib/site"

export const dynamicParams = false

export function generateStaticParams() {
  return projects.flatMap((p) => p.data.docs.map((d) => ({ slug: p.slug, doc: d.slug })))
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]/docs/[...doc]">): Promise<Metadata> {
  const { slug, doc: docSlug } = await params
  const project = getProject(slug)
  const doc = project && findDoc(project, docSlug)
  if (!project || !doc) return {}
  return {
    title: `${doc.title} · ${project.name}`,
    description: `${project.name} documentation: ${doc.title} (${doc.path}).`,
    alternates: { canonical: routes.projectDocs(slug, doc.slug) },
  }
}

export default async function ProjectDocPage({ params }: PageProps<"/projects/[slug]/docs/[...doc]">) {
  const { slug, doc: docSlug } = await params
  const project = getProject(slug)
  const doc = project && findDoc(project, docSlug)
  if (!project || !doc) notFound()

  const { html, toc } = await renderMarkdown(doc.markdown, { links: repoLinks(project, doc.path) })
  const index = project.data.docs.indexOf(doc)
  const prev = project.data.docs[index - 1]
  const next = project.data.docs[index + 1]
  const editUrl = `https://github.com/${project.repo}/edit/${project.data.meta.defaultBranch}/${doc.path}`

  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_13rem]">
      <article className="flex min-w-0 flex-col gap-8">
        <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-mono">{doc.path}</span>
          <a href={editUrl} target="_blank" rel="noreferrer" className="hover:text-foreground flex items-center gap-1">
            <PencilIcon className="size-3" />
            Edit on GitHub
          </a>
        </div>
        <Markdown html={html} />
        <nav className="flex justify-between gap-4 border-t pt-6">
          {prev ? (
            <Button variant="ghost" render={<Link href={routes.projectDocs(slug, prev.slug)} />}>
              <ArrowLeftIcon data-icon="inline-start" />
              {prev.title}
            </Button>
          ) : (
            <span />
          )}
          {next && (
            <Button variant="ghost" render={<Link href={routes.projectDocs(slug, next.slug)} />}>
              {next.title}
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          )}
        </nav>
      </article>
      <aside className="hidden xl:block">
        <div className="sticky top-20">
          <TableOfContents items={toc} />
        </div>
      </aside>
    </div>
  )
}
