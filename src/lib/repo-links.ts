import "server-only"

import type { Project } from "@/lib/data"
import type { RepoLinkContext } from "@/lib/markdown"

const docMaps = new WeakMap<Project, Map<string, string[]>>()

/** Link context for a Markdown file of a project's repository. */
export function repoLinks(project: Project, path: string): RepoLinkContext {
  let docs = docMaps.get(project)
  if (!docs) {
    docs = new Map(project.data.docs.map((d) => [d.path.toLowerCase(), d.slug]))
    docMaps.set(project, docs)
  }
  return {
    kind: "repo",
    slug: project.slug,
    repo: project.repo,
    branch: project.data.meta.defaultBranch,
    path,
    docs,
    hasChangelog: project.data.changelog !== null,
  }
}
