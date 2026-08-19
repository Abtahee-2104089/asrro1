import type { Metadata } from "next"
import { ArrowDownToLine, BookOpen, FileText } from "lucide-react"
import { fetchQuery } from "convex/nextjs"
import { PageHero } from "@/components/shared/page-hero"
import { api } from "@/convex/_generated/api"

const publicationDateFormatter = new Intl.DateTimeFormat("en-BD", {
  year: "numeric",
  month: "short",
  timeZone: "Asia/Dhaka",
})
export const metadata: Metadata = {
  title: "Publications",
  description:
    "ASRRO research papers, technical reports, magazines, and annual publications.",
}
export default async function PublicationsPage() {
  const cards = await fetchQuery(api.publications.listPublicCards, {})
  const counts = cards.reduce<Record<string, number>>((result, card) => {
    result[card.publication.type] = (result[card.publication.type] ?? 0) + 1
    return result
  }, {})
  return (
    <>
      <PageHero
        eyebrow="Knowledge base / public record"
        title="Research should leave a trail."
        intro="Papers, reports, magazines, and field notes that make ASRRO work legible, reviewable, and reusable."
      />
      <section className="px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-[88rem]">
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            {[
              ["Research papers", String(counts.research_paper ?? 0)],
              ["Technical reports", String(counts.report ?? 0)],
              [
                "Annual issues",
                String(
                  (counts.magazine ?? 0) + (counts.annual_publication ?? 0)
                ),
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-[#2359d4]/15 bg-white/85 p-5 shadow-[0_12px_35px_rgba(35,89,212,.05)] dark:border-white/10 dark:bg-[#09182a] dark:shadow-none"
              >
                <p className="text-3xl font-semibold">{value}</p>
                <p className="mt-1 font-mono text-[9px] tracking-[.16em] text-[#587084] uppercase dark:text-[#71869e]">
                  {label}
                </p>
              </div>
            ))}
          </div>
          <div className="divide-y divide-[#2359d4]/15 border-y border-[#2359d4]/15 dark:divide-white/10 dark:border-white/10">
            {cards.map(({ publication: item, downloadUrl }) => (
              <article
                key={item._id}
                className="grid gap-5 py-7 md:grid-cols-[3rem_1fr_11rem_3rem] md:items-center"
              >
                <span className="grid size-11 place-items-center rounded-lg border border-[#2359d4]/20 bg-[#eef3ff] text-[#2359d4] dark:border-[#3d8bff]/25 dark:bg-[#0b1d31] dark:text-[#65f2f1]">
                  {item.type === "magazine" ||
                  item.type === "annual_publication" ? (
                    <BookOpen className="size-5" />
                  ) : (
                    <FileText className="size-5" />
                  )}
                </span>
                <div>
                  <p className="font-mono text-[9px] tracking-[.16em] text-[#007d89] uppercase dark:text-[#65f2f1]">
                    {item.type.replaceAll("_", " ")} · {item.slug}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-.025em]">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm text-[#587084] dark:text-[#8296ad]">
                    {item.authors.join(", ")}
                  </p>
                </div>
                <div className="text-sm text-[#425a70] dark:text-[#9fb1c5]">
                  <p>
                    {item.abstract.slice(0, 80)}
                    {item.abstract.length > 80 ? "…" : ""}
                  </p>
                  <p className="mt-1 text-[#587084] dark:text-[#71869e]">
                    {publicationDateFormatter.format(item.publicationDate)}
                  </p>
                </div>
                <a
                  href={downloadUrl ?? item.externalUrl ?? undefined}
                  aria-label={`${downloadUrl ? "Download" : "Open"} ${item.title}`}
                  aria-disabled={!downloadUrl && !item.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="grid size-11 place-items-center rounded-full border border-[#2359d4]/15 text-[#486076] transition hover:border-[#00a6b2]/50 hover:text-[#007d89] dark:border-white/10 dark:text-inherit dark:hover:border-[#65f2f1]/50 dark:hover:text-[#65f2f1]"
                >
                  <ArrowDownToLine className="size-4" />
                </a>
              </article>
            ))}
          </div>
          {cards.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#2359d4]/25 p-12 text-center text-[#4b6175] dark:border-white/15 dark:text-[#9fb1c5]">
              No publications have been released yet.
            </div>
          ) : null}
        </div>
      </section>
    </>
  )
}
