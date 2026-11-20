import type { TocItem } from "@/lib/markdown"
import { cn } from "@/lib/utils"

export function TableOfContents({ items, className }: { items: TocItem[]; className?: string }) {
  if (items.length < 2) return null
  return (
    <nav aria-label="On this page" className={cn("flex flex-col gap-2 text-sm", className)}>
      <p className="font-medium">On this page</p>
      <ul className="flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={item.id} className={cn(item.depth === 3 && "pl-3")}>
            <a href={`#${item.id}`} className="text-muted-foreground hover:text-foreground line-clamp-2">
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
