"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

export type ProjectNavItem = { title: string; href: string; count?: number }

/** Tab-style navigation between the pages of a project (each tab is a static page). */
export function ProjectNav({ items }: { items: ProjectNavItem[] }) {
  const pathname = usePathname()
  const current = pathname.endsWith("/") ? pathname : `${pathname}/`
  const overview = items[0]?.href

  return (
    <nav aria-label="Project sections" className="-mb-px flex gap-1 overflow-x-auto">
      {items.map((item) => {
        const active = item.href === overview ? current === item.href : current.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "hover:text-foreground flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm transition-colors",
              active ? "border-brand text-foreground font-medium" : "text-muted-foreground border-transparent"
            )}
          >
            {item.title}
            {item.count !== undefined && (
              <span className="bg-muted text-muted-foreground rounded-full px-1.5 font-mono text-[0.6875rem]">
                {item.count}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
