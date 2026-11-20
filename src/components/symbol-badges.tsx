import { Badge } from "@/components/ui/badge"
import type { NodeApiSymbol } from "@/lib/data-schema"

const KIND_LABEL: Record<NodeApiSymbol["kind"], string> = {
  function: "function",
  type: "type",
  callback: "callback",
  macro: "macro",
}

export function SymbolBadges({ symbol, compact = false }: { symbol: NodeApiSymbol; compact?: boolean }) {
  return (
    <span className="flex flex-wrap items-center gap-1">
      {!compact && <Badge variant="secondary">{KIND_LABEL[symbol.kind]}</Badge>}
      {symbol.experimental ? (
        <Badge variant="destructive">experimental</Badge>
      ) : symbol.napiVersion !== null ? (
        <Badge variant="outline" className="font-mono">
          v{symbol.napiVersion}
        </Badge>
      ) : null}
      {symbol.deprecated && <Badge variant="destructive">deprecated</Badge>}
      {!compact && symbol.header && (
        <Badge variant="outline" className="font-mono">
          {symbol.header}
        </Badge>
      )}
    </span>
  )
}
