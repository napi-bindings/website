"use client"

import { SearchIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import type { SearchEntry } from "@/lib/search"
import { withBasePath } from "@/lib/site"
import { cn } from "@/lib/utils"

const GROUP_ORDER = ["Pages", "Projects", "Node-API guide", "Node-API reference", "Project docs"]

export function SearchCommand({ className }: { className?: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [entries, setEntries] = useState<SearchEntry[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.key === "k" && (event.metaKey || event.ctrlKey)) || (event.key === "/" && !isTyping(event))) {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  // The index is a static file; load it the first time the palette opens.
  useEffect(() => {
    if (!open || entries) return
    let cancelled = false
    fetch(withBasePath("/search-index.json"))
      .then((res) => (res.ok ? (res.json() as Promise<SearchEntry[]>) : Promise.reject(new Error(res.statusText))))
      .then((data) => !cancelled && setEntries(data))
      .catch(() => !cancelled && setFailed(true))
    return () => {
      cancelled = true
    }
  }, [open, entries])

  const groups = useMemo(() => {
    const map = new Map<string, SearchEntry[]>()
    for (const entry of entries ?? []) map.set(entry.group, [...(map.get(entry.group) ?? []), entry])
    return [...map.entries()].sort(
      ([a], [b]) => GROUP_ORDER.indexOf(a) - GROUP_ORDER.indexOf(b)
    )
  }, [entries])

  const go = useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router]
  )

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className={cn(
          "text-muted-foreground size-8 justify-between px-0 font-normal sm:w-60 sm:px-2.5",
          className
        )}
      >
        <span className="flex w-full items-center justify-center gap-2 sm:justify-start">
          <SearchIcon />
          <span className="hidden sm:inline">Search docs and APIs…</span>
        </span>
        <KbdGroup className="hidden sm:inline-flex">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search"
        description="Search pages, projects and the Node-API reference"
      >
        <Command>
          <CommandInput placeholder="napi_create_function, marmotta, versions…" />
          <CommandList>
            <CommandEmpty>
              {failed ? "The search index could not be loaded." : entries ? "No results." : "Loading…"}
            </CommandEmpty>
            {groups.map(([group, items]) => (
              <CommandGroup key={group} heading={group}>
                {items.map((item) => (
                  <CommandItem
                    key={item.href + item.title}
                    value={`${item.title} ${item.description ?? ""} ${item.group}`}
                    onSelect={() => go(item.href)}
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className={cn("truncate", item.mono && "font-mono text-[0.8125rem]")}>{item.title}</span>
                      {item.description && (
                        <span className="text-muted-foreground truncate text-xs">{item.description}</span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}

function isTyping(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement | null
  return !!target && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
}
