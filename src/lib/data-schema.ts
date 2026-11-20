/**
 * Shapes of the JSON files in `src/generated/`, written at build time by
 * `scripts/sync-data.ts` and read by the pages. Shared by both sides so that
 * the build fails loudly when the data drifts from what the UI expects.
 */
import { z } from "zod"

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

export const RepoMetaSchema = z.object({
  description: z.string().nullable(),
  homepage: z.string().nullable(),
  language: z.string().nullable(),
  stars: z.number().int().nullable(),
  forks: z.number().int().nullable(),
  openIssues: z.number().int().nullable(),
  license: z.string().nullable(),
  topics: z.array(z.string()),
  defaultBranch: z.string(),
  pushedAt: z.string().nullable(),
})
export type RepoMeta = z.infer<typeof RepoMetaSchema>

export const ReleaseSchema = z.object({
  tag: z.string(),
  name: z.string(),
  publishedAt: z.string().nullable(),
  url: z.string(),
  prerelease: z.boolean(),
  /** Release notes in GitHub-flavoured Markdown, empty when unknown. */
  body: z.string(),
})
export type Release = z.infer<typeof ReleaseSchema>

export const CommitSchema = z.object({
  sha: z.string(),
  message: z.string(),
  author: z.string(),
  date: z.string(),
  url: z.string(),
})
export type Commit = z.infer<typeof CommitSchema>

export const ProjectDocSchema = z.object({
  /** Path in the repository, for example `docs/guide.md`. */
  path: z.string(),
  /** URL segments under /projects/<slug>/docs/. */
  slug: z.array(z.string()).min(1),
  title: z.string(),
  /** Top-level directory, used to group the documentation sidebar. */
  group: z.string(),
  markdown: z.string(),
})
export type ProjectDoc = z.infer<typeof ProjectDocSchema>

export const NpmPackageSchema = z.object({
  name: z.string(),
  version: z.string().nullable(),
  weeklyDownloads: z.number().int().nullable(),
})

export const ProjectDataSchema = z.object({
  slug: z.string(),
  repo: z.string(),
  meta: RepoMetaSchema,
  languages: z.record(z.string(), z.number()),
  releases: z.array(ReleaseSchema),
  commits: z.array(CommitSchema),
  readme: z.string(),
  changelog: z.string().nullable(),
  docs: z.array(ProjectDocSchema),
  npm: z.array(NpmPackageSchema),
  /** ISO date of the last successful synchronisation of this project. */
  syncedAt: z.string(),
})
export type ProjectData = z.infer<typeof ProjectDataSchema>

export const ProjectsFileSchema = z.object({
  generatedAt: z.string(),
  projects: z.array(ProjectDataSchema),
})
export type ProjectsFile = z.infer<typeof ProjectsFileSchema>

/* ------------------------------------------------------------------ */
/* Node-API reference (parsed from nodejs/node doc/api/n-api.md)        */
/* ------------------------------------------------------------------ */

export const SymbolKindSchema = z.enum(["function", "type", "callback", "macro"])
export type SymbolKind = z.infer<typeof SymbolKindSchema>

export const NodeApiSymbolSchema = z.object({
  name: z.string(),
  /** Anchor used by the official documentation. */
  anchor: z.string(),
  kind: SymbolKindSchema,
  sectionId: z.string(),
  section: z.string(),
  /** Heading between the section and the symbol, if any (e.g. "Exceptions"). */
  group: z.string().nullable(),
  /** Node.js versions listed in `added:`. */
  added: z.array(z.string()),
  napiVersion: z.number().int().nullable(),
  experimental: z.boolean(),
  deprecated: z.boolean(),
  /** Declared in js_native_api.h (engine independent) or node_api.h. */
  header: z.enum(["js_native_api.h", "node_api.h"]).nullable(),
  /** First C code block of the entry. */
  signature: z.string().nullable(),
  /** One-sentence summary, plain text. */
  summary: z.string(),
  /** Full entry in Markdown, with reference links resolved. */
  markdown: z.string(),
})
export type NodeApiSymbol = z.infer<typeof NodeApiSymbolSchema>

export const NodeApiSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  /** Prose of the section that is not part of a symbol entry. */
  markdown: z.string(),
  symbols: z.array(z.string()),
})
export type NodeApiSection = z.infer<typeof NodeApiSectionSchema>

export const NodeApiFileSchema = z.object({
  generatedAt: z.string(),
  source: z.object({ url: z.string(), docsUrl: z.string() }),
  versionMatrix: z.array(z.object({ version: z.string(), supportedIn: z.string() })),
  sections: z.array(NodeApiSectionSchema),
  symbols: z.array(NodeApiSymbolSchema),
})
export type NodeApiFile = z.infer<typeof NodeApiFileSchema>

/* ------------------------------------------------------------------ */
/* Ecosystem (parsed from nodejs/abi-stable-node)                       */
/* ------------------------------------------------------------------ */

export const EcosystemEntrySchema = z.object({
  name: z.string(),
  url: z.string(),
  language: z.string(),
  /** Slug of a napi-bindings project when the entry is one of ours. */
  project: z.string().nullable(),
})
export type EcosystemEntry = z.infer<typeof EcosystemEntrySchema>

export const MediaEntrySchema = z.object({
  title: z.string(),
  speakers: z.string(),
  date: z.string(),
  url: z.string(),
  thumbnail: z.string().nullable(),
})
export type MediaEntry = z.infer<typeof MediaEntrySchema>

export const EcosystemFileSchema = z.object({
  generatedAt: z.string(),
  languages: z.array(EcosystemEntrySchema),
  experimentalLanguages: z.array(EcosystemEntrySchema),
  runtimes: z.array(EcosystemEntrySchema),
  media: z.array(MediaEntrySchema),
})
export type EcosystemFile = z.infer<typeof EcosystemFileSchema>
