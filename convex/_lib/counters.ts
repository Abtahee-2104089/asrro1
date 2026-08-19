import type { MutationCtx } from "../_generated/server"

export async function adjustCounter(
  ctx: MutationCtx,
  key: string,
  delta: number
) {
  const counter = await ctx.db
    .query("counters")
    .withIndex("by_key", (q) => q.eq("key", key))
    .unique()
  const now = Date.now()
  if (counter) {
    await ctx.db.patch("counters", counter._id, {
      value: Math.max(0, counter.value + delta),
      updatedAt: now,
    })
  } else if (delta > 0) {
    await ctx.db.insert("counters", { key, value: delta, updatedAt: now })
  }
}
