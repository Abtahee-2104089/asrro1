"use client"

import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react"
import { ConvexReactClient } from "convex/react"
import type { ReactNode } from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { authClient } from "@/lib/auth-client"

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null

export function AppProviders({
  children,
  initialToken,
}: {
  children: ReactNode
  initialToken?: string | null
}) {
  const content = convexClient ? (
    <ConvexBetterAuthProvider
      client={convexClient}
      authClient={authClient}
      initialToken={initialToken}
    >
      {children}
    </ConvexBetterAuthProvider>
  ) : (
    children
  )

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {content}
    </ThemeProvider>
  )
}
