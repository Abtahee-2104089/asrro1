"use client"

import {
  Bell,
  BookOpenText,
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardCheck,
  CreditCard,
  FileBarChart,
  FileUp,
  FolderKanban,
  Gauge,
  LogOut,
  Menu,
  PanelLeftClose,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react"
import { useQuery } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useMemo, useState, type ReactNode } from "react"

import {
  AnimatedSidebar,
  AnimatedSidebarClose,
  AnimatedSidebarContent,
  AnimatedSidebarFooter,
  AnimatedSidebarGroup,
  AnimatedSidebarGroupContent,
  AnimatedSidebarGroupLabel,
  AnimatedSidebarHeader,
  AnimatedSidebarInset,
  AnimatedSidebarMenu,
  AnimatedSidebarMenuButton,
  AnimatedSidebarMenuItem,
  AnimatedSidebarProvider,
  AnimatedSidebarRail,
  AnimatedSidebarTrigger,
  useAnimatedSidebar,
} from "@/components/motion/animated-sidebar"
import {
  CommandPalette,
  type CommandItem,
} from "@/components/motion/command-palette"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { api } from "@/convex/_generated/api"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

type MemberSelf = Exclude<FunctionReturnType<typeof api.members.me>, null>
type PortalRole = "member" | "executive" | "admin"
type PortalPermission = MemberSelf["permissions"][number]

type NavItem = {
  label: string
  href: string
  icon: LucideIcon
  minimumRole: PortalRole
  permission?: PortalPermission
  badge?: string
  keywords?: string[]
}

const memberNav: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: Gauge,
    minimumRole: "member",
    keywords: ["home", "summary"],
  },
  {
    label: "My profile",
    href: "/dashboard/profile",
    icon: UserRound,
    minimumRole: "member",
    keywords: ["personal", "account"],
  },
  {
    label: "Membership card",
    href: "/dashboard/membership",
    icon: CreditCard,
    minimumRole: "member",
    keywords: ["uuid", "download", "qr"],
  },
  {
    label: "Events",
    href: "/dashboard/events",
    icon: CalendarDays,
    minimumRole: "member",
    keywords: ["register", "attended", "upcoming"],
  },
  {
    label: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
    minimumRole: "member",
    keywords: ["updates", "announcements"],
  },
]

const executiveNav: NavItem[] = [
  {
    label: "Members",
    href: "/dashboard/members",
    icon: UsersRound,
    minimumRole: "executive",
    permission: "membership_manage",
    keywords: ["approval", "applications", "bulk"],
  },
  {
    label: "Event operations",
    href: "/dashboard/event-management",
    icon: ClipboardCheck,
    minimumRole: "executive",
    permission: "events_manage",
    keywords: ["registration", "attendance", "manage"],
  },
  {
    label: "Committee",
    href: "/dashboard/committee",
    icon: ShieldCheck,
    minimumRole: "executive",
    permission: "committee_manage",
    keywords: ["executive", "positions", "session"],
  },
  {
    label: "Finance",
    href: "/dashboard/finance",
    icon: ChartNoAxesCombined,
    minimumRole: "executive",
    permission: "finance_manage",
    keywords: ["income", "expense", "budget"],
  },
  {
    label: "Projects",
    href: "/dashboard/projects",
    icon: FolderKanban,
    minimumRole: "executive",
    permission: "projects_manage",
    keywords: ["portfolio", "inventory"],
  },
  {
    label: "Content",
    href: "/dashboard/content",
    icon: BookOpenText,
    minimumRole: "executive",
    permission: "content_manage",
    keywords: ["blog", "gallery", "publications"],
  },
  {
    label: "Reports",
    href: "/dashboard/reports",
    icon: FileBarChart,
    minimumRole: "executive",
    permission: "reports_view",
    keywords: ["export", "pdf", "csv", "excel"],
  },
  {
    label: "Files",
    href: "/dashboard/files",
    icon: FileUp,
    minimumRole: "executive",
    permission: "files_manage",
    keywords: ["upload", "video", "document", "assets"],
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    minimumRole: "admin",
    keywords: ["website", "theme", "email"],
  },
]

const roleRank: Record<PortalRole, number> = {
  member: 0,
  executive: 1,
  admin: 2,
}

function isActivePath(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href)
}

