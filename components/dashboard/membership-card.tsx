"use client"

import type { FunctionReturnType } from "convex/server"
import { CalendarCheck, Orbit, ShieldCheck } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import QRCode from "qrcode"

import { MembershipCardDownloadButton } from "@/components/dashboard/membership-download-button"
import type { api } from "@/convex/_generated/api"

type Membership = FunctionReturnType<typeof api.members.myMembership>

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()

const membershipDateFormatter = new Intl.DateTimeFormat("en-BD", {
  dateStyle: "medium",
  timeZone: "Asia/Dhaka",
})
const membershipShortDateFormatter = new Intl.DateTimeFormat("en-BD", {
  month: "short",
  year: "numeric",
  timeZone: "Asia/Dhaka",
})
const formatDate = (value?: number, short = false) =>
  value
    ? (short ? membershipShortDateFormatter : membershipDateFormatter).format(
        value
      )
    : "Not set"

export function MembershipCard({
  membership,
  verificationUrl,
  compact = false,
}: {
  membership: Membership
  verificationUrl: string
  compact?: boolean
}) {
  const [qrCode, setQrCode] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    async function createQrCode() {
      try {
        const result = await QRCode.toDataURL(verificationUrl, {
          errorCorrectionLevel: "M",
          margin: 1,
          width: 256,
        })
        if (active) setQrCode(result)
      } catch {
        if (active) setQrCode(null)
      }
    }
    void createQrCode()
    return () => {
      active = false
    }
  }, [verificationUrl])
  return (
    <div className="relative aspect-[85.6/53.98] w-full max-w-[46rem] overflow-hidden rounded-[1.4rem] bg-[#08182d] p-4 text-white shadow-[0_18px_60px_rgba(15,40,85,0.18)] sm:p-6">
      <div
        aria-hidden
        className="absolute -top-32 -right-28 size-72 rounded-full border border-blue-400/25"
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-white">
            <Image
              src="/asrro-logo.png"
              width={34}
              height={34}
              alt=""
              className="size-8 object-contain"
            />
          </span>
          <div>
            <p className="text-xs font-bold tracking-[0.16em]">ASRRO</p>
            <p className="mt-0.5 text-[8px] tracking-[0.14em] text-slate-400 uppercase">
              Verified member credential
            </p>
          </div>
        </div>
        <ShieldCheck
          className="size-5 text-cyan-300"
          aria-label="Active membership"
        />
      </div>
      <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 sm:inset-x-6 sm:bottom-6">
        <div className="min-w-0">
          <div className="relative mb-2 hidden size-12 place-items-center overflow-hidden rounded-2xl border border-white/15 bg-white/8 text-base font-semibold sm:grid">
            {membership.profileImageUrl ? (
              <Image
                src={membership.profileImageUrl}
                alt={`${membership.fullName} profile`}
                fill
                sizes="48px"
                unoptimized
                className="object-cover"
              />
            ) : (
              initials(membership.fullName)
            )}
          </div>
          <p className="truncate text-base font-semibold sm:text-lg">
            {membership.fullName}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {membership.department} · HSC {membership.hscBatch}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div>
              <p className="text-[8px] tracking-[0.18em] text-slate-500 uppercase">
                Member UUID
              </p>
              <p className="mt-1 font-mono text-sm font-bold tracking-[0.12em] text-cyan-200">
                {membership.uuid}
              </p>
            </div>
            <span className="h-8 w-px bg-white/10" />
            <div>
              <p className="text-[8px] tracking-[0.18em] text-slate-500 uppercase">
                Valid until
              </p>
              <p className="mt-1 text-xs font-semibold uppercase">
                {formatDate(membership.membershipValidUntil, true)}
              </p>
            </div>
          </div>
        </div>
        <div
          className="grid size-16 shrink-0 place-items-center rounded-lg bg-white p-1.5 shadow-lg sm:size-[5.5rem]"
          style={compact ? { width: 72, height: 72 } : undefined}
          aria-label={`QR code for member ${membership.uuid}`}
        >
          {qrCode ? (
            <Image
              src={qrCode}
              width={256}
              height={256}
              unoptimized
              alt={`Verify membership ${membership.uuid}`}
              className="size-full"
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function MembershipDetails({
  membership,
  verificationUrl,
}: {
  membership: Membership
  verificationUrl: string
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="flex gap-3 rounded-xl bg-slate-50 p-3 dark:bg-white/5">
        <Orbit className="size-4 text-blue-600" />
        <div>
          <p className="text-[10px] tracking-wider text-slate-400 uppercase">
            Galaxy code
          </p>
          <p className="mt-1 text-xs font-semibold">
            {membership.galaxyName && membership.starName
              ? `${membership.galaxyName} · ${membership.starName}`
              : membership.uuid.split("-", 1)[0]}
          </p>
        </div>
      </div>
      <div className="flex gap-3 rounded-xl bg-slate-50 p-3 dark:bg-white/5">
        <CalendarCheck className="size-4 text-blue-600" />
        <div>
          <p className="text-[10px] tracking-wider text-slate-400 uppercase">
            Member since
          </p>
          <p className="mt-1 text-xs font-semibold">
            {formatDate(membership.joinedAt)}
          </p>
        </div>
      </div>
      <MembershipCardDownloadButton
        membership={membership}
        verificationUrl={verificationUrl}
        className="sm:col-span-2"
        label="Download card as PDF"
      />
    </div>
  )
}
