import { notFound } from "next/navigation"

import { DocsSidebar, type SidebarGroup } from "@/components/docs-sidebar"
import { getProject } from "@/lib/data"
import { routes } from "@/lib/site"

function groupLabel(group: string): string {
  if (group === "") return "Repository"
  if (group === "docs" || group === "doc") return "Documentation"
  return `${group}/`
}

export default async function ProjectDocsLayout({ children, params }: LayoutProps<"/projects/[slug]/docs">) {
  const { slug } = await params
  const project = getProject(slug)
  if (!project || project.data.docs.length === 0) notFound()

  const groups = new Map<string, SidebarGroup>()
  for (const doc of project.data.docs) {
    const title = groupLabel(doc.group)
    const group = groups.get(title) ?? { title, items: [] }
    group.items.push({ title: doc.title, href: routes.projectDocs(slug, doc.slug) })
    groups.set(title, group)
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside>
        <div className="lg:sticky lg:top-20 lg:max-h-[calc(100svh-6rem)] lg:overflow-y-auto lg:pr-2 lg:pb-8">
          <DocsSidebar groups={[...groups.values()]} />
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
