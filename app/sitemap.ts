import type { MetadataRoute } from "next"
import { fetchQuery } from "convex/nextjs"

import { api } from "@/convex/_generated/api"

const routes = [
  "",
  "/about",
  "/committee",
  "/alumni",
  "/projects",
  "/events",
  "/gallery",
  "/publications",
  "/news",
  "/contact",
  "/membership",
  "/search",
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date()
  const [projectResult, eventResult, newsResult] = await Promise.all([
    fetchQuery(api.projects.listPublic, {
      paginationOpts: { cursor: null, numItems: 100 },
    }),
    fetchQuery(api.events.listDirectory, { now: Date.now() }),
    fetchQuery(api.blogs.listPublic, {
      paginationOpts: { cursor: null, numItems: 100 },
    }),
  ])
  const detailRoutes = [
    ...projectResult.page.map((project) => `/projects/${project.slug}`),
    ...eventResult.map((event) => `/events/${event.slug}`),
    ...newsResult.page.map((item) => `/news/${item.slug}`),
  ]

  return [...routes, ...detailRoutes].map((route, index) => ({
    url: `https://asrro.org${route}`,
    lastModified,
    changeFrequency: index === 0 ? "weekly" : "monthly",
    priority: index === 0 ? 1 : 0.7,
  }))
}
