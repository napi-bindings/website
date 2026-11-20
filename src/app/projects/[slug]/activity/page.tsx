import { GitBranchIcon } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ActivityFeed } from "@/components/activity-feed"
import { Button } from "@/components/ui/button"
import { activity, getProject, projects } from "@/lib/data"
import { routes } from "@/lib/site"
import { formatDate } from "@/lib/utils"

export const dynamicParams = false

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]/activity">): Promise<Metadata> {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) return {}
  return {
    title: `${project.name} activity`,
    description: `Recent commits and releases of ${project.name}.`,
    alternates: { canonical: routes.projectActivity(slug) },
  }
}

export default async function ProjectActivityPage({ params }: PageProps<"/projects/[slug]/activity">) {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) notFound()

  const items = activity({ slug })

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm">
          Latest commits on <span className="font-mono">{project.data.meta.defaultBranch}</span> and releases,
          synchronised on {formatDate(project.data.syncedAt)}.
        </p>
        <Button
          variant="outline"
          size="sm"
          render={
            <a
              href={`https://github.com/${project.repo}/commits/${project.data.meta.defaultBranch}`}
              target="_blank"
              rel="noreferrer"
            />
          }
        >
          <GitBranchIcon data-icon="inline-start" />
          Full history
        </Button>
      </div>
      <ActivityFeed items={items} showProject={false} />
    </div>
  )
}
