import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { AuthForm } from "@/components/auth/auth-form"
import { AuthShell } from "@/components/auth/auth-shell"
import { isAuthenticated } from "@/lib/auth-server"

export const metadata: Metadata = {
  title: "Member sign in",
  description: "Sign in to the secure ASRRO member and operations portal.",
  robots: { index: false, follow: false },
}

function safeCallbackUrl(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value
  return candidate?.startsWith("/") && !candidate.startsWith("//")
    ? candidate
    : "/dashboard"
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>
}) {
  const { next } = await searchParams
  const callbackUrl = safeCallbackUrl(next)

  if (await isAuthenticated()) redirect(callbackUrl)

  return (
    <AuthShell>
      <AuthForm callbackUrl={callbackUrl} />
    </AuthShell>
  )
}
