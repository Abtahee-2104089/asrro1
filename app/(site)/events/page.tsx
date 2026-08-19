import type { Metadata } from "next"
import { EventExplorer } from "@/components/site/event-explorer"
import { PageHero } from "@/components/shared/page-hero"
export const metadata: Metadata = {
  title: "Events",
  description:
    "ASRRO workshops, competitions, bootcamps, seminars, and research talks.",
}
export default function EventsPage() {
  return (
    <>
      <PageHero
        eyebrow="Field calendar / 2026"
        title="Learn in public. Build together."
        intro="From focused lab training to national competitions, every ASRRO event is designed around active participation."
      />
      <section className="px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-[88rem]">
          <EventExplorer />
        </div>
      </section>
    </>
  )
}
