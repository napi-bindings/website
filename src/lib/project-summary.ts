import type { CategoryId } from "@/config/projects"

/** Serializable subset of a project, passed to client components. */
export type ProjectSummary = {
  slug: string
  name: string
  repo: string
  tagline: string
  category: CategoryId
  categoryLabel: string
  languages: string[]
  status: string | null
  stars: number | null
  forks: number | null
  license: string | null
  latestTag: string | null
  latestDate: string | null
  lastCommit: string | null
  npm: string | null
  docsCount: number
}
