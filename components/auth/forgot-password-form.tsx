"use client"

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  Mail,
} from "lucide-react"
import Link from "next/link"
import { useState, type FormEvent } from "react"

import { Input } from "@/components/motion/input"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError("")
    try {
      const result = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo: new URL("/reset-password", document.baseURI).href,
      })
      if (result.error) {
        setError("We could not send the reset link. Please try again shortly.")
        return
      }
      setSent(true)
    } catch {
      setError("The portal is temporarily unreachable. Please try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <p className="mb-3 font-mono text-[10px] tracking-[0.22em] text-cyan-700 uppercase dark:text-cyan-300">
        Account recovery
      </p>
      <h1 className="font-heading text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl dark:text-white">
        {sent ? "Check your inbox." : "Reset your password."}
      </h1>

      {sent ? (
        <div className="mt-7">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
            <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-300" />
            <p className="mt-4 text-sm leading-6 text-slate-700 dark:text-slate-300">
              If an ASRRO account exists for <strong>{email}</strong>, a secure
              reset link is on its way. The link expires in 60 minutes.
            </p>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            Nothing arrived? Check spam, confirm the address, or wait a minute
            before trying again.
          </p>
          <Button
            type="button"
            onClick={() => setSent(false)}
            className="mt-6 h-12 w-full rounded-full bg-cyan-300 font-bold text-slate-950 hover:bg-cyan-200"
          >
            Try another address
          </Button>
        </div>
      ) : (
        <>
          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-400">
            Enter your account email. We will send a secure, single-use link if
            the address belongs to an account.
          </p>
          <form
            onSubmit={(event) => void submit(event)}
            className="mt-7 space-y-4"
          >
            <Input
              label="Email address"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={setEmail}
              leftIcon={<Mail className="size-4" />}
              required
              classNames={{
                label: "text-slate-700 dark:text-slate-300",
                field:
                  "border-slate-300 bg-white/80 dark:border-white/12 dark:bg-white/[0.045]",
                input:
                  "text-slate-950 placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-600",
              }}
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
                <ArrowRight className="size-4" />
              )}
              {pending ? "Sending securely…" : "Send reset link"}
            </Button>
          </form>
        </>
      )}

      <Link
        href="/login"
        className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-cyan-700 dark:text-slate-300 dark:hover:text-cyan-300"
      >
        <ArrowLeft className="size-4" /> Back to sign in
      </Link>
    </div>
  )
}
