import Link from "next/link"
import type { ComponentProps } from "react"
import { ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function SiteButton({
  children,
  className,
  variant = "primary",
  ...props
}: ComponentProps<typeof Link> & { variant?: "primary" | "ghost" }) {
  return (
    <Link
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-[#57e6e6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06101f] focus-visible:outline-none",
        variant === "primary"
          ? "bg-[var(--asrro-accent,#57e6e6)] text-[#03101e] hover:brightness-110"
          : "border border-white/15 text-[#e9f6ff] hover:border-[#57e6e6]/60 hover:bg-white/5",
        className
      )}
      {...props}
    >
      {children}
      <ArrowUpRight className="size-4" aria-hidden />
    </Link>
  )
}
