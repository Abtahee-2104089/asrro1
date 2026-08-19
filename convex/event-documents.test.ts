import { describe, expect, it } from "vitest"
import * as xlsx from "xlsx"

import {
  buildParticipantsCsv,
  buildParticipantsPdf,
  buildParticipantsXlsx,
  type ParticipantExportRow,
} from "../lib/event-documents"

const rows: ParticipantExportRow[] = [
  {
    registrationCode: "REG-001",
    participantName: 'Ada "A", Lovelace',
    participantEmail: "ada@example.com",
    participantPhone: "+8801700000000",
    institution: "CUET",
    institutionDivision: "Chattogram",
    studentId: "2104001",
    status: "confirmed",
    amountPaid: 250,
    transactionId: "TXN-001",
    registeredAt: Date.UTC(2026, 7, 3),
  },
]

describe("event participant exports", () => {
  it("builds a CSV with a stable header and escaped cells", () => {
    const csv = buildParticipantsCsv(rows)

    expect(csv.split("\n")[0]).toContain('"Registration code"')
    expect(csv).toContain('"Ada ""A"", Lovelace"')
    expect(csv).toContain('"REG-001"')
  })

  it("builds a readable XLSX workbook", async () => {
    const bytes = await buildParticipantsXlsx(rows)
    const workbook = xlsx.read(bytes, { type: "array" })
    const records = xlsx.utils.sheet_to_json<Record<string, unknown>>(
      workbook.Sheets.Participants
    )

    expect(workbook.SheetNames).toEqual(["Participants"])
    expect(records[0]).toMatchObject({
      "Registration code": "REG-001",
      Participant: 'Ada "A", Lovelace',
      Status: "confirmed",
    })
  })

  it("builds a PDF artifact with the PDF signature", async () => {
    const bytes = await buildParticipantsPdf("Robotics Workshop", rows)
    const signature = new TextDecoder().decode(
      new Uint8Array(bytes).slice(0, 5)
    )

    expect(signature).toBe("%PDF-")
    expect(bytes.byteLength).toBeGreaterThan(500)
  })
})
