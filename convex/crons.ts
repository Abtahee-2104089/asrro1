import { cronJobs } from "convex/server"

import { internal } from "./_generated/api"

const crons = cronJobs()

crons.interval(
  "dispatch event reminders",
  { minutes: 30 },
  internal.events.dispatchDueReminders,
  {}
)

export default crons
