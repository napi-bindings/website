"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

export type SidebarGroup = {
  title: string
  items: { title: string; href: string; badge?: string; mono?: boolean }[]
}

/** Sticky documentation navigation; highlights the current page. */
export function DocsSidebar({ groups, className }: { groups: SidebarGroup[]; className?: string }) {
  const pathname = usePathname()
  const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`

  return (
    <nav aria-label="Section navigation" className={cn("flex flex-col gap-6 text-sm", className)}>
      {groups.map((group) => (
        <div key={group.title} className="flex flex-col gap-1">
          <p className="text-muted-foreground px-2 pb-1 text-xs font-medium tracking-wide uppercase">{group.title}</p>
          {group.items.map((item) => {
            const active = normalized === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "hover:bg-muted hover:text-foreground flex items-center justify-between gap-2 rounded-md px-2 py-1.5",
                  active ? "bg-muted text-foreground font-medium" : "text-muted-foreground",
                  item.mono && "font-mono text-[0.8125rem]"
                )}
              >
                <span className="truncate">{item.title}</span>
                {item.badge && <span className="text-muted-foreground font-mono text-xs">{item.badge}</span>}
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}
