import type { CSSProperties, ReactNode } from "react"
import type { Metadata } from "next"
import { fetchQuery } from "convex/nextjs"
import { SiteChrome } from "@/components/site/site-chrome"
import { api } from "@/convex/_generated/api"

export const metadata: Metadata = {
  title: { template: "%s · ASRRO", default: "ASRRO" },
  description:
    "Space, robotics, AI, and frontier engineering at CUET, Bangladesh.",
}
export default async function PublicLayout({
  children,
}: {
  children: ReactNode
}) {
  const branding = await fetchQuery(api.content.publicBranding)
  const style = {
    "--asrro-primary": branding.primaryColor,
    "--asrro-accent": branding.accentColor,
  } as CSSProperties
  return (
    <div style={style}>
      <SiteChrome>{children}</SiteChrome>
    </div>
  )
}
