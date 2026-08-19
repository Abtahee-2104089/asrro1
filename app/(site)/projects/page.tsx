import type { Metadata } from "next"
import { ProjectExplorer } from "@/components/site/project-explorer"
import { PageHero } from "@/components/shared/page-hero"

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Explore ASRRO projects across robotics, AI, space, embedded systems, IoT, and electronics.",
}
export default function ProjectsPage() {
  return (
    <>
      <PageHero
        eyebrow="Research portfolio / open records"
        title="Systems built to leave the screen."
        intro="Browse ongoing research, completed prototypes, competition systems, and technical collaborations from ASRRO teams."
      />
      <section className="px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-[88rem]">
          <ProjectExplorer />
        </div>
      </section>
    </>
  )
}
