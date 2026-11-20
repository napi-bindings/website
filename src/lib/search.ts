/** One entry of /search-index.json, consumed by the command palette. */
export type SearchEntry = {
  group: string
  title: string
  href: string
  description?: string
  /** Render the title in the monospace font (API symbols). */
  mono?: boolean
}
