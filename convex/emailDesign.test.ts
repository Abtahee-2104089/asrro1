import { describe, expect, it } from "vitest"
import { brandedEmailHtml } from "./_lib/emailDesign"
import {
  emailDesignPreviews,
  productionEmailTemplates,
} from "./_lib/emailPreviews"

describe("branded system email designs", () => {
  it("covers every production template exactly once", () => {
    const previews = emailDesignPreviews("https://asrro.vercel.app")
    expect(previews.map((email) => email.template)).toEqual(
      productionEmailTemplates
    )
    expect(new Set(previews.map((email) => email.template)).size).toBe(10)
  })

  it("renders escaped, branded and email-compatible HTML", () => {
    const html = brandedEmailHtml({
      template: "event_reminder",
      subject: "Mission <script>",
      textBody: "Hello Reviewer,\n\nBring R&D notes.",
      recipientName: "Reviewer <admin>",
    })
    expect(html).toContain("#071321")
    expect(html).toContain("#67e8f9")
    expect(html).toContain("asrro-logo.png")
    expect(html).toContain("View event details")
    expect(html).toContain("Mission &lt;script&gt;")
    expect(html).toContain("Reviewer &lt;admin&gt;")
    expect(html).toContain("R&amp;D notes")
    expect(html).not.toContain("<script>")
  })
})
