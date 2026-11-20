import { CodeTabsClient } from "@/components/code-tabs-client"
import { highlightCode } from "@/lib/markdown"

export type CodeTab = { label: string; lang: string; code: string }

/** Highlights each snippet at build time; the tabs themselves are client-side. */
export async function CodeTabs({ tabs, className }: { tabs: CodeTab[]; className?: string }) {
  const rendered = await Promise.all(
    tabs.map(async (tab) => ({ ...tab, html: await highlightCode(tab.code, tab.lang) }))
  )
  return <CodeTabsClient tabs={rendered} className={className} />
}
