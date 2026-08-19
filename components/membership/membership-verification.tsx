"use client"

import { useQuery } from "convex/react"
import { BadgeCheck, ShieldAlert } from "lucide-react"

import { api } from "@/convex/_generated/api"

export function MembershipVerification({ uuid }: { uuid: string }) {
  const member = useQuery(api.members.verifyMembership, { uuid })
  if (member === undefined)
    return <p className="text-sm text-slate-500">Verifying credential…</p>
  if (!member)
    return (
      <div className="text-center">
        <ShieldAlert className="mx-auto size-10 text-rose-600" />
        <h1 className="mt-4 text-2xl font-semibold">Credential not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          No verifiable membership matches this UUID.
        </p>
      </div>
    )
  return (
    <div className="text-center">
      <BadgeCheck className="mx-auto size-10 text-emerald-600" />
      <p className="mt-4 font-mono text-xs tracking-widest text-emerald-700 uppercase">
        ASRRO verified credential
      </p>
      <h1 className="mt-3 text-3xl font-semibold">{member.fullName}</h1>
      <p className="mt-2 font-mono text-lg text-cyan-700">{member.uuid}</p>
      <dl className="mt-6 grid gap-px overflow-hidden rounded-xl bg-slate-200 text-left sm:grid-cols-2 dark:bg-white/10">
        {[
          ["Status", member.status],
          ["Department", member.department],
          ["HSC batch", member.hscBatch],
          [
            "Member since",
            new Date(member.joinedAt).toLocaleDateString("en-BD"),
          ],
        ].map(([label, value]) => (
          <div key={label} className="bg-white p-4 dark:bg-[#0a1626]">
            <dt className="text-[10px] tracking-wider text-slate-400 uppercase">
              {label}
            </dt>
            <dd className="mt-1 text-sm font-semibold capitalize">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
