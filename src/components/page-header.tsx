import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-3 pb-8", className)}>
      {eyebrow && <div className="text-brand font-mono text-xs font-medium tracking-wide uppercase">{eyebrow}</div>}
      <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h1>
      {description && <p className="text-muted-foreground max-w-3xl text-base text-pretty sm:text-lg">{description}</p>}
      {children && <div className="flex flex-wrap items-center gap-2 pt-2">{children}</div>}
    </div>
  )
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6", className)}>{children}</div>
}
