import { ArrowLeftIcon, ArrowRightIcon, ExternalLinkIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Markdown } from "@/components/markdown"
import { SymbolBadges } from "@/components/symbol-badges"
import { TableOfContents } from "@/components/toc"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { getSection, guideSections, nodeApi, symbolsOfSection } from "@/lib/data"
import { nodeApiLinks } from "@/lib/node-api-links"
import { renderMarkdown } from "@/lib/markdown"
import { routes } from "@/lib/site"

export const dynamicParams = false

export function generateStaticParams() {
  return guideSections.map((s) => ({ section: s.id }))
}

export async function generateMetadata({ params }: PageProps<"/node-api/docs/[section]">): Promise<Metadata> {
  const { section: id } = await params
  const section = getSection(id)
  if (!section) return {}
  return {
    title: `${section.title} · Node-API`,
    description: `Node-API guide: ${section.title}. ${section.symbols.length ? `${section.symbols.length} APIs.` : ""}`,
    alternates: { canonical: routes.section(id) },
  }
}

export default async function SectionPage({ params }: PageProps<"/node-api/docs/[section]">) {
  const { section: id } = await params
  const section = getSection(id)
  if (!section) notFound()

  const { html, toc } = await renderMarkdown(section.markdown, { links: nodeApiLinks() })
  const symbols = symbolsOfSection(section.id)
  const index = guideSections.findIndex((s) => s.id === section.id)
  const prev = guideSections[index - 1]
  const next = guideSections[index + 1]

  const groups = new Map<string, typeof symbols>()
  for (const s of symbols) {
    const key = s.group ?? section.title
    groups.set(key, [...(groups.get(key) ?? []), s])
  }

  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_13rem]">
      <article className="flex min-w-0 flex-col gap-8">
        <div className="flex flex-col gap-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href="/node-api/" />}>Node-API</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Guide</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-3xl font-semibold tracking-tight">{section.title}</h1>
          <a
            href={`${nodeApi.source.docsUrl}#${section.id}`}
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1 text-xs"
          >
            Source: Node.js documentation
            <ExternalLinkIcon className="size-3" />
          </a>
        </div>

        {html.trim() && <Markdown html={html} />}

        {symbols.length > 0 && (
          <section className="flex flex-col gap-6">
            <h2 id="apis" className="scroll-mt-20 text-xl font-semibold tracking-tight">
              APIs in this section
            </h2>
            {[...groups.entries()].map(([group, items]) => (
              <div key={group} className="flex flex-col gap-2">
                {groups.size > 1 && <h3 className="text-muted-foreground text-sm font-medium">{group}</h3>}
                <ul className="divide-y rounded-xl border">
                  {items.map((s) => (
                    <li key={s.name}>
                      <Link href={routes.symbol(s.name)} className="hover:bg-muted/50 flex flex-col gap-1 px-4 py-3">
                        <span className="flex flex-wrap items-center gap-2">
                          <code className="font-mono text-sm font-medium">{s.name}</code>
                          <SymbolBadges symbol={s} compact />
                        </span>
                        {s.summary && <span className="text-muted-foreground line-clamp-2 text-sm">{s.summary}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        <nav className="flex justify-between gap-4 border-t pt-6">
          {prev ? (
            <Button variant="ghost" render={<Link href={routes.section(prev.id)} />}>
              <ArrowLeftIcon data-icon="inline-start" />
              {prev.title}
            </Button>
          ) : (
            <span />
          )}
          {next && (
            <Button variant="ghost" render={<Link href={routes.section(next.id)} />}>
              {next.title}
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          )}
        </nav>
      </article>
      <aside className="hidden xl:block">
        <div className="sticky top-20">
          <TableOfContents
            items={[...toc, ...(symbols.length ? [{ id: "apis", text: "APIs in this section", depth: 2 as const }] : [])]}
          />
        </div>
      </aside>
    </div>
  )
}
