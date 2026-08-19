import { ConvexError } from "convex/values"

export function cleanText(value: string, field: string, maxLength: number) {
  const cleaned = value.trim()
  if (cleaned.length === 0 || cleaned.length > maxLength) {
    throw new ConvexError(
      `${field} must be between 1 and ${maxLength} characters`
    )
  }
  return cleaned
}

export function optionalText(
  value: string | undefined,
  field: string,
  maxLength: number
) {
  if (value === undefined) return undefined
  const cleaned = value.trim()
  if (cleaned.length === 0) return undefined
  if (cleaned.length > maxLength) {
    throw new ConvexError(`${field} must be at most ${maxLength} characters`)
  }
  return cleaned
}

export function normalizeEmail(value: string) {
  const email = value.trim().toLowerCase()
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ConvexError("A valid email address is required")
  }
  return email
}

export function normalizeKey(value: string, field: string) {
  const key = cleanText(value, field, 100).toLowerCase()
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(key)) {
    throw new ConvexError(`${field} contains unsupported characters`)
  }
  return key
}

export function assertFiniteNonNegative(value: number, field: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new ConvexError(`${field} must be a non-negative number`)
  }
}

export function assertTimestampOrder(
  start: number,
  end: number,
  labels = "date range"
) {
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    throw new ConvexError(`Invalid ${labels}`)
  }
}

export function randomSecret() {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  )
}

export async function hashSecret(secret: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(secret)
  )
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("")
}

export function monthKey(timestamp: number) {
  const date = new Date(timestamp)
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`
}