function ShellTopbar({
  onSearch,
  initials,
}: {
  onSearch: () => void
  initials: string
}) {
  const pathname = usePathname()
  const active = [...memberNav, ...executiveNav].find((item) =>
    isActivePath(pathname, item.href)
  )

  return (
    <header className="sticky top-0 z-30 flex h-[4.5rem] items-center gap-2.5 border-b border-slate-200/80 bg-[#f8fafc]/90 px-3 backdrop-blur-xl sm:gap-3 sm:px-6 lg:px-8 dark:border-white/8 dark:bg-[#07111f]/88">
      <AnimatedSidebarTrigger className="-ml-1 border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-cyan-300 hover:text-slate-950 md:hidden dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-cyan-400/40 dark:hover:text-white">
        <Menu className="size-5" />
      </AnimatedSidebarTrigger>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="hidden size-1.5 rounded-full bg-cyan-500 shadow-[0_0_0_4px_rgba(6,182,212,.12)] sm:block" />
          <p className="font-display truncate text-sm font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
            {active?.label ?? "ASRRO portal"}
          </p>
        </div>
        <p className="mt-0.5 hidden font-mono text-[9px] tracking-[0.16em] text-slate-400 uppercase sm:block">
          OPS / CUET / {active?.minimumRole ?? "member"} channel
        </p>
      </div>
      <button
        type="button"
        onClick={onSearch}
        className="hidden h-10 w-full max-w-[19rem] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-left text-xs text-slate-400 shadow-sm transition outline-none hover:border-cyan-300 hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-cyan-500 sm:flex dark:border-white/10 dark:bg-white/5 dark:text-slate-500 dark:hover:border-cyan-400/40 dark:hover:text-slate-300"
      >
        <Search className="size-3.5" />
        <span className="flex-1">Search portal</span>
        <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[9px] dark:border-white/10 dark:bg-white/5">
          ⌘K
        </kbd>
      </button>
      <button
        type="button"
        aria-label="Search portal"
        onClick={onSearch}
        className="grid size-10 place-items-center rounded-lg text-slate-500 outline-none hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-cyan-500 sm:hidden dark:hover:bg-white/8"
      >
        <Search className="size-4" />
      </button>
      <ThemeToggle className="size-10 rounded-lg border-slate-200 bg-white shadow-none dark:border-white/10 dark:bg-white/5" />
      <Link
        href="/dashboard/notifications"
        aria-label="Notifications"
        className="relative hidden size-10 place-items-center rounded-lg text-slate-500 outline-none hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-cyan-500 sm:grid dark:hover:bg-white/8"
      >
        <Bell className="size-4" />
      </Link>
      <Link
        href="/dashboard/profile"
        aria-label="Open your profile"
        title="Open your profile"
        className="grid size-10 place-items-center rounded-lg bg-[#0b1b31] font-mono text-[10px] font-bold text-white ring-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 dark:bg-cyan-400 dark:text-[#06101d]"
      >
        {initials}
      </Link>
    </header>
  )
}

function SidebarBrand() {
  const { state } = useAnimatedSidebar()
  const collapsed = state === "collapsed"
  return (
    <div className="flex h-14 items-center gap-3 overflow-hidden">
      <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-white shadow-[0_0_0_1px_rgba(255,255,255,.14),0_8px_30px_rgba(34,211,238,.13)]">
        <Image
          src="/asrro-logo.png"
          alt="ASRRO"
          width={38}
          height={38}
          className="size-9 object-contain"
          priority
        />
      </div>
      <div
        className={cn(
          "min-w-0 transition-opacity",
          collapsed && "pointer-events-none opacity-0"
        )}
        aria-hidden={collapsed}
      >
        <p className="font-display truncate text-base font-semibold tracking-[-0.035em] text-white">
          ASRRO
        </p>
        <p className="truncate font-mono text-[8px] tracking-[0.18em] text-cyan-300 uppercase">
          Orbital operations
        </p>
      </div>
    </div>
  )
}

