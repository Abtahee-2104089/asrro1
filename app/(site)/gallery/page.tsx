import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Images, Play } from "lucide-react"
import { fetchQuery } from "convex/nextjs"
import { PageHero } from "@/components/shared/page-hero"
import { SignalVisual } from "@/components/shared/signal-visual"
import { api } from "@/convex/_generated/api"

const galleryYearFormatter = new Intl.DateTimeFormat("en-BD", {
  year: "numeric",
  timeZone: "Asia/Dhaka",
})
export const metadata: Metadata = {
  title: "Gallery",
  description:
    "ASRRO event albums, field tests, workshops, and milestone archives.",
}
export default async function GalleryPage() {
  const gallery = await fetchQuery(api.gallery.listPublicCards)
  const videoAlbum = gallery.find((item) => item.videoUrl)
  return (
    <>
      <PageHero
        eyebrow="Visual archive / field evidence"
        title="Proof that we showed up."
        intro="A record of test days, workshops, competitions, quiet lab breakthroughs, and the people behind the systems."
      />
      <section className="px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto grid max-w-[88rem] gap-4 md:grid-cols-2 lg:grid-cols-3">
          {gallery.map(
            ({ album, coverUrl, imageCount, videoCount, event }, index) => (
              <article
                key={album._id}
                className={index === 0 ? "md:col-span-2" : ""}
              >
                <Link
                  href={`/gallery/${album.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-[#2359d4]/15 bg-white/85 shadow-[0_16px_45px_rgba(35,89,212,.06)] transition hover:border-[#00a6b2]/40 dark:border-white/10 dark:bg-[#09182a] dark:shadow-none dark:hover:border-[#65f2f1]/40"
                >
                  <div
                    className={`relative ${index === 0 ? "aspect-[16/7]" : "aspect-[16/10]"}`}
                  >
                    {coverUrl ? (
                      <Image
                        src={coverUrl}
                        alt={album.title}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <SignalVisual
                        code={album.slug.toUpperCase().slice(0, 12)}
                        className="absolute inset-0"
                      />
                    )}
                  </div>
                  <div className="flex items-end justify-between gap-5 p-5">
                    <div>
                      <p className="font-mono text-[9px] tracking-[.16em] text-[#007d89] uppercase dark:text-[#65f2f1]">
                        Album · {galleryYearFormatter.format(album.occurredAt)}
                        {event ? ` · ${event.name}` : " · Independent archive"}
                      </p>
                      <h2 className="mt-2 text-xl font-semibold">
                        {album.title}
                      </h2>
                    </div>
                    <span className="flex shrink-0 items-center gap-2 text-sm text-[#587084] dark:text-[#8296ad]">
                      <Images className="size-4" />
                      {imageCount} images
                      {videoCount ? ` · ${videoCount} videos` : ""}
                    </span>
                  </div>
                </Link>
              </article>
            )
          )}
        </div>
        {gallery.some((item) => item.videoUrl) ? (
          <a
            href={videoAlbum?.videoUrl ?? undefined}
            target="_blank"
            rel="noreferrer"
            className="mx-auto mt-8 flex max-w-[88rem] items-center gap-4 rounded-2xl border border-[#2359d4]/25 bg-[#eef3ff] p-6 dark:border-[#3d8bff]/30 dark:bg-[#0b1d31]"
          >
            <span className="grid size-12 place-items-center rounded-full bg-[#00a6b2] text-white dark:bg-[#65f2f1] dark:text-[#03101e]">
              <Play className="size-5 fill-current" />
            </span>
            <div>
              <p className="font-semibold">{videoAlbum?.album.title} · video</p>
              <p className="mt-1 text-sm text-[#587084] dark:text-[#8296ad]">
                Watch a video from the public visual archive.
              </p>
            </div>
          </a>
        ) : null}
        {gallery.length === 0 ? (
          <div className="mx-auto max-w-[88rem] rounded-xl border border-dashed border-[#2359d4]/25 p-12 text-center text-[#4b6175] dark:border-white/15 dark:text-[#9fb1c5]">
            No public gallery albums have been released yet.
          </div>
        ) : null}
      </section>
    </>
  )
}
