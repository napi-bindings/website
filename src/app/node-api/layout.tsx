import { DocsSidebar, type SidebarGroup } from "@/components/docs-sidebar"
import { Container } from "@/components/page-header"
import { guideSections, nodeApi } from "@/lib/data"
import { routes } from "@/lib/site"

export default function NodeApiLayout({ children }: LayoutProps<"/node-api">) {
  const groups: SidebarGroup[] = [
    {
      title: "Node-API",
      items: [
        { title: "Overview", href: "/node-api/" },
        { title: "Versions", href: "/node-api/versions/" },
        { title: "API reference", href: "/node-api/reference/", badge: String(nodeApi.symbols.length) },
      ],
    },
    {
      title: "Guide",
      items: guideSections.map((s) => ({
        title: s.title,
        href: routes.section(s.id),
        badge: s.symbols.length ? String(s.symbols.length) : undefined,
      })),
    },
  ]

  return (
    <Container className="grid gap-10 py-10 lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <div className="sticky top-20 max-h-[calc(100svh-6rem)] overflow-y-auto pr-2 pb-8">
          <DocsSidebar groups={groups} />
        </div>
      </aside>
      <div className="min-w-0">
        <details className="group mb-8 rounded-xl border lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium">
            Browse Node-API
            <span className="text-muted-foreground text-xs group-open:hidden">show</span>
            <span className="text-muted-foreground hidden text-xs group-open:inline">hide</span>
          </summary>
          <div className="border-t p-2">
            <DocsSidebar groups={groups} />
          </div>
        </details>
        {children}
      </div>
    </Container>
  )
}