function SidebarNav({
  role,
  permissions,
}: {
  role: PortalRole
  permissions: PortalPermission[]
}) {
  const pathname = usePathname()
  const permissionSet = new Set(permissions)
  const renderItems = (items: NavItem[]) =>
    items.map((item) =>
      roleRank[role] >= roleRank[item.minimumRole] &&
      (role === "admin" ||
        !item.permission ||
        permissionSet.has(item.permission)) ? (
        <AnimatedSidebarMenuItem key={item.href}>
          <AnimatedSidebarMenuButton
            href={item.href}
            icon={<item.icon className="size-[18px]" />}
            badge={
              item.badge ? (
                <span className="rounded-full bg-blue-500/15 px-1.5 py-0.5 text-[9px] font-bold text-blue-300">
                  {item.badge}
                </span>
              ) : undefined
            }
            isActive={isActivePath(pathname, item.href)}
            className="min-h-11 rounded-lg px-2.5 text-slate-400 hover:bg-white/5 hover:text-white focus-visible:bg-white/8 focus-visible:ring-cyan-400 data-[active=true]:bg-cyan-400/10 data-[active=true]:text-cyan-100 md:min-h-10"
          >
            {item.label}
          </AnimatedSidebarMenuButton>
        </AnimatedSidebarMenuItem>
      ) : null
    )

  return (
    <>
      <AnimatedSidebarGroup>
        <AnimatedSidebarGroupLabel className="font-mono text-slate-500">
          Personal channel
        </AnimatedSidebarGroupLabel>
        <AnimatedSidebarGroupContent>
          <AnimatedSidebarMenu>{renderItems(memberNav)}</AnimatedSidebarMenu>
        </AnimatedSidebarGroupContent>
      </AnimatedSidebarGroup>
      {roleRank[role] >= roleRank.executive ? (
        <AnimatedSidebarGroup>
          <AnimatedSidebarGroupLabel className="font-mono text-slate-500">
            Command channel
          </AnimatedSidebarGroupLabel>
          <AnimatedSidebarGroupContent>
            <AnimatedSidebarMenu>
              {renderItems(executiveNav)}
            </AnimatedSidebarMenu>
          </AnimatedSidebarGroupContent>
        </AnimatedSidebarGroup>
      ) : null}
    </>
  )
}

function AccountSummary({
  role,
  name,
  email,
  onSignOut,
  signingOut,
}: {
  role: PortalRole
  name: string
  email: string
  onSignOut: () => void
  signingOut: boolean
}) {
  const { state } = useAnimatedSidebar()
  const collapsed = state === "collapsed"
  return (
    <div className="flex items-center gap-2.5 overflow-hidden rounded-xl border border-white/8 bg-white/[0.035] p-2">
      <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 font-mono text-[10px] font-bold text-cyan-100">
        {getInitials(name)}
      </div>
      <div
        className={cn(
          "min-w-0 flex-1 transition-opacity",
          collapsed && "pointer-events-none opacity-0"
        )}
        aria-hidden={collapsed}
      >
        <p className="truncate text-xs font-semibold text-white">{name}</p>
        <p className="mt-0.5 truncate font-mono text-[8px] tracking-wide text-slate-400 uppercase">
          {role === "admin"
            ? "Super administrator"
            : role === "executive"
              ? "Executive"
              : email}
        </p>
      </div>
      <button
        type="button"
        onClick={onSignOut}
        disabled={signingOut}
        aria-label="Sign out"
        title="Sign out"
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-white/8 hover:text-orange-300 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none disabled:opacity-50",
          collapsed && "hidden"
        )}
      >
        <LogOut className="size-3.5" />
      </button>
    </div>
  )
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
  return initials || "A"
}

function minimumRoleForPath(pathname: string): PortalRole {
  if (pathname.startsWith("/dashboard/settings")) return "admin"
  if (
    [
      "/dashboard/members",
      "/dashboard/event-management",
      "/dashboard/committee",
      "/dashboard/finance",
      "/dashboard/projects",
      "/dashboard/content",
      "/dashboard/reports",
    ].some((prefix) => pathname.startsWith(prefix))
  ) {
    return "executive"
  }
  return "member"
}

function permissionForPath(pathname: string) {
  return executiveNav.find((item) => pathname.startsWith(item.href))?.permission
}

