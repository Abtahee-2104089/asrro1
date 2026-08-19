import type { Metadata } from "next"
import { MembershipFlow } from "@/components/site/membership-flow"
import { PageHero } from "@/components/shared/page-hero"
export const metadata: Metadata = {
  title: "Apply for Membership",
  description: "Apply to join ASRRO at CUET.",
}
export default function MembershipPage() {
  return (
    <>
      <PageHero
        eyebrow="Membership intake / 2026"
        title="Find your place in the orbit."
        intro="Membership is open to CUET students who want to learn consistently, contribute responsibly, and build with others."
        aside={
          <p className="mt-5 text-sm text-[#b85f00] dark:text-[#ffb84d]">
            Applications reviewed weekly · BDT 300 annual fee
          </p>
        }
      />
      <section className="px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-[88rem]">
          <MembershipFlow />
        </div>
      </section>
    </>
  )
}
