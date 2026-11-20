import { CheckIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { CodeTabs } from "@/components/code-tabs"
import { CopyButton } from "@/components/copy-button"
import { Markdown } from "@/components/markdown"
import { TableOfContents } from "@/components/toc"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getProject, projects } from "@/lib/data"
import { renderMarkdown } from "@/lib/markdown"
import { repoLinks } from "@/lib/repo-links"
import { routes } from "@/lib/site"
import { formatCount, formatDate } from "@/lib/utils"

export const dynamicParams = false

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) return {}
  return {
    title: project.name,
    description: project.tagline,
    alternates: { canonical: routes.project(slug) },
    openGraph: { title: project.name, description: project.tagline },
  }
}

function LanguageBar({ languages }: { languages: Record<string, number> }) {
  const entries = Object.entries(languages).sort((a, b) => b[1] - a[1])
  const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0)
  if (!total) return null
  const shown = entries.filter(([, bytes]) => bytes / total >= 0.01).slice(0, 6)
  const opacity = [1, 0.75, 0.55, 0.4, 0.3, 0.22]
  return (
    <div className="flex flex-col gap-2">
      <div className="bg-muted flex h-2 overflow-hidden rounded-full" aria-hidden>
        {shown.map(([lang, bytes], i) => (
          <span
            key={lang}
            className="bg-brand h-full"
            style={{ width: `${(bytes / total) * 100}%`, opacity: opacity[i] ?? 0.2 }}
          />
        ))}
      </div>
      <ul className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 text-xs">
        {shown.map(([lang, bytes]) => (
          <li key={lang}>
            {lang} <span className="font-mono">{((bytes / total) * 100).toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) notFound()

  const { data } = project
  const { html, toc } = await renderMarkdown(data.readme, { links: repoLinks(project, "README.md"), dropTitle: true })
  const related = project.related
    .map((r) => ({ ...r, project: getProject(r.slug) }))
    .filter((r) => r.project !== undefined)

  const facts: [string, string][] = [
    ["Default branch", data.meta.defaultBranch],
    ["Last commit", formatDate(data.commits[0]?.date)],
    ["Open issues", formatCount(data.meta.openIssues)],
    ["Documents", String(data.docs.length)],
  ]

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <article className="min-w-0">
        <Markdown html={html} />
      </article>

      <aside className="flex flex-col gap-4 lg:order-none">
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-medium">Get started</h2>
          <CodeTabs tabs={project.install} />
        </div>

        {data.npm.length > 0 && (
          <Card size="sm">
            <CardHeader>
              <CardTitle>npm</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {data.npm.map((pkg) => (
                <div key={pkg.name} className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 flex-col">
                    <a
                      href={`https://www.npmjs.com/package/${pkg.name}`}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate font-mono text-sm hover:underline"
                    >
                      {pkg.name}
                    </a>
                    <span className="text-muted-foreground text-xs">
                      {pkg.version ? `v${pkg.version}` : "—"}
                      {pkg.weeklyDownloads !== null && ` · ${formatCount(pkg.weeklyDownloads)} weekly downloads`}
                    </span>
                  </div>
                  <CopyButton value={`npm install ${pkg.name}`} label={`Copy npm install ${pkg.name}`} />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card size="sm">
          <CardHeader>
            <CardTitle>Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-sm">
              {project.highlights.map((h) => (
                <li key={h} className="flex gap-2">
                  <CheckIcon className="text-brand mt-0.5 size-4 shrink-0" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle>Repository</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {facts.map(([label, value]) => (
                <div key={label} className="flex flex-col">
                  <dt className="text-muted-foreground text-xs">{label}</dt>
                  <dd className="font-mono text-xs">{value}</dd>
                </div>
              ))}
            </dl>
            <LanguageBar languages={data.languages} />
            {data.meta.topics.length > 0 && (
              <>
                <Separator />
                <div className="flex flex-wrap gap-1">
                  {data.meta.topics.map((t) => (
                    <Badge key={t} variant="secondary" className="font-mono">
                      {t}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {related.length > 0 && (
          <Card size="sm">
            <CardHeader>
              <CardTitle>Related projects</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {related.map((r) => (
                <Link key={r.slug} href={routes.project(r.slug)} className="group flex flex-col gap-0.5">
                  <span className="font-mono text-sm group-hover:underline">{r.project?.name}</span>
                  <span className="text-muted-foreground text-xs">{r.reason}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="hidden pt-2 lg:block">
          <TableOfContents items={toc.filter((t) => t.depth === 2)} />
        </div>
      </aside>
    </div>
  )
}
