import jsPDF from 'jspdf'
import autoTable, { type CellHookData } from 'jspdf-autotable'
import { formatMonthLabel } from './dateRanges'
import type { GroupAvailabilityReliability } from '@/types/availabilityReliability'

// default header color
const brandColor: [number, number, number] = [37, 99, 235]
const headerHeight = 24
const maxLogoWidth = 40 // mm
const maxLogoHeight = 12 // mm

const fetchPngDataUrl = async (url: string): Promise<string> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load logo (${response.status})`)
  }
  const bytes = new Uint8Array(await response.arrayBuffer())
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return `data:image/png;base64,${btoa(binary)}`
}

const goodThreshold = 99.9
const warnThreshold = 99

type Tone = 'good' | 'warn' | 'bad'

const toneFor = (value: number): Tone =>
  value >= goodThreshold ? 'good' : value >= warnThreshold ? 'warn' : 'bad'

const toneStyles: Record<
  Tone,
  { fill: [number, number, number]; text: [number, number, number] }
> = {
  good: { fill: [220, 252, 231], text: [22, 101, 52] },
  warn: { fill: [254, 249, 195], text: [133, 77, 14] },
  bad: { fill: [254, 226, 226], text: [153, 27, 27] },
}

export interface ExportGroupArPdfParams {
  rows: GroupAvailabilityReliability[]
  months: string[]
  title?: string
  entity: string
  tenantName: string
  reportName: string
  filename: string
  filterNote?: string
  logoUrl?: string
}

export async function exportGroupArPdf({
  rows,
  months,
  title = 'Availability & Reliability',
  entity,
  tenantName,
  reportName,
  filename,
  filterNote,
  logoUrl,
}: ExportGroupArPdfParams): Promise<void> {
  const doc = new jsPDF({ orientation: 'landscape', format: 'a4' })

  let logoDataUrl: string | undefined
  if (logoUrl) {
    try {
      logoDataUrl = await fetchPngDataUrl(logoUrl)
    } catch {
      logoDataUrl = undefined
    }
  }
  const logoSize = logoDataUrl ? doc.getImageProperties(logoDataUrl) : undefined
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 10

  // create the table
  autoTable(doc, {
    startY: headerHeight + 4,
    margin: { top: headerHeight + 4, left: margin, right: margin, bottom: 12 },
    head: [
      [
        { content: entity, rowSpan: 2 },
        ...months.map((month) => ({
          content: formatMonthLabel(month),
          colSpan: 2,
        })),
      ],
      months.flatMap(() => ['Av', 'Re']),
    ],
    body: rows.map((row) => [
      row.name,
      ...months.flatMap((month) => {
        const monthly = row.monthly.find((m) => m.month === month)
        return [monthly?.availability ?? '', monthly?.reliability ?? '']
      }),
    ]),
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [209, 213, 219],
      lineWidth: 0.2,
    },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    headStyles: { fillColor: brandColor, textColor: 255, fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 55, halign: 'left' } },
    horizontalPageBreak: true,
    horizontalPageBreakRepeat: 0,
    didParseCell: (data: CellHookData) => {
      if (data.column.index === 0) {
        return
      }
      data.cell.styles.halign = 'center'
      if (data.section === 'body' && typeof data.cell.raw === 'number') {
        const { fill, text } = toneStyles[toneFor(data.cell.raw)]
        data.cell.styles.fillColor = fill
        data.cell.styles.textColor = text
        data.cell.styles.fontStyle = 'bold'
      }
    },
  })

  const totalPages = doc.getNumberOfPages()
  const generated = new Date().toLocaleString()

  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page)

    doc.setFillColor(...brandColor)
    doc.rect(0, 0, pageWidth, 3, 'F')

    doc.setTextColor(17, 24, 39)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text(title, margin, 12)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(107, 114, 128)
    doc.text(`Tenant: ${tenantName}   Report: ${reportName}`, margin, 17.5)
    if (filterNote) {
      doc.text(filterNote, margin, 22)
    }

    if (logoDataUrl && logoSize) {
      const ratio = logoSize.height / logoSize.width
      const drawWidth = Math.min(maxLogoWidth, maxLogoHeight / ratio)
      const drawHeight = drawWidth * ratio
      doc.addImage(
        logoDataUrl,
        'PNG',
        pageWidth - margin - drawWidth,
        6,
        drawWidth,
        drawHeight,
      )
    }

    doc.setFontSize(8)
    doc.text(`Generated ${generated}`, margin, pageHeight - 6)
    doc.text(
      `Page ${page} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - 6,
      {
        align: 'right',
      },
    )
  }

  doc.save(filename)
}
