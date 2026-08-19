"use client"

import { useQuery } from "convex/react"
import { CheckCircle2, FileCheck2, ReceiptText } from "lucide-react"

import {
  PageHeader,
  Panel,
  StatusPill,
} from "@/components/dashboard/dashboard-kit"
import {
  MembershipCard,
  MembershipDetails,
} from "@/components/dashboard/membership-card"
import {
  MembershipCardDownloadButton,
  MembershipReceiptDownloadButton,
} from "@/components/dashboard/membership-download-button"
import { api } from "@/convex/_generated/api"

const formatDate = (value?: number) =>
  value
    ? new Intl.DateTimeFormat("en-BD", { dateStyle: "medium" }).format(value)
    : "Not set"

export function MembershipView() {
  const membership = useQuery(api.members.myMembership)
  if (membership === undefined)
    return (
      <p className="text-sm text-slate-500">Loading membership credential…</p>
    )

  const verificationUrl = new URL(
    `/membership/verify/${encodeURIComponent(membership.uuid)}`,
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://asrro.org"
  ).href
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Digital credential"
        title="Membership card"
        description="Your permanent ASRRO identity and membership payment record."
        actions={
          <MembershipCardDownloadButton
            membership={membership}
            verificationUrl={verificationUrl}
            label="Download card"
          />
        }
      />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,.85fr)]">
        <div className="space-y-4">
          <MembershipCard
            membership={membership}
            verificationUrl={verificationUrl}
          />
          <Panel className="p-5">
            <MembershipDetails
              membership={membership}
              verificationUrl={verificationUrl}
            />
          </Panel>
        </div>
        <div className="space-y-4">
          <Panel
            title="Membership record"
            description="Matched with the live ASRRO member directory."
          >
            <dl className="divide-y divide-slate-100 px-5 dark:divide-white/8">
              {[
                [
                  "Status",
                  <StatusPill key="status" tone="green">
                    {membership.status}
                  </StatusPill>,
                ],
                ["Member UUID", membership.uuid],
                ["Department", membership.department],
                ["Academic batch", `HSC ${membership.hscBatch}`],
                ["Validity", formatDate(membership.membershipValidUntil)],
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  className="flex items-center justify-between gap-4 py-3.5"
                >
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="text-right text-xs font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </Panel>
          <Panel title="Payment receipt">
            {membership.receipt ? (
              <div className="flex items-center gap-3 px-5 py-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                  <ReceiptText className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">
                    Membership application fee
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {formatDate(membership.receipt.paidAt)} ·{" "}
                    {membership.receipt.transactionId}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold">
                    {new Intl.NumberFormat("en-BD", {
                      style: "currency",
                      currency: membership.receipt.currency,
                      maximumFractionDigits: 0,
                    }).format(membership.receipt.amount)}
                  </p>
                  <MembershipReceiptDownloadButton
                    receipt={membership.receipt}
                    member={membership}
                  />
                </div>
              </div>
            ) : (
              <p className="p-5 text-xs text-slate-500">
                No payment receipt is attached to this member record.
              </p>
            )}
          </Panel>
          <div className="flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-950 dark:border-emerald-400/15 dark:bg-emerald-500/8 dark:text-emerald-100">
            <FileCheck2 className="size-5 shrink-0" />
            <div>
              <p className="text-xs font-semibold">Credential ready</p>
              <p className="mt-1 text-[11px] leading-5 opacity-75">
                The QR code resolves to the public verification record for this
                UUID.
              </p>
            </div>
            <CheckCircle2 className="ml-auto size-4 shrink-0" />
          </div>
        </div>
      </div>
    </div>
  )
}
