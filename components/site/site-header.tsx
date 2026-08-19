"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Menu,
  Search,
  X,
  FolderKanban,
  CalendarDays,
  Newspaper,
  Users,
  FileText,
  LogIn,
} from "lucide-react"
import { useMemo, useState } from "react"
import {
  CommandPalette,
  type CommandItem,
} from "@/components/motion/command-palette"
import { AsrroMark } from "@/components/shared/asrro-mark"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/events", label: "Events" },
  { href: "/committee", label: "People" },
  { href: "/publications", label: "Research" },
  { href: "/news", label: "News" },
]
const icons = {
  Project: FolderKanban,
  Event: CalendarDays,
  News: Newspaper,
  Alumni: Users,
  Committee: Users,
  Publication: FileText,
}
const publicCommands = [
  { type: "Project", title: "Browse projects", href: "/projects" },
  { type: "Event", title: "Browse events", href: "/events" },
  { type: "News", title: "Read news and field notes", href: "/news" },
  { type: "Alumni", title: "Find alumni", href: "/alumni" },
  { type: "Committee", title: "Meet the committee", href: "/committee" },
  {
    type: "Publication",
    title: "Browse publications",
    href: "/publications",
  },
  { type: "Publication", title: "Search the public archive", href: "/search" },
] as const

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const commands = useMemo<CommandItem[]>(
    () =>
      publicCommands.map((item, index) => ({
        id: `${item.type}-${index}`,
        label: item.title,
        group: item.type,
        keywords: [item.type, item.title],
        icon: icons[item.type],
        onSelect: () => router.push(item.href),
      })),
    [router]
  )

  return (
    <header
      style={{ viewTransitionName: "asrro-public-header" }}
      className="sticky top-0 z-50 border-b border-[#2359d4]/15 bg-[#f4f7fb]/92 text-[#07111f] backdrop-blur-2xl dark:border-white/10 dark:bg-[#06101f]/92 dark:text-[#eef8ff]"
    >
      <div className="hidden h-6 items-center justify-between border-b border-[#2359d4]/10 px-8 font-mono text-[8px] tracking-[.2em] text-[#587084] uppercase sm:flex lg:px-12 dark:border-white/7 dark:text-[#71869e]">
        <span className="flex items-center gap-2">
          <span className="size-1.5 bg-[#00a6b2] shadow-[0_0_10px_rgba(0,166,178,.6)] dark:bg-[#65f2f1]" />
          Public uplink online
        </span>
        <span>CUET · 23.4607° N · 91.9710° E</span>
      </div>
      <div className="mx-auto flex h-[4.75rem] max-w-[94rem] items-center gap-3 px-5 sm:px-8 lg:gap-5 lg:px-12">
        <Link
          href="/"
          className="mr-auto flex items-center gap-3 rounded-sm focus-visible:ring-2 focus-visible:ring-[#57e6e6] focus-visible:outline-none"
          aria-label="ASRRO home"
        >
          <AsrroMark priority className="size-12 rounded-lg" />
          <span>
            <span className="block font-heading text-base font-bold tracking-[0.18em]">
              ASRRO
            </span>
            <span className="hidden font-mono text-[8px] tracking-[0.16em] text-[#587084] uppercase sm:block dark:text-[#8fa7c0]">
              Andromeda Space Research and Robotics Organization
            </span>
          </span>
        </Link>
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-1 lg:flex"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative px-3 py-2 text-sm font-medium transition after:absolute after:inset-x-3 after:-bottom-[1.3rem] after:h-0.5 after:origin-left after:scale-x-0 after:bg-[#00a6b2] after:transition-transform hover:text-[#007d89] focus-visible:ring-2 focus-visible:ring-[#00a6b2] focus-visible:outline-none dark:after:bg-[#65f2f1] dark:hover:text-[#65f2f1]",
                pathname.startsWith(item.href)
                  ? "text-[#07111f] after:scale-x-100 dark:text-white"
                  : "text-[#486076] dark:text-[#aebed0]"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="flex min-h-11 items-center gap-2 border border-[#2359d4]/20 bg-white/60 px-3 text-[#486076] transition hover:border-[#00a6b2]/60 hover:text-[#07111f] focus-visible:ring-2 focus-visible:ring-[#00a6b2] focus-visible:outline-none dark:border-white/15 dark:bg-white/4 dark:text-[#b9c8d9] dark:hover:border-[#65f2f1]/50 dark:hover:text-white"
          aria-label="Open site search"
        >
          <Search className="size-4" />
          <span className="hidden text-xs xl:block">Search</span>
          <kbd className="hidden border border-[#2359d4]/15 px-1.5 py-0.5 font-mono text-[9px] xl:block dark:border-white/10">
            ⌘K
          </kbd>
        </button>
        <ThemeToggle className="hidden xl:inline-grid" />
        <Link
          href="/membership"
          className="hidden min-h-11 items-center bg-[#07111f] px-4 text-sm font-semibold text-white transition hover:bg-[#2359d4] sm:flex dark:bg-[#65f2f1] dark:text-[#03101e] dark:hover:bg-[#8bf7f5]"
        >
          Join ASRRO
        </Link>
        <Link
          href="/login"
          className="hidden min-h-11 items-center gap-2 border border-[#2359d4]/20 px-4 text-sm font-semibold text-[#284056] transition hover:border-[#00a6b2]/60 hover:text-[#07111f] focus-visible:ring-2 focus-visible:ring-[#00a6b2] focus-visible:outline-none sm:flex dark:border-white/15 dark:text-[#dbe9f5] dark:hover:border-[#65f2f1]/50 dark:hover:text-white"
        >
          <LogIn className="size-4" />
          Dashboard
        </Link>
        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          className="grid size-11 place-items-center border border-[#2359d4]/20 bg-white/60 lg:hidden dark:border-white/15 dark:bg-white/5"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {menuOpen ? (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="border-t border-[#2359d4]/10 bg-[#eef3f8]/96 px-5 py-5 shadow-2xl lg:hidden dark:border-white/10 dark:bg-[#071322]/98"
        >
          <div className="grid gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-[#2359d4]/10 px-3 py-3 font-heading text-lg text-[#182b3d] hover:bg-white dark:border-white/8 dark:text-[#dbe9f5] dark:hover:bg-white/5"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/gallery"
              onClick={() => setMenuOpen(false)}
              className="border-b border-[#2359d4]/10 px-3 py-3 font-heading text-lg text-[#182b3d] dark:border-white/8 dark:text-[#dbe9f5]"
            >
              Gallery
            </Link>
            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="border-b border-[#2359d4]/10 px-3 py-3 font-heading text-lg text-[#182b3d] dark:border-white/8 dark:text-[#dbe9f5]"
            >
              Contact
            </Link>
            <Link
              href="/membership"
              onClick={() => setMenuOpen(false)}
              className="mt-3 bg-[#07111f] px-4 py-3 text-center font-semibold text-white dark:bg-[#65f2f1] dark:text-[#03101e]"
            >
              Join ASRRO
            </Link>
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 border border-[#2359d4]/20 px-4 py-3 text-center font-semibold text-[#182b3d] dark:border-white/15 dark:text-[#dbe9f5]"
            >
              <LogIn className="size-4" />
              Member dashboard
            </Link>
            <ThemeToggle className="mt-2 ml-auto" />
          </div>
        </nav>
      ) : null}
      <CommandPalette
        items={commands}
        open={searchOpen}
        onOpenChange={setSearchOpen}
        placeholder="Search projects, events, people, and research…"
        emptyMessage="No mission record matches that search."
      />
    </header>
  )
}
