type ExportValue = string | number | boolean | null | undefined

export type ExportRow = Record<string, ExportValue>

function downloadBlob(content: BlobPart, type: string, fileName: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = fileName
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function text(value: ExportValue) {
  return value === null || value === undefined ? "" : String(value)
}

function csvCell(value: ExportValue) {
  return `"${text(value).replaceAll('"', '""')}"`
}

function xml(value: ExportValue) {
  return text(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

export function exportCsv(rows: ExportRow[], fileName: string) {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const content = [
    headers.map(csvCell).join(","),
    ...rows.map((row) =>
      headers.map((header) => csvCell(row[header])).join(",")
    ),
  ].join("\n")
  downloadBlob(`\u{FEFF}${content}`, "text/csv;charset=utf-8", fileName)
}

export function exportExcel(rows: ExportRow[], fileName: string) {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const cells = (values: ExportValue[]) =>
    `<Row>${values
      .map(
        (value) =>
          `<Cell><Data ss:Type="${typeof value === "number" ? "Number" : "String"}">${xml(value)}</Data></Cell>`
      )
      .join("")}</Row>`
  const workbook = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="ASRRO export"><Table>
 ${cells(headers)}
 ${rows.map((row) => cells(headers.map((header) => row[header]))).join("\n")}
 </Table></Worksheet>
</Workbook>`
  downloadBlob(workbook, "application/vnd.ms-excel", fileName)
}

export async function exportPdf(
  rows: ExportRow[],
  fileName: string,
  title: string
) {
  if (!rows.length) return
  const { jsPDF } = await import("jspdf")
  const document = new jsPDF({ unit: "pt", format: "a4" })
  const headers = Object.keys(rows[0])
  const pageWidth = document.internal.pageSize.getWidth()
  const margin = 40
  const columnWidth = (pageWidth - margin * 2) / headers.length
  let y = 46

  const header = () => {
    document.setFont("helvetica", "bold")
    document.setFontSize(15)
    document.text(title, margin, y)
    y += 24
    document.setFontSize(7)
    for (const [index, item] of headers.entries()) {
      document.text(item.slice(0, 24), margin + index * columnWidth, y)
    }
    y += 14
    document.setDrawColor(190)
    document.line(margin, y, pageWidth - margin, y)
    y += 12
    document.setFont("helvetica", "normal")
  }

  header()
  for (const row of rows) {
    if (y > document.internal.pageSize.getHeight() - 42) {
      document.addPage()
      y = 46
      header()
    }
    for (const [index, item] of headers.entries()) {
      const lines = document.splitTextToSize(text(row[item]), columnWidth - 8)
      document.text(lines.slice(0, 2), margin + index * columnWidth, y)
    }
    y += 22
  }
  document.save(fileName)
}
