"use client"

import { useTheme } from "next-themes"
import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

const COPY_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>'
const CHECK_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>'

/**
 * Renders HTML produced at build time by `renderMarkdown` (sanitised there),
 * then progressively enhances it: copy buttons on code blocks and Mermaid
 * diagrams (the Mermaid library is only downloaded by pages that use it).
 */
export function Markdown({ html, className }: { html: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const cleanups: (() => void)[] = []
    for (const pre of root.querySelectorAll<HTMLPreElement>("pre.shiki")) {
      if (pre.parentElement?.dataset.codeBlock) continue
      const wrapper = document.createElement("div")
      wrapper.dataset.codeBlock = "true"
      wrapper.className = "group/code relative"
      pre.replaceWith(wrapper)
      wrapper.append(pre)
      const button = document.createElement("button")
      button.type = "button"
      button.setAttribute("aria-label", "Copy code")
      button.innerHTML = COPY_ICON
      button.className =
        "absolute top-2 right-2 inline-flex size-7 items-center justify-center rounded-md border bg-background/80 text-muted-foreground opacity-0 transition-opacity group-hover/code:opacity-100 focus-visible:opacity-100 hover:text-foreground"
      const onClick = () => {
        void navigator.clipboard.writeText(pre.textContent ?? "").then(() => {
          button.innerHTML = CHECK_ICON
          setTimeout(() => (button.innerHTML = COPY_ICON), 1500)
        })
      }
      button.addEventListener("click", onClick)
      cleanups.push(() => button.removeEventListener("click", onClick))
      wrapper.append(button)
    }
    return () => cleanups.forEach((fn) => fn())
  }, [html])

  useEffect(() => {
    const root = ref.current
    const diagrams = root ? [...root.querySelectorAll<HTMLPreElement>("pre.mermaid")] : []
    if (diagrams.length === 0) return
    let cancelled = false
    void import("mermaid").then(async ({ default: mermaid }) => {
      if (cancelled) return
      mermaid.initialize({ startOnLoad: false, theme: resolvedTheme === "dark" ? "dark" : "neutral" })
      for (const pre of diagrams) {
        pre.dataset.source ??= pre.textContent ?? ""
        pre.removeAttribute("data-processed")
        pre.textContent = pre.dataset.source
      }
      await mermaid.run({ nodes: diagrams, suppressErrors: true })
    })
    return () => {
      cancelled = true
    }
  }, [html, resolvedTheme])

  return <div ref={ref} className={cn("markdown", className)} dangerouslySetInnerHTML={{ __html: html }} />
}
