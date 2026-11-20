import { ExternalLinkIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { ReactNode } from "react"

import { Markdown } from "@/components/markdown"
import { SymbolBadges } from "@/components/symbol-badges"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSymbol, nodeApi, symbolsOfSection } from "@/lib/data"
import { renderMarkdown } from "@/lib/markdown"
import { nodeApiLinks } from "@/lib/node-api-links"
import { routes } from "@/lib/site"

export const dynamicParams = false

export function generateStaticParams() {
  return nodeApi.symbols.map((s) => ({ symbol: s.name }))
}

export async function generateMetadata({ params }: PageProps<"/node-api/reference/[symbol]">): Promise<Metadata> {
  const { symbol: name } = await params
  const symbol = getSymbol(name)
  if (!symbol) return {}
  return {
    title: `${symbol.name} · Node-API reference`,
    description: symbol.summary || `${symbol.name}: Node-API ${symbol.kind} documentation.`,
    alternates: { canonical: routes.symbol(symbol.name) },
  }
}

/** napi-bindings implementations that cover every stable Node-API function. */
const IMPLEMENTED_BY = [
  { slug: "quickjs-napi", label: "quickjs-napi", note: "QuickJS host, Node-API 10" },
  { slug: "napi-go", label: "napi-go/sys", note: "Go bindings, generated 1:1" },
]

export default async function SymbolPage({ params }: PageProps<"/node-api/reference/[symbol]">) {
  const { symbol: name } = await params
  const symbol = getSymbol(name)
  if (!symbol) notFound()

  const { html } = await renderMarkdown(symbol.markdown, { links: nodeApiLinks() })
  const siblings = symbolsOfSection(symbol.sectionId).filter((s) => s.group === symbol.group && s.name !== symbol.name)
  const stableFunction = symbol.kind === "function" && !symbol.experimental && symbol.napiVersion !== null

  const facts: [string, ReactNode][] = [
    ["Kind", symbol.kind],
    ["Node-API version", symbol.experimental ? "experimental (NAPI_EXPERIMENTAL)" : (symbol.napiVersion ?? "not listed")],
    ["Added in", symbol.added.length ? symbol.added.join(", ") : "—"],
    ["Header", symbol.header ?? "—"],
    [
      "Section",
      <Link key="s" href={routes.section(symbol.sectionId)} className="text-brand hover:underline">
        {symbol.section}
      </Link>,
    ],
  ]

  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_16rem]">
      <article className="flex min-w-0 flex-col gap-8">
        <div className="flex flex-col gap-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href="/node-api/reference/" />}>Reference</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href={routes.section(symbol.sectionId)} />}>{symbol.section}</BreadcrumbLink>
              </BreadcrumbItem>
              {symbol.group && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{symbol.group}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="font-mono text-2xl font-semibold tracking-tight break-all sm:text-3xl">{symbol.name}</h1>
          <SymbolBadges symbol={symbol} />
          {symbol.summary && <p className="text-muted-foreground max-w-3xl text-lg text-pretty">{symbol.summary}</p>}
        </div>
        <Markdown html={html} />
        <a
          href={`${nodeApi.source.docsUrl}#${symbol.anchor}`}
          target="_blank"
          rel="noreferrer"
          className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1 border-t pt-6 text-sm"
        >
          View in the official Node.js documentation
          <ExternalLinkIcon className="size-3.5" />
        </a>
      </article>

      <aside className="flex flex-col gap-4">
        <Card size="sm">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              {facts.map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="min-w-0 font-mono text-xs leading-5 break-words">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        {stableFunction && (
          <Card size="sm">
            <CardHeader>
              <CardTitle>Also implemented by</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              {IMPLEMENTED_BY.map((impl) => (
                <Link key={impl.slug} href={routes.project(impl.slug)} className="group flex flex-col">
                  <span className="font-mono group-hover:underline">{impl.label}</span>
                  <span className="text-muted-foreground text-xs">{impl.note}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

        {siblings.length > 0 && (
          <Card size="sm">
            <CardHeader>
              <CardTitle>{symbol.group ?? symbol.section}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-1">
                {siblings.map((s) => (
                  <li key={s.name}>
                    <Link
                      href={routes.symbol(s.name)}
                      className="text-muted-foreground hover:text-foreground block truncate font-mono text-xs"
                    >
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </aside>
    </div>
  )
}
