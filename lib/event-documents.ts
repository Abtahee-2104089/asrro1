export type ParticipationConfirmation = {
  registrationCode: string
  status: string
  participantName: string
  eventName: string
  startsAt: number
  venue: string
}

export type ParticipationCertificate = ParticipationConfirmation & {
  certificateCode: string
  issuedAt: number
}

export type ParticipantExportRow = {
  registrationCode: string
  participantName: string
  participantEmail: string
  participantPhone: string
  memberUuid?: string
  institution?: string
  institutionDivision?: string
  studentId?: string
  status: string
  amountPaid: number
  transactionId?: string
  registeredAt: number
}

function safeFileName(value: string) {
  return value
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-|-$/g, "")
}

function exportRecords(rows: ParticipantExportRow[]) {
  return rows.map((row) => ({
    "Registration code": row.registrationCode,
    Participant: row.participantName,
    Email: row.participantEmail,
    Phone: row.participantPhone,
    "Member UUID": row.memberUuid ?? "",
    Institution: row.institution ?? "",
    Division: row.institutionDivision ?? "",
    "Student ID": row.studentId ?? "",
    Status: row.status,
    "Amount paid": row.amountPaid,
    "Transaction ID": row.transactionId ?? "",
    "Registered at": new Date(row.registeredAt).toLocaleString(),
  }))
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function buildParticipationConfirmationPdf(
  confirmation: ParticipationConfirmation
) {
  const { jsPDF } = await import("jspdf")
  const pdf = new jsPDF({ unit: "mm", format: "a4" })
  pdf.setProperties({
    title: `Participation confirmation ${confirmation.registrationCode}`,
    author: "ASRRO",
  })
  pdf.setFillColor(8, 24, 45)
  pdf.rect(0, 0, 210, 45, "F")
  pdf.setTextColor(255, 255, 255)
  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(23)
  pdf.text("ASRRO", 18, 21)
  pdf.setFontSize(9)
  pdf.setFont("helvetica", "normal")
  pdf.text("EVENT PARTICIPATION CONFIRMATION", 18, 30)

  pdf.setTextColor(15, 23, 42)
  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(19)
  pdf.text(confirmation.eventName, 18, 66, { maxWidth: 174 })
  const fields = [
    ["Participant", confirmation.participantName],
    ["Registration code", confirmation.registrationCode],
    ["Registration status", confirmation.status.toUpperCase()],
    ["Event date", new Date(confirmation.startsAt).toLocaleString()],
    ["Venue", confirmation.venue],
  ] as const
  for (const [index, [label, value]] of fields.entries()) {
    const y = 95 + index * 18
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(100, 116, 139)
    pdf.setFontSize(9)
    pdf.text(label, 18, y)
    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(15, 23, 42)
    pdf.text(value, 72, y, { maxWidth: 120 })
  }
  pdf.setFillColor(236, 253, 245)
  pdf.roundedRect(18, 203, 174, 24, 3, 3, "F")
  pdf.setTextColor(4, 120, 87)
  pdf.setFontSize(9)
  pdf.text(
    "Present this document and your registration code at event check-in.",
    27,
    217
  )
  return pdf.output("arraybuffer")
}

export async function downloadParticipationConfirmationPdf(
  confirmation: ParticipationConfirmation
) {
  const bytes = await buildParticipationConfirmationPdf(confirmation)
  downloadBlob(
    new Blob([bytes], { type: "application/pdf" }),
    `asrro-${safeFileName(confirmation.registrationCode)}.pdf`
  )
}

export function buildParticipantsCsv(rows: ParticipantExportRow[]) {
  const records = exportRecords(rows)
  const headers = Object.keys(records[0] ?? exportRecords([emptyRow])[0])
  const escapeCell = (value: unknown) =>
    `"${String(value).replaceAll('"', '""')}"`
  return [
    headers.map(escapeCell).join(","),
    ...records.map((record) =>
      headers
        .map((header) => escapeCell(record[header as keyof typeof record]))
        .join(",")
    ),
  ].join("\n")
}

export function downloadParticipantsCsv(
  eventName: string,
  rows: ParticipantExportRow[]
) {
  const csv = buildParticipantsCsv(rows)
  downloadBlob(
    new Blob(["\u{FEFF}", csv], { type: "text/csv;charset=utf-8" }),
    `${safeFileName(eventName)}-participants.csv`
  )
}

export async function downloadParticipantsXlsx(
  eventName: string,
  rows: ParticipantExportRow[]
) {
  const bytes = await buildParticipantsXlsx(rows)
  downloadBlob(
    new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${safeFileName(eventName)}-participants.xlsx`
  )
}

export async function buildParticipantsXlsx(rows: ParticipantExportRow[]) {
  const xlsx = await import("xlsx")
  const worksheet = xlsx.utils.json_to_sheet(exportRecords(rows))
  const workbook = xlsx.utils.book_new()
  xlsx.utils.book_append_sheet(workbook, worksheet, "Participants")
  return xlsx.write(workbook, {
    bookType: "xlsx",
    type: "array",
  }) as ArrayBuffer
}

export async function buildParticipantsPdf(
  eventName: string,
  rows: ParticipantExportRow[]
) {
  const { jsPDF } = await import("jspdf")
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
  pdf.setProperties({ title: `${eventName} participants`, author: "ASRRO" })
  const pageWidth = 297
  const drawHeader = () => {
    pdf.setFillColor(8, 24, 45)
    pdf.rect(0, 0, pageWidth, 24, "F")
    pdf.setTextColor(255, 255, 255)
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(14)
    pdf.text(eventName, 12, 11)
    pdf.setFontSize(7)
    pdf.text("PARTICIPANT EXPORT", 12, 17)
  }
  drawHeader()
  const columns = [12, 54, 103, 156, 198, 230, 264]
  const labels = [
    "Code",
    "Participant",
    "Email",
    "Institution",
    "Status",
    "Paid",
    "Registered",
  ]
  let y = 34
  const drawColumns = () => {
    pdf.setTextColor(100, 116, 139)
    pdf.setFontSize(6.5)
    pdf.setFont("helvetica", "bold")
    for (const [index, label] of labels.entries()) {
      pdf.text(label, columns[index], y)
    }
    y += 6
  }
  drawColumns()
  for (const row of rows) {
    if (y > 194) {
      pdf.addPage()
      drawHeader()
      y = 34
      drawColumns()
    }
    pdf.setTextColor(30, 41, 59)
    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(6.5)
    const cells = [
      row.registrationCode,
      row.participantName,
      row.participantEmail,
      row.institution ?? "",
      row.status,
      String(row.amountPaid),
      new Date(row.registeredAt).toLocaleDateString(),
    ]
    for (const [index, cell] of cells.entries()) {
      pdf.text(
        cell.slice(0, index === 1 || index === 2 ? 28 : 20),
        columns[index],
        y
      )
    }
    pdf.setDrawColor(226, 232, 240)
    pdf.line(12, y + 2, 285, y + 2)
    y += 7
  }
  return pdf.output("arraybuffer")
}

export async function downloadParticipantsPdf(
  eventName: string,
  rows: ParticipantExportRow[]
) {
  const bytes = await buildParticipantsPdf(eventName, rows)
  downloadBlob(
    new Blob([bytes], { type: "application/pdf" }),
    `${safeFileName(eventName)}-participants.pdf`
  )
}

export async function buildParticipationCertificatePdf(
  certificate: ParticipationCertificate
) {
  const { jsPDF } = await import("jspdf")
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
  pdf.setProperties({
    title: `Participation certificate ${certificate.certificateCode}`,
    author: "ASRRO",
  })
  pdf.setFillColor(8, 24, 45)
  pdf.rect(0, 0, 297, 210, "F")
  pdf.setDrawColor(87, 230, 230)
  pdf.setLineWidth(1.2)
  pdf.rect(12, 12, 273, 186)
  pdf.setTextColor(87, 230, 230)
  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(28)
  pdf.text("ASRRO", 148.5, 42, { align: "center" })
  pdf.setFontSize(11)
  pdf.text("CERTIFICATE OF PARTICIPATION", 148.5, 58, { align: "center" })
  pdf.setTextColor(255, 255, 255)
  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(12)
  pdf.text("This certificate is presented to", 148.5, 82, { align: "center" })
  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(25)
  pdf.text(certificate.participantName, 148.5, 103, {
    align: "center",
    maxWidth: 230,
  })
  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(12)
  pdf.text("for recorded participation in", 148.5, 121, { align: "center" })
  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(18)
  pdf.text(certificate.eventName, 148.5, 140, {
    align: "center",
    maxWidth: 230,
  })
  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(9)
  pdf.setTextColor(185, 200, 217)
  pdf.text(
    `${new Date(certificate.startsAt).toLocaleDateString()} · ${certificate.venue}`,
    148.5,
    158,
    { align: "center" }
  )
  pdf.text(
    `Certificate ${certificate.certificateCode} · Issued ${new Date(certificate.issuedAt).toLocaleDateString()}`,
    148.5,
    180,
    { align: "center" }
  )
  return pdf.output("arraybuffer")
}

export async function downloadParticipationCertificatePdf(
  certificate: ParticipationCertificate
) {
  const bytes = await buildParticipationCertificatePdf(certificate)
  downloadBlob(
    new Blob([bytes], { type: "application/pdf" }),
    `asrro-certificate-${safeFileName(certificate.certificateCode)}.pdf`
  )
}

const emptyRow: ParticipantExportRow = {
  registrationCode: "",
  participantName: "",
  participantEmail: "",
  participantPhone: "",
  status: "",
  amountPaid: 0,
  registeredAt: 0,
}
