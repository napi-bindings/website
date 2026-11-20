import "server-only"

import ecosystemJson from "@/generated/ecosystem.json"
import nodeApiJson from "@/generated/node-api.json"
import projectsJson from "@/generated/projects.json"

import { CATEGORIES, PROJECTS, type ProjectConfig } from "@/config/projects"
import {
  EcosystemFileSchema,
  NodeApiFileSchema,
  ProjectsFileSchema,
  type Commit,
  type NodeApiSymbol,
  type ProjectData,
  type ProjectDoc,
  type Release,
} from "@/lib/data-schema"
import type { ProjectSummary } from "@/lib/project-summary"

// Validated once per build: a malformed sync output fails `next build`.
const projectsFile = ProjectsFileSchema.parse(projectsJson)
const nodeApiFile = NodeApiFileSchema.parse(nodeApiJson)
const ecosystemFile = EcosystemFileSchema.parse(ecosystemJson)

export type Project = ProjectConfig & { data: ProjectData }

export const projects: Project[] = PROJECTS.map((config) => {
  const data = projectsFile.projects.find((p) => p.slug === config.slug)
  if (!data) throw new Error(`No synchronised data for "${config.slug}": run npm run sync`)
  return { ...config, data }
})

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}

export function categoryLabel(project: ProjectConfig): string {
  return CATEGORIES[project.category].label
}

export function latestRelease(project: Project): Release | undefined {
  return project.data.releases.find((r) => !r.prerelease) ?? project.data.releases[0]
}

export function summarize(project: Project): ProjectSummary {
  const release = latestRelease(project)
  return {
    slug: project.slug,
    name: project.name,
    repo: project.repo,
    tagline: project.tagline,
    category: project.category,
    categoryLabel: categoryLabel(project),
    languages: project.languages,
    status: project.status ?? null,
    stars: project.data.meta.stars,
    forks: project.data.meta.forks,
    license: project.data.meta.license,
    latestTag: release?.tag ?? null,
    latestDate: release?.publishedAt ?? null,
    lastCommit: project.data.commits[0]?.date ?? null,
    npm: project.npm?.[0] ?? null,
    docsCount: project.data.docs.length,
  }
}

export function findDoc(project: Project, slug: string[]): ProjectDoc | undefined {
  const key = slug.join("/")
  return project.data.docs.find((d) => d.slug.join("/") === key)
}

export type ActivityItem =
  | { type: "release"; date: string; project: Project; release: Release }
  | { type: "commit"; date: string; project: Project; commit: Commit }

/** Releases and commits of every project, newest first. */
export function activity(options: { limit?: number; slug?: string } = {}): ActivityItem[] {
  const items: ActivityItem[] = []
  for (const project of projects) {
    if (options.slug && project.slug !== options.slug) continue
    for (const release of project.data.releases) {
      if (release.publishedAt) items.push({ type: "release", date: release.publishedAt, project, release })
    }
    for (const commit of project.data.commits) {
      items.push({ type: "commit", date: commit.date, project, commit })
    }
  }
  items.sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
  return options.limit ? items.slice(0, options.limit) : items
}

export const dataGeneratedAt = projectsFile.generatedAt

/* Node-API ----------------------------------------------------------- */

export const nodeApi = nodeApiFile
export const ecosystem = ecosystemFile

const symbolsByName = new Map(nodeApi.symbols.map((s) => [s.name, s]))

export function getSymbol(name: string): NodeApiSymbol | undefined {
  return symbolsByName.get(name)
}

export function getSection(id: string) {
  return nodeApi.sections.find((s) => s.id === id)
}

/** Upstream sections that hold prose: shown as guide pages. */
export const guideSections = nodeApi.sections.filter((s) => s.markdown.trim().length > 0 || s.symbols.length > 0)

/** Symbols listed by a section, including ones documented first elsewhere. */
export function symbolsOfSection(id: string): NodeApiSymbol[] {
  const names = new Set(getSection(id)?.symbols ?? [])
  return [...names].map((name) => symbolsByName.get(name)).filter((s): s is NodeApiSymbol => s !== undefined)
}

/** Highest Node-API version documented, e.g. 10. */
export const latestNapiVersion = Math.max(...nodeApi.versionMatrix.map((v) => Number(v.version)).filter(Number.isFinite))

export function symbolsByVersion(): Map<number | null, NodeApiSymbol[]> {
  const map = new Map<number | null, NodeApiSymbol[]>()
  for (const s of nodeApi.symbols) {
    const key = s.experimental ? null : s.napiVersion
    map.set(key, [...(map.get(key) ?? []), s])
  }
  return map
}
