"use client"

import { SearchIcon, XIcon } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { NodeApiSymbol } from "@/lib/data-schema"
import { routes } from "@/lib/site"

export type ApiRow = Pick<
  NodeApiSymbol,
  "name" | "kind" | "napiVersion" | "experimental" | "deprecated" | "header" | "section" | "sectionId" | "summary"
>

const KINDS = ["function", "type", "callback", "macro"] as const
const HEADERS = ["js_native_api.h", "node_api.h"] as const

export function ApiExplorer({ rows, latest }: { rows: ApiRow[]; latest: number }) {
  const [query, setQuery] = useState("")
  const [kinds, setKinds] = useState<string[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [maxVersion, setMaxVersion] = useState<string>("any")

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((r) => {
      if (q && !`${r.name} ${r.summary} ${r.section}`.toLowerCase().includes(q)) return false
      if (kinds.length && !kinds.includes(r.kind)) return false
      if (headers.length && (!r.header || !headers.includes(r.header))) return false
      if (maxVersion === "experimental") return r.experimental
      if (maxVersion !== "any") {
        if (r.experimental || r.napiVersion === null) return false
        return r.napiVersion <= Number(maxVersion)
      }
      return true
    })
  }, [rows, query, kinds, headers, maxVersion])

  const sections = useMemo(() => {
    const map = new Map<string, ApiRow[]>()
    for (const r of visible) map.set(r.section, [...(map.get(r.section) ?? []), r])
    return [...map.entries()]
  }, [visible])

  const filtered = query !== "" || kinds.length > 0 || headers.length > 0 || maxVersion !== "any"
  const reset = () => {
    setQuery("")
    setKinds([])
    setHeaders([])
    setMaxVersion("any")
  }

  const versions = Array.from({ length: latest }, (_, i) => String(i + 1))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <InputGroup className="max-w-xl">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="napi_create_string_utf8, thread-safe, wrap…"
            aria-label="Search the Node-API reference"
            className="font-mono text-sm"
          />
          <InputGroupAddon align="inline-end">
            <InputGroupText>{visible.length}</InputGroupText>
          </InputGroupAddon>
        </InputGroup>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <ToggleGroup multiple aria-label="Kind" size="sm" variant="outline" value={kinds} onValueChange={setKinds}>
            {KINDS.map((k) => (
              <ToggleGroupItem key={k} value={k}>
                {k}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <ToggleGroup
            multiple
            aria-label="Header"
            size="sm"
            variant="outline"
            value={headers}
            onValueChange={setHeaders}
          >
            {HEADERS.map((h) => (
              <ToggleGroupItem key={h} value={h} className="font-mono text-xs">
                {h}
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

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-xs">Available in Node-API</span>
          <ToggleGroup
            aria-label="Available in Node-API version"
            size="sm"
            value={[maxVersion]}
            onValueChange={(value: string[]) => setMaxVersion(value[0] ?? "any")}
            className="flex-wrap"
          >
            <ToggleGroupItem value="any" className="text-xs">
              any
            </ToggleGroupItem>
            {versions.map((v) => (
              <ToggleGroupItem key={v} value={v} className="font-mono text-xs" aria-label={`Node-API ${v} or lower`}>
                ≤{v}
              </ToggleGroupItem>
            ))}
            <ToggleGroupItem value="experimental" className="text-xs">
              experimental
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {sections.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyTitle>No API matches</EmptyTitle>
            <EmptyDescription>Change the search or the filters.</EmptyDescription>
          </EmptyHeader>
          <Button variant="outline" size="sm" onClick={reset}>
            Reset filters
          </Button>
        </Empty>
      ) : (
        <div className="flex flex-col gap-8">
          {sections.map(([section, items]) => (
            <section key={section} className="flex flex-col gap-2">
              <h2 className="text-sm font-medium">
                <Link href={routes.section(items[0]?.sectionId ?? "")} className="hover:underline">
                  {section}
                </Link>
                <span className="text-muted-foreground ml-2 font-mono text-xs">{items.length}</span>
              </h2>
              <div className="overflow-hidden rounded-xl border">
                <Table className="table-fixed">
                  <TableHeader className="sr-only">
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Summary</TableHead>
                      <TableHead>Version</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((r) => (
                      <TableRow key={r.name} className="relative">
                        <TableCell className="w-[45%] py-2.5 sm:w-[38%]">
                          <Link
                            href={routes.symbol(r.name)}
                            className="block truncate font-mono text-[0.8125rem] font-medium after:absolute after:inset-0 hover:underline"
                          >
                            {r.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground hidden truncate py-2.5 sm:table-cell">
                          {r.summary}
                        </TableCell>
                        <TableCell className="w-28 py-2.5 text-right">
                          <span className="inline-flex flex-wrap justify-end gap-1">
                            {r.experimental ? (
                              <Badge variant="destructive">experimental</Badge>
                            ) : r.napiVersion !== null ? (
                              <Badge variant="outline" className="font-mono">
                                v{r.napiVersion}
                              </Badge>
                            ) : (
                              <Badge variant="ghost">{r.kind}</Badge>
                            )}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
