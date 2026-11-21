"use client"

import { GA_ID, revokeConsent } from "@/lib/analytics-consent"
import { cn } from "@/lib/utils"

/** Withdraws the analytics choice and shows the banner again. */
export function CookiePreferences({ className, label = "Cookie preferences" }: { className?: string; label?: string }) {
  if (!GA_ID) return null
  return (
    <button type="button" onClick={revokeConsent} className={cn("hover:text-foreground cursor-pointer", className)}>
      {label}
    </button>
  )
}
