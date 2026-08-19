import { ArrowLeft, Orbit } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <main className="surface-grid grid min-h-svh place-items-center px-6 py-16">
      <section className="hairline-glow w-full max-w-xl rounded-3xl border bg-card/90 p-8 text-center backdrop-blur-xl sm:p-12">
        <div className="mx-auto mb-6 grid size-14 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
          <Orbit aria-hidden className="size-7" />
        </div>
        <p className="font-mono text-xs tracking-[0.24em] text-primary uppercase">
          Signal lost · 404
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
          This trajectory leads beyond the map.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
          The page may have moved, or the link may be out of date. Return to
          mission control and choose a new path.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
        >
          <ArrowLeft aria-hidden className="size-4" />
          Return home
        </Link>
      </section>
    </main>
  )
}
