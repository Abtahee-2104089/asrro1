import Link from "next/link"
import {
  Code2,
  BriefcaseBusiness,
  Video,
  MessageCircle,
  ArrowUpRight,
  Camera,
} from "lucide-react"
import { fetchQuery } from "convex/nextjs"
import { AsrroMark } from "@/components/shared/asrro-mark"
import { api } from "@/convex/_generated/api"

const links = [
  [
    "Organization",
    [
      ["About", "/about"],
      ["Committee", "/committee"],
      ["Alumni", "/alumni"],
      ["Contact", "/contact"],
      ["Member dashboard", "/login"],
    ],
  ],
  [
    "Explore",
    [
      ["Projects", "/projects"],
      ["Events", "/events"],
      ["Gallery", "/gallery"],
      ["Publications", "/publications"],
      ["News", "/news"],
    ],
  ],
] as const

export async function SiteFooter() {
  const [settings, branding] = await Promise.all([
    fetchQuery(api.content.publicSettings),
    fetchQuery(api.content.publicBranding),
  ])
  const value = (key: string, fallback: string) =>
    settings.find((item) => item.key === key)?.value || fallback
  const socials = [
    [
      MessageCircle,
      "Facebook",
      value("social.facebook", "https://facebook.com"),
    ],
    [
      BriefcaseBusiness,
      "LinkedIn",
      value("social.linkedin", "https://linkedin.com"),
    ],
    [Video, "YouTube", value("social.youtube", "https://youtube.com")],
    [Code2, "GitHub", value("social.github", "https://github.com")],
    [Camera, "Instagram", value("social.instagram", "https://instagram.com")],
  ] as const
  return (
    <footer className="relative border-t border-[#2359d4]/15 bg-[#eaf0f6] px-5 pt-16 pb-8 text-[#425a70] sm:px-8 lg:px-12 2xl:ml-8 dark:border-white/10 dark:bg-[#030a14] dark:text-[#b9c8d9]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00a6b2] to-transparent opacity-60 dark:via-[#65f2f1]" />
      <div className="mx-auto max-w-[88rem]">
        <div className="grid gap-12 lg:grid-cols-[1.35fr_.65fr_.65fr]">
          <div className="max-w-lg">
            <div className="mb-5 flex items-center gap-3">
              <AsrroMark className="size-16 rounded-lg" />
              <span>
                <span className="block font-heading font-bold tracking-[0.2em] text-[#07111f] dark:text-white">
                  ASRRO
                </span>
                <span className="mt-1 block font-mono text-[8px] tracking-[.16em] uppercase">
                  Andromeda Space &amp; Robotics
                </span>
              </span>
            </div>
            <p className="max-w-md text-lg leading-8">
              {branding.organizationName} builds practical capacity in space
              science, robotics, and intelligent systems—from Chattogram to the
              frontier.
            </p>
            <p className="mt-5 border-l-2 border-[#d97706] pl-4 font-mono text-[9px] tracking-[0.18em] text-[#587084] uppercase dark:text-[#71869e]">
              Chittagong University of Engineering & Technology
            </p>
          </div>
          {links.map(([title, items]) => (
            <div key={title}>
              <p className="mb-4 font-mono text-[10px] tracking-[0.2em] text-[#007d89] uppercase dark:text-[#65f2f1]">
                {title}
              </p>
              <ul className="space-y-3">
                {items.map(([label, href]) => (
                  <li key={href}>
                    <Link
                      className="inline-flex items-center gap-1 transition hover:text-[#007d89] dark:hover:text-white"
                      href={href}
                    >
                      {label}
                      <ArrowUpRight className="size-3" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col gap-5 border-t border-[#2359d4]/15 pt-6 text-xs text-[#587084] sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:text-[#71869e]">
          <p>© 2026 Andromeda Space and Robotics Research Organization.</p>
          <div className="flex gap-2">
            {socials.map(([Icon, label, href]) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="grid size-9 place-items-center border border-[#2359d4]/15 transition hover:border-[#00a6b2] hover:text-[#007d89] dark:border-white/10 dark:hover:text-white"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
