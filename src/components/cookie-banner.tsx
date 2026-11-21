"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { setConsent } from "@/lib/analytics-consent"

/** A small, non-blocking notice: both choices have the same weight. */
export function CookieBanner() {
  return (
    <section
      aria-label="Cookie consent"
      className="bg-popover text-popover-foreground animate-in fade-in slide-in-from-bottom-2 fixed inset-x-3 bottom-3 z-50 flex flex-col gap-3 rounded-xl border p-4 text-sm shadow-lg motion-reduce:animate-none sm:inset-x-auto sm:right-4 sm:bottom-4 sm:max-w-sm"
    >
      <p className="text-muted-foreground text-pretty">
        We use Google Analytics cookies to count page views, only if you agree.{" "}
        <Link href="/privacy/" className="text-foreground underline underline-offset-4">
          Privacy
        </Link>
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => setConsent(false)}>
          Decline
        </Button>
        <Button variant="outline" size="sm" onClick={() => setConsent(true)}>
          Accept
        </Button>
      </div>
    </section>
  )
}
