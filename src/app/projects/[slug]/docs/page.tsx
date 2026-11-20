import { FileTextIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { getProject, projects } from "@/lib/data"
import { routes } from "@/lib/site"

export const dynamicParams = false

export function generateStaticParams() {
  return projects.filter((p) => p.data.docs.length > 0).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]/docs">): Promise<Metadata> {
  const { slug } = await params
  const project = getProject(slug)
  return project ? { title: `${project.name} documentation`, alternates: { canonical: `/projects/${slug}/docs/` } } : {}
}

export default async function ProjectDocsIndex({ params }: PageProps<"/projects/[slug]/docs">) {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) notFound()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight">Documentation</h2>
        <p className="text-muted-foreground">
          Every Markdown document of the <span className="font-mono">{project.repo}</span> repository, rendered from
          its default branch.
        </p>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {project.data.docs.map((doc) => (
          <li key={doc.path}>
            <Link
              href={routes.projectDocs(slug, doc.slug)}
              className="hover:bg-muted/50 flex h-full items-start gap-3 rounded-xl border p-4"
            >
              <FileTextIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="font-medium">{doc.title}</span>
                <span className="text-muted-foreground truncate font-mono text-xs">{doc.path}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
