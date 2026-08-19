import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Share2 } from "lucide-react"
import { fetchQuery } from "convex/nextjs"
import { api } from "@/convex/_generated/api"
import { ArticleComments } from "@/components/site/article-comments"
import { RichText } from "@/components/shared/rich-text"

const articleDateFormatter = new Intl.DateTimeFormat("en-BD", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Dhaka",
})
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const item = await fetchQuery(api.blogs.getPublicBySlug, { slug })
  return { title: item?.title ?? "News", description: item?.excerpt }
}
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const item = await fetchQuery(api.blogs.getPublicBySlug, { slug })
  if (!item) notFound()
  const date = item.publishedAt
    ? articleDateFormatter.format(item.publishedAt)
    : "Unscheduled"
  const readingMinutes = Math.max(
    1,
    Math.ceil(item.body.split(/\s+/).length / 220)
  )
  return (
    <article>
      <header className="px-5 pt-10 pb-16 sm:px-8 lg:px-12 lg:pb-20">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-sm text-[#587084] transition hover:text-[#07111f] dark:text-[#8fa7c0] dark:hover:text-white"
          >
            <ArrowLeft className="size-4" />
            All news
          </Link>
          <p className="mt-12 font-mono text-[10px] tracking-[.2em] text-[#007d89] uppercase dark:text-[#65f2f1]">
            {item.category} · {date}
          </p>
          <h1 className="mt-5 text-5xl leading-[.96] font-semibold tracking-[-.055em] text-balance sm:text-7xl">
            {item.title}
          </h1>
          <p className="mt-7 max-w-3xl text-xl leading-8 text-[#425a70] dark:text-[#b9c8d9]">
            {item.excerpt}
          </p>
          <div className="mt-8 flex items-center gap-4 text-sm text-[#587084] dark:text-[#71869e]">
            <span>{item.authorName}</span>
            <span>·</span>
            <span>{readingMinutes} min read</span>
            <a
              href={`mailto:?subject=${encodeURIComponent(item.title)}&body=${encodeURIComponent(`https://asrro.org/news/${item.slug}`)}`}
              aria-label="Share article"
              className="ml-auto grid size-11 place-items-center rounded-full border border-[#2359d4]/15 transition hover:border-[#00a6b2]/40 hover:text-[#007d89] dark:border-white/10 dark:hover:border-[#65f2f1]/40 dark:hover:text-[#65f2f1]"
            >
              <Share2 className="size-4" />
            </a>
          </div>
        </div>
      </header>
      <div className="border-y border-[#2359d4]/15 bg-[#eaf0f6] px-5 py-20 sm:px-8 lg:px-12 dark:border-white/10 dark:bg-[#081524]">
        <div className="mx-auto max-w-3xl text-lg leading-9 text-[#425a70] dark:text-[#b9c8d9]">
          <RichText value={item.body} />
          {item.tags.length ? (
            <div className="flex flex-wrap gap-2 pt-6">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-[#2359d4]/20 px-3 py-1 font-mono text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <ArticleComments blogId={item._id} />
    </article>
  )
}
