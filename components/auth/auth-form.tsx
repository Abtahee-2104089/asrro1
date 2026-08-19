"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"

import { Input } from "@/components/motion/input"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

type AuthMode = "sign-in" | "sign-up"

function friendlyAuthError(message?: string) {
  if (!message) return "We could not complete that request. Please try again."
  if (message.toLowerCase().includes("invalid email or password")) {
    return "That email and password combination does not match."
  }
  if (message.toLowerCase().includes("already exists")) {
    return "An account with this email already exists. Sign in instead."
  }
  return message
}

export function AuthForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const [mode, setMode] = useState<AuthMode>("sign-in")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode)
    setError(null)
    setPassword("")
    setConfirmPassword("")
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (mode === "sign-up" && password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setPending(true)
    try {
      const result =
        mode === "sign-up"
          ? await authClient.signUp.email({
              name: name.trim(),
              email: email.trim(),
              password,
              callbackURL: callbackUrl,
            })
          : await authClient.signIn.email({
              email: email.trim(),
              password,
              rememberMe: true,
              callbackURL: callbackUrl,
            })

      if (result.error) {
        setError(friendlyAuthError(result.error.message))
        return
      }

      router.replace(callbackUrl)
      router.refresh()
    } catch {
      setError("The portal is temporarily unreachable. Please try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <p className="mb-3 font-mono text-[10px] tracking-[0.22em] text-cyan-700 uppercase dark:text-cyan-300">
          Member access
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl dark:text-white">
          {mode === "sign-in" ? "Welcome back." : "Create your account."}
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-400">
          {mode === "sign-in"
            ? "Sign in to enter the ASRRO mission portal."
            : "Use your email and a secure password. You can continue immediately—no verification code is required."}
        </p>
      </div>

      <div className="relative mb-7 grid grid-cols-2 rounded-full border border-slate-200 bg-slate-200/55 p-1 dark:border-white/10 dark:bg-white/5">
        {(["sign-in", "sign-up"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => changeMode(item)}
            className={cn(
              "relative z-10 min-h-10 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:outline-none",
              mode === item
                ? "text-slate-950"
                : "text-slate-500 dark:text-slate-400"
            )}
          >
            {mode === item ? (
              <motion.span
                layoutId="auth-mode"
                className="absolute inset-0 -z-10 rounded-full bg-cyan-300"
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 420, damping: 38 }
                }
              />
            ) : null}
            {item === "sign-in" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <form
        onSubmit={(event) => {
          void submit(event)
        }}
        className="space-y-4"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {mode === "sign-up" ? (
            <motion.div
              key="name"
              initial={reduceMotion ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            >
              <Input
                label="Full name"
                name="name"
                autoComplete="name"
                value={name}
                onChange={setName}
                leftIcon={<UserRound className="size-4" />}
                required
                minLength={2}
                classNames={{
                  label: "text-slate-700 dark:text-slate-300",
                  field:
                    "border-slate-300 bg-white/80 dark:border-white/12 dark:bg-white/[0.045]",
                  input:
                    "text-slate-950 placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-600",
                }}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

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

        <Input
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete={
            mode === "sign-in" ? "current-password" : "new-password"
          }
          value={password}
          onChange={setPassword}
          leftIcon={<LockKeyhole className="size-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="rounded-full p-1 text-slate-500 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:outline-none dark:hover:text-white"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          }
          required
          minLength={8}
          classNames={{
            label: "text-slate-700 dark:text-slate-300",
            field:
              "border-slate-300 bg-white/80 dark:border-white/12 dark:bg-white/[0.045]",
            input:
              "text-slate-950 placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-600",
          }}
        />

        {mode === "sign-in" ? (
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-cyan-700 hover:text-cyan-600 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:outline-none dark:text-cyan-300 dark:hover:text-cyan-200"
            >
              Forgot password?
            </Link>
          </div>
        ) : null}

        <AnimatePresence initial={false} mode="popLayout">
          {mode === "sign-up" ? (
            <motion.div
              key="confirm"
              initial={reduceMotion ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            >
              <Input
                label="Confirm password"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                leftIcon={<LockKeyhole className="size-4" />}
                required
                minLength={8}
                error={
                  confirmPassword && confirmPassword !== password
                    ? "Passwords do not match."
                    : undefined
                }
                classNames={{
                  label: "text-slate-700 dark:text-slate-300",
                  field:
                    "border-slate-300 bg-white/80 dark:border-white/12 dark:bg-white/[0.045]",
                  input:
                    "text-slate-950 placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-600",
                }}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {error ? (
            <motion.p
              role="alert"
              initial={reduceMotion ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
              className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-sm text-red-700 dark:text-red-200"
            >
              {error}
            </motion.p>
          ) : null}
        </AnimatePresence>

        <Button
          type="submit"
          disabled={pending}
          className="mt-2 h-12 w-full rounded-full bg-cyan-300 text-sm font-bold text-slate-950 hover:bg-cyan-200"
        >
          {pending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <ArrowRight className="size-4 transition-transform group-hover/button:translate-x-0.5" />
          )}
          {pending
            ? "Connecting…"
            : mode === "sign-in"
              ? "Enter mission portal"
              : "Create account"}
        </Button>
      </form>

      <p className="mt-7 text-center text-xs leading-5 text-slate-500 dark:text-slate-500">
        Portal access is for ASRRO members and applicants. By continuing, you
        agree to use the system responsibly.{" "}
        <Link
          href="/contact"
          className="text-slate-700 hover:text-cyan-700 dark:text-slate-300 dark:hover:text-cyan-300"
        >
          Need help?
        </Link>
      </p>
    </div>
  )
}
