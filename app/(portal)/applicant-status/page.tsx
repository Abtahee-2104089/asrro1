import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { ApplicantStatus } from "@/components/membership/applicant-status"
import { AsrroMark } from "@/components/shared/asrro-mark"
import { isAuthenticated } from "@/lib/auth-server"

export const metadata: Metadata = {
  title: "Application status",
  description: "Track and link your ASRRO membership application.",
  robots: { index: false, follow: false },
}

export default async function ApplicantStatusPage() {
  if (!(await isAuthenticated())) {
    redirect("/login?next=/applicant-status")
  }

  return (
    <main className="min-h-svh bg-[#eef3f8] px-5 py-10 text-slate-950 dark:bg-[#050b14] dark:text-white">
      <div className="mx-auto max-w-2xl">
        <AsrroMark className="mx-auto size-14 rounded-2xl" priority />
        <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-9 dark:border-white/10 dark:bg-[#071321]">
          <ApplicantStatus />
        </section>
      </div>
    </main>
  )
}
