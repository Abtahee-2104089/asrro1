"use client"

import { useState, type FormEvent } from "react"

import { ActionButton } from "@/components/dashboard/dashboard-kit"
import { authClient } from "@/lib/auth-client"

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")
    setError("")
    if (newPassword !== confirmation) {
      setError("New passwords do not match.")
      return
    }
    setPending(true)
    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      })
      if (result.error) {
        setError(result.error.message ?? "Password update failed.")
        return
      }
      setCurrentPassword("")
      setNewPassword("")
      setConfirmation("")
      setMessage("Password updated. Other sessions were signed out.")
    } catch {
      setError("Password update failed. Please try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="space-y-4 p-5">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Current password",
            value: currentPassword,
            setter: setCurrentPassword,
            autoComplete: "current-password",
          },
          {
            label: "New password",
            value: newPassword,
            setter: setNewPassword,
            autoComplete: "new-password",
          },
          {
            label: "Confirm password",
            value: confirmation,
            setter: setConfirmation,
            autoComplete: "new-password",
          },
        ].map((field) => (
          <label key={field.label} className="text-xs font-medium">
            {field.label}
            <input
              type="password"
              value={field.value}
              onChange={(event) => field.setter(event.target.value)}
              autoComplete={field.autoComplete}
              minLength={8}
              required
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-slate-950"
            />
          </label>
        ))}
      </div>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
      {message ? <p className="text-xs text-emerald-600">{message}</p> : null}
      <ActionButton type="submit" disabled={pending}>
        {pending ? "Updating…" : "Update password"}
      </ActionButton>
    </form>
  )
}
