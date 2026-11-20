import { GitCommitHorizontalIcon, TagIcon } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import type { ActivityItem } from "@/lib/data"
import { routes } from "@/lib/site"
import { cn, formatDate } from "@/lib/utils"

/** Releases and commits grouped by day, newest first. */
export function ActivityFeed({ items, showProject = true }: { items: ActivityItem[]; showProject?: boolean }) {
  const days = new Map<string, ActivityItem[]>()
  for (const item of items) {
    const day = item.date.slice(0, 10)
    days.set(day, [...(days.get(day) ?? []), item])
  }

  return (
    <ol className="flex flex-col gap-8">
      {[...days.entries()].map(([day, dayItems]) => (
        <li key={day} className="flex flex-col gap-3">
          <h3 className="text-muted-foreground font-mono text-xs">{formatDate(`${day}T00:00:00Z`)}</h3>
          <ol className="border-border flex flex-col gap-3 border-l pl-5">
            {dayItems.map((item) => (
              <li
                key={item.type === "release" ? `${item.project.slug}@${item.release.tag}` : item.commit.sha}
                className="relative"
              >
                <span
                  className={cn(
                    "bg-background absolute top-0.5 -left-[1.6rem] flex size-5 items-center justify-center rounded-full border",
                    item.type === "release" && "border-brand text-brand"
                  )}
                >
                  {item.type === "release" ? (
                    <TagIcon className="size-3" />
                  ) : (
                    <GitCommitHorizontalIcon className="text-muted-foreground size-3" />
                  )}
                </span>
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
                  {showProject && (
                    <Link href={routes.project(item.project.slug)} className="font-mono font-medium hover:underline">
                      {item.project.name}
                    </Link>
                  )}
                  {item.type === "release" ? (
                    <>
                      <span>released</span>
                      <a href={item.release.url} target="_blank" rel="noreferrer" className="hover:underline">
                        <Badge variant="outline" className="font-mono">
                          {item.release.tag}
                        </Badge>
                      </a>
                    </>
                  ) : (
                    <a
                      href={item.commit.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground hover:text-foreground min-w-0 break-words"
                    >
                      {item.commit.message}
                    </a>
                  )}
                </div>
                {item.type === "commit" && (
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    <span className="font-mono">{item.commit.sha.slice(0, 7)}</span> · {item.commit.author}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </li>
      ))}
    </ol>
  )
}
