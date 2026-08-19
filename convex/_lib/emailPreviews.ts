import { announcementEmail, membershipDecisionEmail } from "./email"
import { passwordResetEmail } from "./passwordResetEmail"

export const productionEmailTemplates = [
  "password_reset",
  "membership_approved",
  "membership_rejected",
  "member_announcement",
  "committee_announcement",
  "event_registration_received",
  "event_registration_confirmed",
  "event_registration_rejected",
  "event_certificate_ready",
  "event_reminder",
] as const

type PreviewEmail = {
  template: (typeof productionEmailTemplates)[number]
  subject: string
  textBody: string
  htmlBody?: string
}

const reviewNotice =
  "DESIGN PREVIEW ONLY — no membership, registration, certificate, or password was changed."

function preview(input: PreviewEmail): PreviewEmail {
  return {
    ...input,
    subject: `[Design preview] ${input.subject}`,
    textBody: `${input.textBody}\n\n${reviewNotice}`,
  }
}

export function emailDesignPreviews(siteUrl: string): PreviewEmail[] {
  const passwordReset = passwordResetEmail({
    name: "ASRRO Design Reviewer",
    resetUrl: new URL("/reset-password?error=DESIGN_PREVIEW", siteUrl).href,
    siteUrl,
  })
  const membershipApproved = membershipDecisionEmail({
    name: "ASRRO Design Reviewer",
    decision: "approved",
    uuid: "ORION-042",
  })
  const membershipRejected = membershipDecisionEmail({
    name: "ASRRO Design Reviewer",
    decision: "rejected",
    note: "Please update the payment reference and submit the application again.",
  })
  const memberAnnouncement = announcementEmail({
    name: "ASRRO Design Reviewer",
    subject: "Mission control community briefing",
    message:
      "The member briefing starts Friday at 7:00 PM. Open the portal for the agenda and preparation notes.",
  })
  const committeeAnnouncement = announcementEmail({
    name: "ASRRO Design Reviewer",
    subject: "Committee operations briefing",
    message:
      "The executive coordination meeting starts Saturday at 6:30 PM. Please review your assigned action items beforehand.",
    template: "committee_announcement",
  })

  return [
    preview(passwordReset),
    preview(membershipApproved),
    preview(membershipRejected),
    preview(memberAnnouncement),
    preview(committeeAnnouncement),
    preview({
      template: "event_registration_received",
      subject: "Registration received for Robotics Foundations Workshop",
      textBody:
        "Hello ASRRO Design Reviewer,\n\nYour registration REG-2026-0042 for Robotics Foundations Workshop is pending. We will notify you after review.",
    }),
    preview({
      template: "event_registration_confirmed",
      subject: "Your Robotics Foundations Workshop registration was confirmed",
      textBody:
        "Hello ASRRO Design Reviewer,\n\nRegistration REG-2026-0042 for Robotics Foundations Workshop was confirmed.",
    }),
    preview({
      template: "event_registration_rejected",
      subject: "Your Robotics Foundations Workshop registration was rejected",
      textBody:
        "Hello ASRRO Design Reviewer,\n\nRegistration REG-2026-0042 for Robotics Foundations Workshop was rejected. Contact the event team if you need help.",
    }),
    preview({
      template: "event_certificate_ready",
      subject: "Your certificate for Robotics Foundations Workshop is ready",
      textBody:
        "Hello ASRRO Design Reviewer,\n\nCertificate CERT-2026-0042 for Robotics Foundations Workshop is ready in your registration record.",
    }),
    preview({
      template: "event_reminder",
      subject: "Robotics Foundations Workshop starts soon",
      textBody:
        "Hello ASRRO Design Reviewer,\n\nRobotics Foundations Workshop starts on 18 September 2026 at 9:00 AM in the CUET Robotics Lab. Registration: REG-2026-0042.",
    }),
  ]
}
