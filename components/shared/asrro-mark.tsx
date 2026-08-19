"use client"

import Image from "next/image"
import { useQuery } from "convex/react"

import { cn } from "@/lib/utils"
import { api } from "@/convex/_generated/api"

export function AsrroMark({
  className,
  priority = false,
}: {
  className?: string
  priority?: boolean
}) {
  const branding = useQuery(api.content.publicBranding)
  return (
    <span
      className={cn(
        "relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-[0_8px_30px_rgba(5,12,23,0.14)] dark:border-white/15",
        className
      )}
    >
      <Image
        src={branding?.logoUrl ?? "/asrro-logo.png"}
        alt=""
        width={725}
        height={725}
        loading={priority ? "eager" : "lazy"}
        unoptimized={Boolean(branding?.logoUrl)}
        className="size-full object-contain"
      />
    </span>
  )
}
