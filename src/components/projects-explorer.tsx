"use client"

import { SearchIcon, XIcon } from "lucide-react"
import { useMemo, useState } from "react"

import { ProjectCard } from "@/components/project-card"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { CATEGORIES, type CategoryId } from "@/config/projects"
import type { ProjectSummary } from "@/lib/project-summary"

const ALL = "all"

export function ProjectsExplorer({ projects }: { projects: ProjectSummary[] }) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string>(ALL)
  const [language, setLanguage] = useState<string>(ALL)

  const languages = useMemo(
    () => [...new Set(projects.flatMap((p) => p.languages))].sort((a, b) => a.localeCompare(b)),
    [projects]
  )
  const categories = useMemo(
    () => (Object.keys(CATEGORIES) as CategoryId[]).filter((c) => projects.some((p) => p.category === c)),
    [projects]
  )

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return projects.filter(
      (p) =>
        (category === ALL || p.category === category) &&
        (language === ALL || p.languages.includes(language)) &&
        (!q || `${p.name} ${p.tagline} ${p.languages.join(" ")} ${p.categoryLabel}`.toLowerCase().includes(q))
    )
  }, [projects, query, category, language])

  const reset = () => {
    setQuery("")
    setCategory(ALL)
    setLanguage(ALL)
  }
  const filtered = query !== "" || category !== ALL || language !== ALL

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <InputGroup className="max-w-md">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter projects…"
            aria-label="Filter projects"
          />
        </InputGroup>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="max-w-full overflow-x-auto pb-1">
            <ToggleGroup
              aria-label="Category"
              variant="outline"
              size="sm"
              value={[category]}
              onValueChange={(value: string[]) => setCategory(value[0] ?? ALL)}
            >
              <ToggleGroupItem value={ALL}>All</ToggleGroupItem>
              {categories.map((c) => (
                <ToggleGroupItem key={c} value={c}>
                  {CATEGORIES[c].label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <ToggleGroup
            aria-label="Language"
            size="sm"
            value={[language]}
            onValueChange={(value: string[]) => setLanguage(value[0] ?? ALL)}
            className="flex-wrap"
          >
            <ToggleGroupItem value={ALL} className="font-mono text-xs">
              any language
            </ToggleGroupItem>
            {languages.map((l) => (
              <ToggleGroupItem key={l} value={l} className="font-mono text-xs">
                {l}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {filtered && (
            <Button variant="ghost" size="sm" onClick={reset}>
              <XIcon data-icon="inline-start" />
              Reset
            </Button>
          )}
        </div>
      </div>

      <p className="text-muted-foreground text-sm" aria-live="polite">
        {visible.length} of {projects.length} projects
      </p>

      {visible.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      ) : (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyTitle>No project matches these filters</EmptyTitle>
            <EmptyDescription>Try another category or language.</EmptyDescription>
          </EmptyHeader>
          <Button variant="outline" size="sm" onClick={reset}>
            Reset filters
          </Button>
        </Empty>
      )}
    </div>
  )
}
