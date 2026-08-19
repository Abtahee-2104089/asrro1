import type { Metadata } from "next"

import { ApplicationTracker } from "@/components/membership/application-tracker"
import { PageHero } from "@/components/shared/page-hero"

export const metadata: Metadata = {
  title: "Membership Application Status",
  description: "Privately check the review status of an ASRRO application.",
}

export default function MembershipApplicationStatusPage() {
  return (
    <>
      <PageHero
        eyebrow="Membership tracking"
        title="Follow your application."
        intro="Your application code and private tracking token open a live view of the committee review decision."
      />
      <section className="px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <ApplicationTracker />
      </section>
    </>
  )
}
