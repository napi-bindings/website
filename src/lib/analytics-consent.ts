import { useSyncExternalStore } from "react"

/**
 * Consent for Google Analytics.
 *
 * Google Analytics is loaded only after the visitor accepts (Google's "basic"
 * consent mode): before that, no request reaches Google. The choice is kept in
 * localStorage for six months, then the banner asks again. The measurement ID
 * is inlined at build time; when it is empty (local development, pull request
 * builds) there is neither banner nor tracking.
 */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? ""

/** `unknown` is the value during the static render, before the browser is read. */
export type ConsentState = "unknown" | "unset" | "granted" | "denied"

interface StoredConsent {
  v: 1
  granted: boolean
  at: number
}

const STORAGE_KEY = "napi-bindings:analytics-consent"
const CHANGE_EVENT = "napi-bindings:analytics-consent-change"
const MAX_AGE_MS = 182 * 24 * 60 * 60 * 1000

/** Used when localStorage is unavailable, so the choice holds for the current page view. */
let memoryConsent: StoredConsent | null = null

function isStoredConsent(value: unknown): value is StoredConsent {
  if (typeof value !== "object" || value === null) return false
  const record = value as Record<string, unknown>
  return record.v === 1 && typeof record.granted === "boolean" && typeof record.at === "number"
}

function toState(consent: StoredConsent | null): ConsentState {
  if (!consent || Date.now() - consent.at > MAX_AGE_MS) return "unset"
  return consent.granted ? "granted" : "denied"
}

function readConsent(): ConsentState {
  if (memoryConsent) return toState(memoryConsent)
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return "unset"
    const parsed: unknown = JSON.parse(raw)
    return isStoredConsent(parsed) ? toState(parsed) : "unset"
  } catch {
    return "unset"
  }
}

function subscribe(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === STORAGE_KEY) onChange()
  }
  window.addEventListener(CHANGE_EVENT, onChange)
  window.addEventListener("storage", onStorage)
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange)
    window.removeEventListener("storage", onStorage)
  }
}

export function useConsent(): ConsentState {
  return useSyncExternalStore(subscribe, readConsent, () => "unknown")
}

export function setConsent(granted: boolean): void {
  const consent: StoredConsent = { v: 1, granted, at: Date.now() }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent))
    memoryConsent = null
  } catch {
    memoryConsent = consent
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

/** Deletes `_ga` and `_ga_<id>` on the current host and on every parent domain. */
function deleteAnalyticsCookies(): void {
  const names = document.cookie
    .split(";")
    .map((cookie) => cookie.split("=")[0]?.trim() ?? "")
    .filter((name) => name === "_ga" || name.startsWith("_ga_"))
  const labels = window.location.hostname.split(".")
  const domains = [""]
  for (let i = 0; i < labels.length - 1; i++) domains.push(`; domain=.${labels.slice(i).join(".")}`)
  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`
    }
  }
}

/**
 * Withdraws the choice: stops Google Analytics, deletes its cookies and
 * reloads, so the page comes back without the Google tag and with the banner.
 */
export function revokeConsent(): void {
  if (GA_ID) (window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = true
  deleteAnalyticsCookies()
  memoryConsent = null
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing stored: the reload alone shows the banner again.
  }
  window.location.reload()
}
