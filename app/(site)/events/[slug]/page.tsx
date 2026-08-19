import type { Metadata } from "next"

import { EventDetail } from "@/components/site/event-detail"

export const metadata: Metadata = {
  title: "Event",
  description:
    "Event details, eligibility, registration, and participation status.",
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <EventDetail slug={slug} />
}
