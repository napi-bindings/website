import "server-only"

import { nodeApi } from "@/lib/data"
import type { NodeApiLinkContext } from "@/lib/markdown"

let context: NodeApiLinkContext | undefined

/** Link context for Markdown taken from the Node.js documentation. */
export function nodeApiLinks(): NodeApiLinkContext {
  context ??= {
    kind: "node-api",
    symbols: new Set(nodeApi.symbols.map((s) => s.anchor)),
    sections: new Set(nodeApi.sections.map((s) => s.id)),
  }
  return context
}
