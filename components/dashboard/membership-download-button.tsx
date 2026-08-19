"use client"

import type { FunctionReturnType } from "convex/server"
import { Check, Download, LoaderCircle } from "lucide-react"
import { useState } from "react"

import { ActionButton } from "@/components/dashboard/dashboard-kit"
import type { api } from "@/convex/_generated/api"
import { cn } from "@/lib/utils"

type Membership = FunctionReturnType<typeof api.members.myMembership>
type Receipt = NonNullable<Membership["receipt"]>
type DownloadState = "idle" | "loading" | "complete" | "error"

function DownloadIcon({ state }: { state: DownloadState }) {
  if (state === "loading")
    return <LoaderCircle className="size-3.5 animate-spin" aria-hidden />
  if (state === "complete") return <Check className="size-3.5" aria-hidden />
  return <Download className="size-3.5" aria-hidden />
}

export function MembershipCardDownloadButton({
  className,
  label = "Download card",
  membership,
  verificationUrl,
}: {
  className?: string
  label?: string
  membership: Membership
  verificationUrl: string
}) {
  const [state, setState] = useState<DownloadState>("idle")
  async function download() {
    setState("loading")
    try {
      const { downloadMembershipCardPdf } = await import("@/lib/membership-pdf")
      await downloadMembershipCardPdf(membership, verificationUrl)
      setState("complete")
      setTimeout(() => setState("idle"), 1800)
    } catch {
      setState("error")
    }
  }
  const buttonLabel =
    state === "loading"
      ? "Preparing card…"
      : state === "complete"
        ? "Card downloaded"
        : state === "error"
          ? "Try download again"
          : label
  return (
    <ActionButton
      className={cn(className)}
      disabled={state === "loading"}
      onClick={() => void download()}
      aria-live="polite"
    >
      <DownloadIcon state={state} />
      {buttonLabel}
    </ActionButton>
  )
}

export function MembershipReceiptDownloadButton({
  receipt,
  member,
}: {
  receipt: Receipt
  member: Membership
}) {
  const [state, setState] = useState<DownloadState>("idle")
  async function download() {
    setState("loading")
    try {
      const { downloadMembershipReceiptPdf } =
        await import("@/lib/membership-pdf")
      await downloadMembershipReceiptPdf(receipt, member)
      setState("complete")
      setTimeout(() => setState("idle"), 1800)
    } catch {
      setState("error")
    }
  }
  return (
    <button
      type="button"
      onClick={() => void download()}
      disabled={state === "loading"}
      className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 disabled:opacity-60"
      aria-label={`Download receipt ${receipt.id}`}
      aria-live="polite"
    >
      <DownloadIcon state={state} />
      {state === "loading"
        ? "Preparing…"
        : state === "complete"
          ? "Downloaded"
          : state === "error"
            ? "Try again"
            : "PDF"}
    </button>
  )
}
