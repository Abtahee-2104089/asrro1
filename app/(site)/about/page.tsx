import type { Metadata } from "next"
import { fetchQuery } from "convex/nextjs"
import {
  Eye,
  Flag,
  Handshake,
  Lightbulb,
  ShieldCheck,
  Users,
} from "lucide-react"
import { PageHero } from "@/components/shared/page-hero"
import { SectionHeading } from "@/components/shared/section-heading"
import { api } from "@/convex/_generated/api"
import { RichText } from "@/components/shared/rich-text"

export const metadata: Metadata = {
  title: "About",
  description: "The mission, history, values, and journey of ASRRO at CUET.",
}
const timeline = [
  [
    "2016",
    "First orbit",
    "A small cross-department robotics circle begins meeting after class at CUET.",
  ],
  [
    "2018",
    "ASRRO formed",
    "The group becomes Andromeda Space and Robotics Research Organization with an open research charter.",
  ],
  [
    "2020",
    "Learning without a lab",
    "Remote technical sessions connect members across Bangladesh during campus closure.",
  ],
  [
    "2022",
    "National reach",
    "ASRRO launches its first open national robotics event and alumni mentor network.",
  ],
  [
    "2024",
    "Research wing",
    "Formal project reviews, technical reports, and reproducible documentation become standard practice.",
  ],
  [
    "2026",
    "A wider frontier",
    "Seven disciplines now work through shared facilities, field programs, and research partnerships.",
  ],
]
const values = [
  [
    Lightbulb,
    "Curiosity with rigor",
    "Ask ambitious questions, then test every assumption.",
  ],
  [
    Handshake,
    "Open collaboration",
    "Share tools, credit, and knowledge across disciplines.",
  ],
  [
    ShieldCheck,
    "Responsible invention",
    "Design for safety, access, and the realities of local use.",
  ],
  [
    Users,
    "People before prototypes",
    "Build confidence and community alongside technical skill.",
  ],
]
export default async function AboutPage() {
  const managed = await fetchQuery(api.content.getPage, { slug: "about" })
  return (
    <>
      <PageHero
        eyebrow="Organization / since 2016"
        title={managed?.title ?? "A workshop for the possible."}
        intro={
          managed?.summary ??
          "ASRRO gives CUET students the space, collaborators, and discipline to move from curiosity to credible frontier-technology research."
        }
      />
      {managed ? (
        <section className="px-5 pt-16 sm:px-8 lg:px-12">
          <RichText
            value={managed.body}
            className="mx-auto max-w-3xl text-lg leading-9 text-[#425a70] dark:text-[#b9c8d9]"
          />
        </section>
      ) : null}
      <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[88rem]">
          <div className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-[#2359d4]/15 bg-white/80 p-8 shadow-[0_18px_50px_rgba(35,89,212,.07)] sm:p-10 dark:border-white/10 dark:bg-[#09182a] dark:shadow-none">
              <Flag className="size-6 text-[#007d89] dark:text-[#65f2f1]" />
              <p className="mt-16 font-mono text-[10px] tracking-[.2em] text-[#587084] uppercase dark:text-[#71869e]">
                Mission
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-.04em]">
                Make frontier research practical, collaborative, and locally
                meaningful.
              </h2>
            </article>
            <article className="rounded-2xl border border-[#2359d4]/25 bg-[#eef3ff] p-8 shadow-[0_18px_50px_rgba(35,89,212,.08)] sm:p-10 dark:border-[#3d8bff]/30 dark:bg-[#0b1d31] dark:shadow-none">
              <Eye className="size-6 text-[#d97706] dark:text-[#ffb84d]" />
              <p className="mt-16 font-mono text-[10px] tracking-[.2em] text-[#587084] uppercase dark:text-[#71869e]">
                Vision
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-.04em]">
                A Bangladesh where student researchers help shape the
                technologies defining our future.
              </h2>
            </article>
          </div>
        </div>
      </section>
      <section className="border-y border-[#2359d4]/15 bg-[#eaf0f6] px-5 py-20 sm:px-8 lg:px-12 lg:py-28 dark:border-white/10 dark:bg-[#081524]">
        <div className="mx-auto max-w-[88rem]">
          <SectionHeading
            eyebrow="Journey log / 2016—present"
            title="Built one capability at a time."
          />
          <ol className="relative border-l border-[#2359d4]/30 lg:ml-[10rem] dark:border-[#3d8bff]/35">
            {timeline.map(([year, title, copy]) => (
              <li
                key={year}
                className="relative grid gap-3 border-b border-[#2359d4]/15 py-8 pl-8 lg:grid-cols-[7rem_1fr_1.2fr] dark:border-white/10"
              >
                <span className="absolute top-10 -left-1.5 size-3 rounded-full border-2 border-[#eaf0f6] bg-[#00a6b2] dark:border-[#081524] dark:bg-[#65f2f1]" />
                <span className="font-mono text-sm text-[#007d89] dark:text-[#65f2f1]">
                  {year}
                </span>
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="leading-7 text-[#425a70] dark:text-[#9fb1c5]">
                  {copy}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[88rem]">
          <SectionHeading
            eyebrow="Operating principles"
            title="What holds the orbit together."
          />
          <div className="grid gap-px overflow-hidden rounded-2xl bg-[#2359d4]/15 shadow-[0_18px_50px_rgba(35,89,212,.06)] sm:grid-cols-2 lg:grid-cols-4 dark:bg-white/10 dark:shadow-none">
            {values.map(([Icon, title, copy]) => (
              <article
                key={String(title)}
                className="bg-white/90 p-7 dark:bg-[#09182a]"
              >
                <Icon className="size-5 text-[#007d89] dark:text-[#65f2f1]" />
                <h3 className="mt-12 text-xl font-semibold">{String(title)}</h3>
                <p className="mt-3 leading-7 text-[#425a70] dark:text-[#9fb1c5]">
                  {String(copy)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
