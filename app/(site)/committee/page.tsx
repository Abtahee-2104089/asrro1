import type { Metadata } from "next"
import { Mail } from "lucide-react"
import { fetchQuery } from "convex/nextjs"
import { PageHero } from "@/components/shared/page-hero"
import { PersonOrb } from "@/components/shared/person-orb"
import { api } from "@/convex/_generated/api"

const committeeTermFormatter = new Intl.DateTimeFormat("en-BD", {
  month: "long",
  year: "numeric",
  timeZone: "Asia/Dhaka",
})

export const metadata: Metadata = {
  title: "Executive Committee",
  description: "Meet ASRRO's current executive committee.",
}
export default async function CommitteePage() {
  const committee = await fetchQuery(api.committee.currentWithPhotos)
  const termLabel = committee?.term.name ?? "Current term"
  return (
    <>
      <PageHero
        eyebrow={`Executive committee / ${termLabel}`}
        title="Stewards of the mission."
        intro="Elected student leaders coordinate research, events, finance, publications, and member development across ASRRO."
        aside={
          committee ? (
            <p className="mt-5 font-mono text-[10px] tracking-[.18em] text-[#b85f00] uppercase dark:text-[#ffb84d]">
              Term closes ·{" "}
              {committeeTermFormatter.format(committee.term.endsAt)}
            </p>
          ) : null
        }
      />
      <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-[88rem] gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {committee?.members.map(({ member: person, photoUrl }, index) => (
            <article
              key={person.name}
              className="group rounded-2xl border border-[#2359d4]/15 bg-white/80 p-6 shadow-[0_16px_45px_rgba(35,89,212,.06)] transition hover:border-[#00a6b2]/40 dark:border-white/10 dark:bg-[#09182a] dark:shadow-none dark:hover:border-[#65f2f1]/40"
            >
              <div className="flex items-start justify-between">
                <PersonOrb
                  initials={person.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                  src={photoUrl}
                  alt={person.name}
                  className="size-20"
                />
                <span className="font-mono text-[9px] text-[#587084] dark:text-[#71869e]">
                  EC-{String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="mt-8 font-mono text-[9px] tracking-[.17em] text-[#007d89] uppercase dark:text-[#65f2f1]">
                {person.position}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-.035em]">
                {person.name}
              </h2>
              <p className="mt-4 text-sm leading-6 text-[#486076] dark:text-[#8fa7c0]">
                {person.department}
                <br />
                Session {person.session}
              </p>
              <a
                href={`mailto:${person.email ?? "secretariat@asrro.org"}`}
                className="mt-6 inline-flex items-center gap-2 text-sm text-[#425a70] hover:text-[#007d89] dark:text-[#b9c8d9] dark:hover:text-[#65f2f1]"
              >
                <Mail className="size-4" />
                Contact
              </a>
            </article>
          ))}
        </div>
        {committee?.members.length ? null : (
          <div className="mx-auto max-w-[88rem] rounded-xl border border-dashed border-[#2359d4]/25 p-12 text-center text-[#4b6175] dark:border-white/15 dark:text-[#9fb1c5]">
            The current public committee roster has not been published yet.
          </div>
        )}
        <p className="mx-auto mt-10 max-w-[88rem] text-sm text-[#587084] dark:text-[#71869e]">
          For formal correspondence, write to{" "}
          <a
            className="text-[#007d89] dark:text-[#65f2f1]"
            href="mailto:asrro@cuet.ac.bd"
          >
            asrro@cuet.ac.bd
          </a>
          . Personal contacts are shared only with consent.
        </p>
      </section>
    </>
  )
}
