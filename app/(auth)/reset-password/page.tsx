import type { Metadata } from "next"

import { AuthShell } from "@/components/auth/auth-shell"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export const metadata: Metadata = {
  title: "Reset password",
  description: "Choose a new password for your ASRRO portal account.",
  robots: { index: false, follow: false },
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{
    token?: string | string[]
    error?: string | string[]
  }>
}) {
  const params = await searchParams
  const token = first(params.token)
  const invalid = first(params.error) === "INVALID_TOKEN"
  return (
    <AuthShell>
      <ResetPasswordForm token={token} invalid={invalid} />
    </AuthShell>
  )
}
