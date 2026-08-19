import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, CalendarDays, Images } from "lucide-react"
import { fetchQuery } from "convex/nextjs"

import { PageHero } from "@/components/shared/page-hero"
import { api } from "@/convex/_generated/api"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const result = await fetchQuery(api.gallery.getPublicAlbum, { slug })
  return {
    title: result?.album.title ?? "Gallery album",
    description: result?.album.description,
  }
}

export default async function GalleryAlbumPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const result = await fetchQuery(api.gallery.getPublicAlbum, { slug })
  if (!result) notFound()
  return (
    <>
      <PageHero
        eyebrow={
          result.event
            ? `Event archive / ${result.event.name}`
            : "Independent visual archive"
        }
        title={result.album.title}
        intro={
          result.album.description ??
          "Images and video from the ASRRO field archive."
        }
      />
      <section className="px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-[88rem]">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 text-sm text-[#587084] dark:text-[#8fa7c0]"
            >
              <ArrowLeft className="size-4" /> All albums
            </Link>
            {result.event ? (
              <Link
                href={`/events/${result.event.slug}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#007d89] dark:text-[#65f2f1]"
              >
                <CalendarDays className="size-4" /> Open related event
              </Link>
            ) : null}
          </div>
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {result.items.map(({ item, url, kind }) =>
              url ? (
                <figure
                  key={item._id}
                  className="mb-4 break-inside-avoid overflow-hidden rounded-xl border border-[#2359d4]/15 bg-white dark:border-white/10 dark:bg-[#09182a]"
                >
                  {kind === "video" ? (
                    <video
                      src={url}
                      controls
                      preload="metadata"
                      className="w-full"
                      aria-label={item.caption ?? "Gallery video"}
                    >
                      <track
                        kind="captions"
                        srcLang="en"
                        label="English"
                        src={`data:text/vtt;charset=utf-8,${encodeURIComponent(`WEBVTT\n\n00:00.000 --> 99:59:59.000\n${item.caption ?? result.album.title}`)}`}
                      />
                    </video>
                  ) : (
                    <Image
                      src={url}
                      alt={item.caption ?? result.album.title}
                      width={1200}
                      height={800}
                      unoptimized
                      className="h-auto w-full object-cover"
                    />
                  )}
                  {item.caption ? (
                    <figcaption className="p-4 text-sm text-[#587084] dark:text-[#8fa7c0]">
                      {item.caption}
                    </figcaption>
                  ) : null}
                </figure>
              ) : null
            )}
          </div>
          {result.items.length === 0 ? (
            <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-[#2359d4]/25 text-center text-[#587084] dark:border-white/15 dark:text-[#8fa7c0]">
              <p>
                <Images className="mx-auto mb-3 size-6" />
                This album is ready for its first public upload.
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </>
  )
}
