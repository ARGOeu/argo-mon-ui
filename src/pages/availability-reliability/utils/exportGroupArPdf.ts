import jsPDF from 'jspdf'
import autoTable, { type CellHookData } from 'jspdf-autotable'
import { formatMonthLabel } from './dateRanges'
import type { GroupAvailabilityReliability } from '@/types/availabilityReliability'

// default header color
const brandColor: [number, number, number] = [37, 99, 235]
const headerHeight = 24
const maxLogoWidth = 40 // mm
const maxLogoHeight = 14 // mm
const logoGap = 6
const logoCenterY = 14.5
const logoPixelWidth = 600

interface LoadedLogo {
  dataUrl: string
  width: number
  height: number
}

const loadLogo = (url: string): Promise<LoadedLogo | undefined> =>
  new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const ratio =
          img.naturalWidth > 0 && img.naturalHeight > 0
            ? img.naturalHeight / img.naturalWidth
            : 0.3
        const width = logoPixelWidth
        const height = Math.max(1, Math.round(width * ratio))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d')
        if (!context) {
          resolve(undefined)
          return
        }
        context.drawImage(img, 0, 0, width, height)
        resolve({ dataUrl: canvas.toDataURL('image/png'), width, height })
      } catch {
        resolve(undefined)
      }
    }
    img.onerror = () => resolve(undefined)
    img.src = url
  })

const fitLogo = (logo: LoadedLogo) => {
  const ratio = logo.height / logo.width
  const width = Math.min(maxLogoWidth, maxLogoHeight / ratio)
  return { width, height: width * ratio }
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
  tenantLogoUrl?: string
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
  tenantLogoUrl,
}: ExportGroupArPdfParams): Promise<void> {
  const doc = new jsPDF({
    orientation: 'landscape',
    format: 'a4',
    compress: true,
  })

  const [productLogo, tenantLogo] = await Promise.all([
    logoUrl ? loadLogo(logoUrl) : undefined,
    tenantLogoUrl ? loadLogo(tenantLogoUrl) : undefined,
  ])
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
  const tenantSize = tenantLogo ? fitLogo(tenantLogo) : undefined
  const textX = margin + (tenantSize ? tenantSize.width + logoGap : 0)

  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page)

    doc.setFillColor(...brandColor)
    doc.rect(0, 0, pageWidth, 3, 'F')

    doc.setTextColor(17, 24, 39)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text(title, textX, 12)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(107, 114, 128)
    doc.text(`Tenant: ${tenantName}   Report: ${reportName}`, textX, 17.5)
    if (filterNote) {
      doc.text(filterNote, textX, 22)
    }

    if (tenantLogo && tenantSize) {
      doc.addImage(
        tenantLogo.dataUrl,
        'PNG',
        margin,
        logoCenterY - tenantSize.height / 2,
        tenantSize.width,
        tenantSize.height,
      )
    }
    if (productLogo) {
      const size = fitLogo(productLogo)
      doc.addImage(
        productLogo.dataUrl,
        'PNG',
        pageWidth - margin - size.width,
        logoCenterY - size.height / 2,
        size.width,
        size.height,
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
