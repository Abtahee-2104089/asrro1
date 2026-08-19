import type { Metadata } from "next"
import { SiteChrome } from "@/components/site/site-chrome"
import { HomePage } from "@/components/site/home-page"

export const metadata: Metadata = {
  title: "ASRRO — Engineering the frontier from CUET",
  description:
    "Andromeda Space and Robotics Research Organization at CUET, Bangladesh.",
}

export default function Page() {
  return (
    <SiteChrome>
      <HomePage />
    </SiteChrome>
  )
}
