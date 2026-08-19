import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { fetchQuery } from "convex/nextjs"
import { PageHero } from "@/components/shared/page-hero"
import { SignalVisual } from "@/components/shared/signal-visual"
import { api } from "@/convex/_generated/api"

const newsDateFormatter = new Intl.DateTimeFormat("en-BD", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Dhaka",
})

function formatDate(value?: number) {
  return value ? newsDateFormatter.format(value) : "Unscheduled"
}

export const metadata: Metadata = {
  title: "News & Field Notes",
  description:
    "ASRRO news, project updates, announcements, and alumni field notes.",
}
export default async function NewsPage() {
  const result = await fetchQuery(api.blogs.listPublic, {
    paginationOpts: { numItems: 100, cursor: null },
  })
  const news = result.page
  return (
    <>
      <PageHero
        eyebrow="Signal log / news & field notes"
        title="What changed, and why it matters."
        intro="Announcements, project milestones, research context, and lessons carried back from the field."
      />
      <section className="px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-[88rem]">
          {news[0] ? (
            <Link
              href={`/news/${news[0].slug}`}
              className="group grid overflow-hidden rounded-2xl border border-[#2359d4]/15 bg-white/85 shadow-[0_18px_50px_rgba(35,89,212,.07)] transition hover:border-[#00a6b2]/40 lg:grid-cols-[1.1fr_.9fr] dark:border-white/10 dark:bg-[#09182a] dark:shadow-none dark:hover:border-[#65f2f1]/40"
            >
              <SignalVisual
                code="LATEST—0728"
                className="min-h-72 border-b border-[#2359d4]/15 lg:border-r lg:border-b-0 dark:border-white/10"
              />
              <div className="flex flex-col justify-between p-8 sm:p-10">
                <div>
                  <p className="font-mono text-[9px] tracking-[.17em] text-[#007d89] uppercase dark:text-[#65f2f1]">
                    Latest · {news[0].category}
                  </p>
                  <h2 className="mt-5 text-4xl leading-tight font-semibold tracking-[-.045em] group-hover:text-[#007d89] dark:group-hover:text-[#65f2f1]">
                    {news[0].title}
                  </h2>
                  <p className="mt-5 leading-7 text-[#425a70] dark:text-[#9fb1c5]">
                    {news[0].excerpt}
                  </p>
                </div>
                <p className="mt-10 flex items-center justify-between text-sm text-[#587084] dark:text-[#8296ad]">
                  {formatDate(news[0].publishedAt)} · {news[0].authorName}
                  <ArrowUpRight className="size-4" />
                </p>
              </div>
            </Link>
          ) : null}
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {news.slice(1).map((item) => (
              <Link
                key={item.slug}
                href={`/news/${item.slug}`}
                className="group rounded-2xl border border-[#2359d4]/15 bg-white/85 p-6 shadow-[0_14px_40px_rgba(35,89,212,.05)] transition hover:border-[#00a6b2]/40 dark:border-white/10 dark:bg-[#09182a] dark:shadow-none dark:hover:border-[#65f2f1]/40"
              >
                <p className="font-mono text-[9px] tracking-[.16em] text-[#007d89] uppercase dark:text-[#65f2f1]">
                  {item.category}
                </p>
                <h2 className="mt-12 text-2xl font-semibold tracking-[-.035em] group-hover:text-[#007d89] dark:group-hover:text-[#65f2f1]">
                  {item.title}
                </h2>
                <p className="mt-4 leading-7 text-[#425a70] dark:text-[#9fb1c5]">
                  {item.excerpt}
                </p>
                <p className="mt-8 text-sm text-[#587084] dark:text-[#71869e]">
                  {formatDate(item.publishedAt)} · {item.authorName}
                </p>
              </Link>
            ))}
          </div>
          {news.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#2359d4]/25 p-12 text-center text-[#4b6175] dark:border-white/15 dark:text-[#9fb1c5]">
              No news or field notes have been published yet.
            </div>
          ) : null}
        </div>
      </section>
    </>
  )
}
