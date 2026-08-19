import { describe, expect, it } from "vitest"

import { passwordResetEmail } from "./_lib/passwordResetEmail"

describe("password reset email", () => {
  it("renders a branded multipart message with the secure reset URL", () => {
    const email = passwordResetEmail({
      name: "Aster Member",
      resetUrl:
        "https://asrro.vercel.app/api/auth/reset-password/token?callbackURL=%2Freset-password",
      siteUrl: "https://asrro.vercel.app",
    })

    expect(email.template).toBe("password_reset")
    expect(email.subject).toContain("ASRRO")
    expect(email.textBody).toContain("expires in 60 minutes")
    expect(email.htmlBody).toContain("#071321")
    expect(email.htmlBody).toContain("#67e8f9")
    expect(email.htmlBody).toContain("https://asrro.vercel.app/asrro-logo.png")
    expect(email.htmlBody).toContain("Create new password")
  })

  it("escapes user-controlled content and rejects unsafe links", () => {
    const email = passwordResetEmail({
      name: '<script>alert("x")</script>',
      resetUrl: "https://asrro.vercel.app/reset-password?token=a&next=b",
      siteUrl: "https://asrro.vercel.app",
    })

    expect(email.htmlBody).not.toContain("<script>")
    expect(email.htmlBody).toContain("&lt;script&gt;")
    expect(email.htmlBody).toContain("token=a&amp;next=b")
    expect(() =>
      passwordResetEmail({
        name: "Member",
        resetUrl: "javascript:alert(1)",
        siteUrl: "https://asrro.vercel.app",
      })
    ).toThrow("must use HTTP or HTTPS")
  })
})
