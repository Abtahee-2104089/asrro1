import type { Metadata } from "next"
import { SearchSurface } from "@/components/site/search-surface"
import { PageHero } from "@/components/shared/page-hero"
export const metadata: Metadata = {
  title: "Search",
  description:
    "Search ASRRO projects, events, alumni, committee, publications, and news.",
}
export default function SearchPage() {
  return (
    <>
      <PageHero
        eyebrow="Global index / all records"
        title="Search the mission archive."
        intro="Find people, systems, events, publications, and field notes across ASRRO's public record."
      />
      <section className="px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <SearchSurface />
        </div>
      </section>
    </>
  )
}
