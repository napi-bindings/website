"use client"

import { CopyButton } from "@/components/copy-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type RenderedTab = { label: string; lang: string; code: string; html: string }

export function CodeTabsClient({ tabs, className }: { tabs: RenderedTab[]; className?: string }) {
  const first = tabs[0]
  if (!first) return null
  return (
    <Tabs defaultValue={first.label} className={cn("bg-muted/40 gap-0 overflow-hidden rounded-xl border", className)}>
      <div className="flex items-center justify-between gap-2 border-b px-2 py-1.5">
        <TabsList variant="line" className="h-8">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.label} value={tab.label} className="text-xs">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {tabs.map((tab) => (
        <TabsContent key={tab.label} value={tab.label} className="relative">
          <CopyButton value={tab.code} label="Copy snippet" className="absolute top-2 right-2" />
          <div
            className="overflow-x-auto text-[0.8125rem] leading-relaxed [&_pre]:bg-transparent! [&_pre]:px-4 [&_pre]:py-3 [&_pre]:pr-12"
            dangerouslySetInnerHTML={{ __html: tab.html }}
          />
        </TabsContent>
      ))}
    </Tabs>
  )
}
