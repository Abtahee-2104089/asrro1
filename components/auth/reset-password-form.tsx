"use client"

import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react"
import Link from "next/link"
import { useState, type FormEvent } from "react"

import { Input } from "@/components/motion/input"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

export function ResetPasswordForm({
  token,
  invalid,
}: {
  token?: string
  invalid: boolean
}) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState(false)
  const [complete, setComplete] = useState(false)
  const [error, setError] = useState("")

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    if (!token || invalid) {
      setError("This reset link is invalid or has expired.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    setPending(true)
    try {
      const result = await authClient.resetPassword({
        newPassword: password,
        token,
      })
      if (result.error) {
        setError("This reset link is invalid, expired, or already used.")
        return
      }
      setComplete(true)
    } catch {
      setError("The portal is temporarily unreachable. Please try again.")
    } finally {
      setPending(false)
    }
  }

  if (complete) {
    return (
      <div className="w-full max-w-md">
        <CheckCircle2 className="size-8 text-emerald-600 dark:text-emerald-300" />
        <p className="mt-5 font-mono text-[10px] tracking-[0.22em] text-cyan-700 uppercase dark:text-cyan-300">
          Recovery complete
        </p>
        <h1 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
          Password updated.
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
          Your previous sessions have been closed. Sign in again with your new
          password.
        </p>
        <Button
          render={<Link href="/login" />}
          nativeButton={false}
          className="mt-7 h-12 w-full rounded-full bg-cyan-300 font-bold text-slate-950 hover:bg-cyan-200"
        >
          <ArrowRight className="size-4" /> Continue to sign in
        </Button>
      </div>
    )
  }

  const unavailable = invalid || !token
  return (
    <div className="w-full max-w-md">
      <p className="mb-3 font-mono text-[10px] tracking-[0.22em] text-cyan-700 uppercase dark:text-cyan-300">
        Secure password reset
      </p>
      <h1 className="font-heading text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
        {unavailable ? "Reset link unavailable." : "Create a new password."}
      </h1>
      {unavailable ? (
        <div className="mt-6">
          <p className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-sm leading-6 text-slate-700 dark:text-slate-300">
            This link is invalid or has expired. Request a fresh link to
            continue securely.
          </p>
          <Button
            render={<Link href="/forgot-password" />}
            nativeButton={false}
            className="mt-6 h-12 w-full rounded-full bg-cyan-300 font-bold text-slate-950 hover:bg-cyan-200"
          >
            Request another link
          </Button>
        </div>
      ) : (
        <>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Use at least eight characters. This link will stop working after the
            password is changed.
          </p>
          <form
            onSubmit={(event) => void submit(event)}
            className="mt-7 space-y-4"
          >
            <PasswordInput
              label="New password"
              value={password}
              onChange={setPassword}
              visible={showPassword}
              onToggle={() => setShowPassword((value) => !value)}
            />
            <PasswordInput
              label="Confirm new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              visible={showPassword}
              error={
                confirmPassword && confirmPassword !== password
                  ? "Passwords do not match."
                  : undefined
              }
            />
            {error ? (
              <p
                role="alert"
                className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-sm text-red-700 dark:text-red-200"
              >
                {error}
              </p>
            ) : null}
            <Button
              type="submit"
              disabled={pending}
              className="h-12 w-full rounded-full bg-cyan-300 font-bold text-slate-950 hover:bg-cyan-200"
            >
              {pending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <LockKeyhole className="size-4" />
              )}
              {pending ? "Updating securely…" : "Set new password"}
            </Button>
          </form>
        </>
      )}
    </div>
  )
}

function PasswordInput({
  label,
  value,
  onChange,
  visible,
  onToggle,
  error,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  visible: boolean
  onToggle?: () => void
  error?: string
}) {
  return (
    <Input
      label={label}
      type={visible ? "text" : "password"}
      autoComplete="new-password"
      value={value}
      onChange={onChange}
      leftIcon={<LockKeyhole className="size-4" />}
      rightIcon={
        onToggle ? (
          <button
            type="button"
            onClick={onToggle}
            aria-label={visible ? "Hide passwords" : "Show passwords"}
            className="rounded-full p-1 text-slate-500 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:outline-none dark:hover:text-white"
          >
            {visible ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        ) : undefined
      }
      required
      minLength={8}
      maxLength={128}
      error={error}
      classNames={{
        label: "text-slate-700 dark:text-slate-300",
        field:
          "border-slate-300 bg-white/80 dark:border-white/12 dark:bg-white/[0.045]",
        input:
          "text-slate-950 placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-600",
      }}
    />
  )
}
