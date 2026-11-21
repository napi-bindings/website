"use client"

import { GoogleAnalytics } from "@next/third-parties/google"

import { CookieBanner } from "@/components/cookie-banner"
import { GA_ID, useConsent } from "@/lib/analytics-consent"

/**
 * Google Analytics 4, page views only. The Google tag is mounted after the
 * visitor accepts; navigations between pages are measured by GA4 itself
 * ("Page changes based on browser history events" in Enhanced measurement).
 */
export function Analytics() {
  const consent = useConsent()

  if (!GA_ID) return null
  if (consent === "granted") {
    return <GoogleAnalytics gaId={GA_ID} debugMode={process.env.NODE_ENV === "development"} />
  }
  if (consent === "unset") return <CookieBanner />
  return null
}
