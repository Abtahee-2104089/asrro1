import type { Metadata } from "next"
import { AlumniDirectory } from "@/components/site/alumni-directory"
import { PageHero } from "@/components/shared/page-hero"

export const metadata: Metadata = {
  title: "Alumni",
  description:
    "Explore the ASRRO alumni network by department, batch, and graduation year.",
}
export default function AlumniPage() {
  return (
    <>
      <PageHero
        eyebrow="People / alumni orbit"
        title="The mission travels with them."
        intro="ASRRO alumni carry a build-first research culture into universities, laboratories, and engineering teams around the world."
      />
      <section className="px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-[88rem]">
          <AlumniDirectory />
        </div>
      </section>
    </>
  )
}
