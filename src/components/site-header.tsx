"use client"

import { MenuIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { GitHubIcon } from "@/components/icons"
import { Logo } from "@/components/logo"
import { SearchCommand } from "@/components/search-command"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { mainNav, siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"

function isActive(pathname: string, href: string): boolean {
  if (href === "/node-api/") return pathname.startsWith("/node-api") && !pathname.startsWith("/node-api/reference")
  return pathname.startsWith(href.replace(/\/$/, ""))
}

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-background/80 supports-backdrop-filter:bg-background/60 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu" />}>
            <MenuIcon />
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle>
                <Logo />
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              {mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "hover:bg-muted rounded-md px-3 py-2 text-sm font-medium",
                    isActive(pathname, item.href) ? "bg-muted text-foreground" : "text-muted-foreground"
                  )}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="shrink-0" aria-label="napi-bindings home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "hover:text-foreground rounded-md px-2.5 py-1.5 text-sm transition-colors",
                isActive(pathname, item.href) ? "text-foreground font-medium" : "text-muted-foreground"
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <SearchCommand />
          <Separator orientation="vertical" className="mx-1 h-5" />
          <Button
            variant="ghost"
            size="icon"
            aria-label="napi-bindings on GitHub"
            render={<a href={siteConfig.github} target="_blank" rel="noreferrer" />}
          >
            <GitHubIcon />
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
