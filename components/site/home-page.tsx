import Link from "next/link"
import { ArrowRight, Eye, Flag } from "lucide-react"
import Image from "next/image"
import { fetchQuery } from "convex/nextjs"
import { AnimatedNumber } from "@/components/motion/animated-number"
import { TextReveal } from "@/components/motion/text-reveal"
import { OrbitalHero } from "@/components/site/orbital-hero"
import { HomeUpcomingEvents } from "@/components/site/home-upcoming-events"
import { SectionHeading } from "@/components/shared/section-heading"
import { SignalVisual } from "@/components/shared/signal-visual"
import { SiteButton } from "@/components/shared/site-button"
import { api } from "@/convex/_generated/api"

const homeNewsDateFormatter = new Intl.DateTimeFormat("en-BD", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Dhaka",
})
export async function HomePage() {
  const [projectResult, newsResult, statistics, branding] = await Promise.all([
    fetchQuery(api.projects.listPublic, {
      featured: true,
      paginationOpts: { numItems: 3, cursor: null },
    }),
    fetchQuery(api.blogs.listPublic, {
      paginationOpts: { numItems: 4, cursor: null },
    }),
    fetchQuery(api.content.publicStatistics),
    fetchQuery(api.content.publicBranding),
  ])
  const projects = projectResult.page
  const projectCovers = await Promise.all(
    projects.map(async (project) =>
      project.coverAssetId
        ? await fetchQuery(api.assets.getPublicUrl, {
            assetId: project.coverAssetId,
          })
        : null
    )
  )
  const news = newsResult.page
  const stats = [
    ["Active members", statistics.members, "+"],
    ["Built projects", statistics.projects, ""],
    ["National events", statistics.events, ""],
    ["Alumni network", statistics.alumni, ""],
    ["Research papers", statistics.publications, ""],
  ] as const
  return (
    <>
      <section className="relative overflow-hidden border-b border-[#2359d4]/15 px-5 pt-14 pb-16 sm:px-8 lg:px-12 lg:pt-20 lg:pb-24 dark:border-white/10">
        <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(35,89,212,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(35,89,212,.12)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent_80%)] [background-size:44px_44px] opacity-40 dark:[background-image:linear-gradient(#203551_1px,transparent_1px),linear-gradient(90deg,#203551_1px,transparent_1px)] dark:opacity-20" />
        <div className="relative mx-auto grid max-w-[88rem] items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <p className="mb-6 flex items-center gap-3 font-mono text-[10px] tracking-[.22em] text-[#007d89] uppercase dark:text-[#65f2f1]">
              <span className="size-1.5 bg-[#d97706] shadow-[0_0_12px_#d97706]" />
              Frontier technology research · CUET
            </p>
            <TextReveal
              as="h1"
              text={["Engineering the", "next horizon."]}
              className="max-w-4xl font-heading text-6xl leading-[.9] font-semibold tracking-[-.065em] text-[#07111f] sm:text-7xl xl:text-[6.7rem] dark:text-[#f4fbff]"
              stagger={0.07}
            />
            <p className="mt-7 max-w-xl border-l-2 border-[#2359d4] pl-5 text-lg leading-8 text-[#425a70] dark:text-[#b9c8d9]">
              ASRRO is a student-led research organization turning ambitious
              questions in space, robotics, AI, and electronics into
              field-tested systems.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <SiteButton href="/projects">Explore our work</SiteButton>
              <SiteButton
                href="/membership"
                variant="ghost"
                className="border-[#2359d4]/25 text-[#07111f] hover:bg-white dark:border-white/15 dark:text-[#e9f6ff] dark:hover:bg-white/5"
              >
                Join the mission
              </SiteButton>
            </div>
          </div>
          {branding.heroUrl ? (
            <div className="relative aspect-square overflow-hidden rounded-full border border-[#2359d4]/20 dark:border-white/10">
              <Image
                src={branding.heroUrl}
                alt="ASRRO current highlight"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                unoptimized
                className="object-cover"
              />
            </div>
          ) : (
            <OrbitalHero />
          )}
        </div>
      </section>
      <section className="border-b border-[#2359d4]/15 bg-white/45 px-5 sm:px-8 lg:px-12 dark:border-white/10 dark:bg-white/[.015]">
        <div className="mx-auto grid max-w-[88rem] grid-cols-2 lg:grid-cols-5">
          {stats.map(([label, value, suffix]) => (
            <div
              key={label}
              className="border-[#2359d4]/15 px-3 py-8 even:border-l lg:border-l lg:px-6 lg:first:border-l-0 dark:border-white/10"
            >
              <p className="font-heading text-4xl font-semibold tracking-[-.05em] text-[#07111f] sm:text-5xl dark:text-white">
                <AnimatedNumber value={value} />
                {suffix}
              </p>
              <p className="mt-2 font-mono text-[9px] tracking-[.18em] text-[#587084] uppercase dark:text-[#8296ad]">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-[88rem] gap-5 lg:grid-cols-[1.15fr_.85fr_.85fr]">
          <div className="rounded-2xl border border-[#2359d4]/15 bg-white p-8 dark:border-white/10 dark:bg-[#09182a]">
            <p className="font-mono text-[10px] tracking-[.2em] text-[#007d89] uppercase dark:text-[#65f2f1]">
              About ASRRO
            </p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-.05em]">
              {branding.aboutTitle}
            </h2>
            <p className="mt-5 leading-8 text-[#425a70] dark:text-[#9fb1c5]">
              {branding.aboutCopy}
            </p>
            <SiteButton href="/about" variant="ghost" className="mt-7">
              Read our story
            </SiteButton>
          </div>
          <article className="rounded-2xl border border-[#2359d4]/15 bg-[#eef3ff] p-7 dark:border-[#3d8bff]/25 dark:bg-[#0b1d31]">
            <Flag className="size-6 text-[#007d89] dark:text-[#65f2f1]" />
            <p className="mt-12 font-mono text-[9px] tracking-[.18em] text-[#587084] uppercase dark:text-[#8296ad]">
              Mission
            </p>
            <h3 className="mt-3 text-2xl font-semibold">{branding.mission}</h3>
          </article>
          <article className="rounded-2xl border border-[#d97706]/20 bg-[#fff8eb] p-7 dark:border-[#ffb84d]/20 dark:bg-[#1d180e]">
            <Eye className="size-6 text-[#b85f00] dark:text-[#ffb84d]" />
            <p className="mt-12 font-mono text-[9px] tracking-[.18em] text-[#725017] uppercase dark:text-[#c8aa75]">
              Vision
            </p>
            <h3 className="mt-3 text-2xl font-semibold">{branding.vision}</h3>
          </article>
        </div>
      </section>
      {branding.highlightsEnabled ? (
        <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-[88rem]">
            <SectionHeading
              eyebrow="Selected systems / 2024—26"
              title="Ideas become instruments here."
              copy="Our teams work across disciplines, moving from research question to prototype, test data, and public documentation."
              action={
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#007d89] hover:text-[#2359d4] dark:text-[#65f2f1]"
                >
                  All projects <ArrowRight className="size-4" />
                </Link>
              }
            />
            <div className="grid gap-4 lg:grid-cols-3">
              {projects.slice(0, 3).map((project, index) => (
                <Link
                  key={project.slug}
                  href={`/projects/${project.slug}`}
                  className="group overflow-hidden rounded-xl border border-[#2359d4]/15 bg-white shadow-[0_16px_45px_rgba(25,55,90,.08)] transition hover:-translate-y-1 hover:border-[#00a6b2]/55 motion-reduce:transform-none dark:border-white/10 dark:bg-[#09182a] dark:shadow-none dark:hover:border-[#65f2f1]/45"
                >
                  <div className="relative aspect-[16/10] border-b border-[#2359d4]/15 dark:border-white/10">
                    {projectCovers[index] ? (
                      <Image
                        src={projectCovers[index]}
                        alt={project.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, 100vw"
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <SignalVisual
                        code={`P-${String(index + 1).padStart(2, "0")}`}
                        className="absolute inset-0"
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <div className="mb-4 flex items-center justify-between font-mono text-[9px] tracking-[.16em] text-[#587084] uppercase dark:text-[#8296ad]">
                      <span>{project.category}</span>
                      <span className="text-[#b45f00] dark:text-[#ffb84d]">
                        {project.projectState}
                      </span>
                    </div>
                    <h3 className="text-2xl font-semibold tracking-[-.035em] text-[#07111f] group-hover:text-[#007d89] dark:text-white dark:group-hover:text-[#65f2f1]">
                      {project.title}
                    </h3>
                    <p className="mt-3 leading-7 text-[#4b6175] dark:text-[#9fb1c5]">
                      {project.summary}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <section className="border-y border-[#2359d4]/15 bg-[#eaf0f6] px-5 py-20 sm:px-8 lg:px-12 lg:py-24 dark:border-white/10 dark:bg-[#081524]">
        <div className="mx-auto grid max-w-[88rem] gap-12 lg:grid-cols-[.75fr_1.25fr]">
          <SectionHeading
            eyebrow="Upcoming / field calendar"
            title="Meet us where the work happens."
            copy="Compete, train, question, and build alongside a national community of student engineers."
          />
          <HomeUpcomingEvents />
        </div>
      </section>
      <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[88rem]">
          <SectionHeading
            eyebrow="Signal log / ASRRO news"
            title="From the lab and beyond."
            action={
              <Link
                href="/news"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#007d89] dark:text-[#65f2f1]"
              >
                View all updates <ArrowRight className="size-4" />
              </Link>
            }
          />
          <div className="grid gap-px overflow-hidden rounded-xl bg-[#2359d4]/15 md:grid-cols-2 lg:grid-cols-4 dark:bg-white/10">
            {news.map((item) => (
              <Link
                key={item.slug}
                href={`/news/${item.slug}`}
                className="group bg-white p-6 hover:bg-[#eef6f8] dark:bg-[#09182a] dark:hover:bg-[#0c1d32]"
              >
                <p className="font-mono text-[9px] tracking-[.18em] text-[#007d89] uppercase dark:text-[#65f2f1]">
                  {item.category}
                </p>
                <h3 className="mt-8 text-xl leading-tight font-semibold tracking-[-.025em] group-hover:text-[#007d89] dark:group-hover:text-[#65f2f1]">
                  {item.title}
                </h3>
                <p className="mt-5 text-sm text-[#587084] dark:text-[#8296ad]">
                  {item.publishedAt
                    ? homeNewsDateFormatter.format(item.publishedAt)
                    : "Unscheduled"}{" "}
                  · {item.authorName}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">
        <div className="relative mx-auto max-w-[88rem] overflow-hidden rounded-2xl border border-[#2359d4]/25 bg-[#07111f] p-8 text-white shadow-[0_30px_90px_rgba(25,55,90,.16)] sm:p-12 lg:flex lg:items-end lg:justify-between lg:p-16 dark:border-[#65f2f1]/20 dark:bg-[#0b1c31]">
          <div className="pointer-events-none absolute -top-32 -right-24 size-96 rounded-full border border-[#65f2f1]/15" />
          <div>
            <p className="font-mono text-[10px] tracking-[.22em] text-[#ffb84d] uppercase">
              Membership intake · 2026
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-.05em] sm:text-6xl">
              Your curiosity belongs in the lab.
            </h2>
            <p className="mt-5 max-w-2xl leading-7 text-[#aebed0]">
              Join project teams, skill sprints, field trials, and a community
              that learns by building.
            </p>
          </div>
          <SiteButton href="/membership" className="mt-8 shrink-0 lg:mt-0">
            Start application
          </SiteButton>
        </div>
      </section>
    </>
  )
}
