import { withBasePath } from "@/lib/site"
import { cn } from "@/lib/utils"

export function Logo({ className, withText = true }: { className?: string; withText?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static export, no image optimisation */}
      <img src={withBasePath("/logo.png")} alt="" width={28} height={28} className="size-7" />
      {withText && <span className="font-mono text-sm font-semibold tracking-tight">napi-bindings</span>}
    </span>
  )
}
