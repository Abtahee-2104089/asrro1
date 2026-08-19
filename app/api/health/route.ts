import { fetchQuery } from "convex/nextjs"

import { api } from "@/convex/_generated/api"

export async function GET() {
  const checkedAt = new Date().toISOString()
  try {
    await fetchQuery(api.content.publicStatistics)
    return Response.json(
      { status: "ok", checkedAt },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch {
    return Response.json(
      { status: "degraded", checkedAt },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    )
  }
}
