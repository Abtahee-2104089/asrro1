import type { Metadata } from "next"

import { MembershipVerification } from "@/components/membership/membership-verification"

export const metadata: Metadata = {
  title: "Verify Membership",
  description: "Verify an ASRRO membership credential.",
}

export default async function VerifyMembershipPage({
  params,
}: {
  params: Promise<{ uuid: string }>
}) {
  const { uuid } = await params
  return (
    <main className="px-5 py-20 sm:px-8">
      <section className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-10 dark:border-white/10 dark:bg-[#071321]">
        <MembershipVerification uuid={decodeURIComponent(uuid)} />
      </section>
    </main>
  )
}
