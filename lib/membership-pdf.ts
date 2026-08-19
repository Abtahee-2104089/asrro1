import type { FunctionReturnType } from "convex/server"
import QRCode from "qrcode"

import type { api } from "@/convex/_generated/api"

type Membership = FunctionReturnType<typeof api.members.myMembership>
type Receipt = NonNullable<Membership["receipt"]>

async function loadLogo() {
  const response = await fetch("/asrro-logo.png")
  if (!response.ok) throw new Error("Logo could not be loaded")
  const blob = await response.blob()
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener("load", () => resolve(String(reader.result)))
    reader.addEventListener("error", () => reject(reader.error))
    reader.readAsDataURL(blob)
  })
}

async function loadImage(url: string) {
  const response = await fetch(url)
  if (!response.ok) throw new Error("Image could not be loaded")
  const blob = await response.blob()
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener("load", () => resolve(String(reader.result)))
    reader.addEventListener("error", () => reject(reader.error))
    reader.readAsDataURL(blob)
  })
}

export async function downloadMembershipCardPdf(
  member: Membership,
  verificationUrl: string
) {
  const { jsPDF } = await import("jspdf")
  const widthMm = 85.6
  const heightMm = 53.98
  const document = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [widthMm, heightMm],
    compress: true,
  })
  document.setProperties({
    title: `ASRRO membership card — ${member.fullName}`,
    subject: `Membership credential ${member.uuid}`,
    author: "ASRRO",
  })
  document.setFillColor(8, 24, 45)
  document.roundedRect(0, 0, widthMm, heightMm, 3, 3, "F")
  try {
    document.addImage(await loadLogo(), "PNG", 5, 5, 10, 10)
  } catch {
    /* card remains valid without decorative logo */
  }
  if (member.profileImageUrl) {
    try {
      document.addImage(
        await loadImage(member.profileImageUrl),
        "JPEG",
        5,
        17,
        10,
        10,
        undefined,
        "FAST"
      )
    } catch {
      /* profile photo is optional */
    }
  }
  document.setTextColor(255, 255, 255)
  document.setFont("helvetica", "bold")
  document.setFontSize(7)
  document.text("ASRRO", 18, 10)
  document.setFontSize(9.5)
  document.text(member.fullName, 5, 29)
  document.setTextColor(148, 163, 184)
  document.setFont("helvetica", "normal")
  document.setFontSize(4.2)
  document.text(`${member.department} / HSC ${member.hscBatch}`, 5, 33)
  document.setTextColor(207, 250, 254)
  document.setFont("courier", "bold")
  document.setFontSize(5.4)
  document.text(member.uuid, 5, 45.3)
  if (member.membershipValidUntil) {
    document.setTextColor(255, 255, 255)
    document.setFont("helvetica", "bold")
    document.setFontSize(4.8)
    document.text(
      new Date(member.membershipValidUntil).toLocaleDateString("en-BD"),
      31,
      45.3
    )
  }
  const qr = await QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 512,
  })
  document.addImage(qr, "PNG", 64, 28, 18, 18)
  document.setTextColor(103, 232, 249)
  document.setFontSize(3)
  document.text("SCAN TO VERIFY", widthMm - 5, 50.5, { align: "right" })
  document.save(`asrro-membership-${member.uuid.toLowerCase()}.pdf`)
}

export async function downloadMembershipReceiptPdf(
  receipt: Receipt,
  member: Membership
) {
  const { jsPDF } = await import("jspdf")
  const document = new jsPDF({ unit: "mm", format: "a5" })
  document.setProperties({
    title: `ASRRO receipt ${receipt.id}`,
    subject: "Membership application fee",
    author: "ASRRO",
  })
  document.setFillColor(8, 24, 45)
  document.rect(0, 0, 148, 34, "F")
  document.setTextColor(255, 255, 255)
  document.setFont("helvetica", "bold")
  document.setFontSize(18)
  document.text("ASRRO", 14, 16)
  document.setFontSize(8)
  document.text("MEMBERSHIP PAYMENT RECEIPT", 14, 23)
  const amount = new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: receipt.currency,
  }).format(receipt.amount)
  const fields = [
    ["Receipt number", receipt.id],
    ["Payment date", new Date(receipt.paidAt).toLocaleDateString("en-BD")],
    ["Member", member.fullName],
    ["Member UUID", member.uuid],
    ["Payment method", receipt.paymentMethod.toUpperCase()],
    ["Transaction ID", receipt.transactionId],
    ["Amount paid", amount],
  ] as const
  for (const [index, [label, value]] of fields.entries()) {
    const y = 54 + index * 14
    document.setTextColor(100, 116, 139)
    document.setFont("helvetica", "normal")
    document.setFontSize(8)
    document.text(label, 14, y)
    document.setTextColor(15, 23, 42)
    document.setFont("helvetica", "bold")
    document.text(value, 134, y, { align: "right" })
  }
  document.save(`asrro-receipt-${receipt.id.toLowerCase()}.pdf`)
}