export function PortalShell({
  children,
  initialMember,
}: {
  children: ReactNode
  initialMember: MemberSelf
}) {
  const router = useRouter()
  const pathname = usePathname()
  const liveMember = useQuery(api.members.me)
  const member = liveMember === undefined ? initialMember : liveMember
  const displayMember = member ?? initialMember
  const session = authClient.useSession()
  const [signingOut, setSigningOut] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const role: PortalRole =
    displayMember.systemRole === "super_admin"
      ? "admin"
      : displayMember.systemRole === "executive"
        ? "executive"
        : "member"
  const accountName =
    displayMember.fullName || session.data?.user.name || "ASRRO member"
  const accountEmail =
    displayMember.email || session.data?.user.email || "Member"
  const initials = getInitials(accountName)
  const permissionSet = useMemo(
    () => new Set(displayMember.permissions),
    [displayMember.permissions]
  )
  const visibleNav = useMemo(
    () =>
      [...memberNav, ...executiveNav].filter(
        (item) =>
          roleRank[role] >= roleRank[item.minimumRole] &&
          (role === "admin" ||
            !item.permission ||
            permissionSet.has(item.permission))
      ),
    [permissionSet, role]
  )
  const commandItems = useMemo<CommandItem[]>(
    () =>
      visibleNav.map((item) => ({
        id: item.href,
        label: item.label,
        group: item.minimumRole === "member" ? "Member space" : "Operations",
        keywords: item.keywords,
        icon: item.icon,
        hint: item.badge ? `${item.badge} new` : undefined,
        onSelect: () => router.push(item.href),
      })),
    [router, visibleNav]
  )
  const permitted =
    member?.status === "active" &&
    roleRank[role] >= roleRank[minimumRoleForPath(pathname)] &&
    (role === "admin" ||
      !permissionForPath(pathname) ||
      permissionSet.has(permissionForPath(pathname)!))

  const signOut = async () => {
    setSigningOut(true)
    await authClient.signOut()
    router.replace("/login")
    router.refresh()
  }

  return (
    <AnimatedSidebarProvider
      className="dashboard-theme bg-[#eef3f8] text-slate-950 selection:bg-cyan-200 selection:text-slate-950 dark:bg-[#050b14] dark:text-slate-100 dark:selection:bg-cyan-400/30 dark:selection:text-white"
      style={{
        "--sidebar-width": "17.5rem",
        "--sidebar-width-icon": "4.75rem",
        "--sidebar-width-mobile": "min(20rem,calc(100vw - 2rem))",
      }}
    >
      <AnimatedSidebar
        ariaLabel="Portal navigation"
        panelClassName="border-[#16304b] bg-[#071321] text-white shadow-[18px_0_60px_rgba(2,8,23,.16)]"
        className="z-40"
      >
        <AnimatedSidebarHeader className="border-b border-white/8 px-3 py-3.5">
          <div className="flex items-center justify-between gap-2">
            <SidebarBrand />
            <AnimatedSidebarClose className="border border-white/10 text-slate-400 hover:bg-white/8 hover:text-white md:hidden">
              <X className="size-4" />
            </AnimatedSidebarClose>
          </div>
        </AnimatedSidebarHeader>
        <AnimatedSidebarContent className="[scrollbar-color:rgba(34,211,238,.18)_transparent] px-2 py-3">
          <SidebarNav role={role} permissions={displayMember.permissions} />
        </AnimatedSidebarContent>
        <AnimatedSidebarFooter className="border-white/8 p-2.5">
          <AccountSummary
            role={role}
            name={accountName}
            email={accountEmail}
            onSignOut={() => {
              void signOut()
            }}
            signingOut={signingOut}
          />
        </AnimatedSidebarFooter>
        <AnimatedSidebarRail className="hover:after:bg-cyan-400/60" />
      </AnimatedSidebar>
      <AnimatedSidebarInset className="bg-[#eef3f8] dark:bg-[#050b14]">
        <ShellTopbar onSearch={() => setSearchOpen(true)} initials={initials} />
        <div className="relative flex-1">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden opacity-70 dark:opacity-60"
          >
            <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,.025)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent_60%)] bg-[size:40px_40px] dark:bg-[linear-gradient(rgba(148,163,184,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,.035)_1px,transparent_1px)]" />
            <div className="absolute -top-72 -right-40 size-[38rem] rounded-full border border-cyan-500/10" />
            <div className="absolute -top-52 -right-20 size-[27rem] rounded-full border border-blue-500/10" />
          </div>
          <div className="relative mx-auto w-full max-w-[1580px] px-3 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
            {permitted ? (
              children
            ) : (
              <div className="mx-auto max-w-xl rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm dark:border-amber-400/20 dark:bg-white/5">
                <ShieldCheck className="mx-auto size-8 text-amber-600" />
                <h1 className="mt-4 text-xl font-semibold">
                  Access restricted
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Your active membership does not include the role required for
                  this operations area.
                </p>
                <Link
                  href="/dashboard"
                  className="mt-5 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white dark:bg-cyan-300 dark:text-slate-950"
                >
                  Return to overview
                </Link>
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          aria-label="Collapse sidebar"
          title="Collapse sidebar (Ctrl+B)"
          className="fixed bottom-5 left-3 z-30 hidden size-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm outline-none hover:border-cyan-300 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-cyan-500 md:grid dark:border-white/10 dark:bg-[#0b1828] dark:text-slate-400 dark:hover:border-cyan-400/40 dark:hover:text-white"
          onClick={() =>
            dispatchEvent(
              new KeyboardEvent("keydown", { key: "b", ctrlKey: true })
            )
          }
        >
          <PanelLeftClose className="size-4" />
        </button>
      </AnimatedSidebarInset>
      <CommandPalette
        items={commandItems}
        open={searchOpen}
        onOpenChange={setSearchOpen}
        placeholder="Search members, events, projects, and tools…"
        emptyMessage="No portal destination matches that search."
      />
    </AnimatedSidebarProvider>
  )
}
