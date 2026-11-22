import jsPDF from 'jspdf'
import autoTable, { type CellHookData, type UserOptions } from 'jspdf-autotable'
import { formatMonthLabel } from './dateRanges'
import type { GroupAvailabilityReliability } from '@/types/availabilityReliability'

// default header color
const brandColor: [number, number, number] = [37, 99, 235]
const headerHeight = 24
const margin = 10
const maxLogoWidth = 40 // mm
const maxLogoHeight = 14 // mm
const logoGap = 6
const logoCenterY = 14.5
const logoPixelWidth = 600
const defaultLogoUrl = '/ARGO_LOGO_COLOR_ENG_TITLE.png'

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

const goodThreshold = 99.5
const warnThreshold = 95

type Tone = 'good' | 'warn' | 'bad'

const toneFor = (value: number): Tone =>
  value >= goodThreshold ? 'good' : value >= warnThreshold ? 'warn' : 'bad'

const downtimeToneFor = (value: number): Tone =>
  value <= 0 ? 'good' : value <= 1 ? 'warn' : 'bad'

const toneStyles: Record<
  Tone,
  { fill: [number, number, number]; text: [number, number, number] }
> = {
  good: { fill: [236, 253, 245], text: [5, 150, 105] },
  warn: { fill: [255, 251, 235], text: [217, 119, 6] },
  bad: { fill: [254, 242, 242], text: [220, 38, 38] },
}

const baseTableOptions: UserOptions = {
  startY: headerHeight + 4,
  margin: { top: headerHeight + 4, left: margin, right: margin, bottom: 12 },
  theme: 'grid',
  styles: {
    fontSize: 8,
    cellPadding: 2,
    lineColor: [209, 213, 219],
    lineWidth: 0.2,
  },
  alternateRowStyles: { fillColor: [249, 250, 251] },
  headStyles: { fillColor: brandColor, textColor: 255, fontStyle: 'bold' },
}

const applyTone = (data: CellHookData, tone: Tone) => {
  const { fill, text } = toneStyles[tone]
  data.cell.styles.fillColor = fill
  data.cell.styles.textColor = text
  data.cell.styles.fontStyle = 'bold'
}

const clipText = (doc: jsPDF, text: string, maxWidth: number) => {
  if (doc.getTextWidth(text) <= maxWidth) {
    return text
  }
  let length = text.length
  while (
    length > 1 &&
    doc.getTextWidth(`${text.slice(0, length)}...`) > maxWidth
  ) {
    length -= 1
  }
  return `${text.slice(0, length)}...`
}

interface RenderArPdfParams {
  title: string
  tenantName: string
  reportName: string
  filename: string
  filterNote?: string
  logoUrl?: string
  tenantLogoUrl?: string
  addTable: (doc: jsPDF) => void
}

async function renderArPdf({
  title,
  tenantName,
  reportName,
  filename,
  filterNote,
  logoUrl = defaultLogoUrl,
  tenantLogoUrl,
  addTable,
}: RenderArPdfParams): Promise<void> {
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

  addTable(doc)

  const totalPages = doc.getNumberOfPages()
  const generated = new Date().toLocaleString()
  const tenantSize = tenantLogo ? fitLogo(tenantLogo) : undefined
  const productSize = productLogo ? fitLogo(productLogo) : undefined
  const textX = margin + (tenantSize ? tenantSize.width + logoGap : 0)
  const maxTitleWidth =
    pageWidth - margin - (productSize ? productSize.width + logoGap : 0) - textX

  doc.setFont('helvetica', 'bold')
  let titleFontSize = 14
  doc.setFontSize(titleFontSize)
  while (titleFontSize > 9 && doc.getTextWidth(title) > maxTitleWidth) {
    titleFontSize -= 0.5
    doc.setFontSize(titleFontSize)
  }
  const titleText = clipText(doc, title, maxTitleWidth)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const infoText = clipText(
    doc,
    `Tenant: ${tenantName}   Report: ${reportName}`,
    maxTitleWidth,
  )
  const noteText = filterNote
    ? clipText(doc, filterNote, maxTitleWidth)
    : undefined

  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page)

    doc.setFillColor(...brandColor)
    doc.rect(0, 0, pageWidth, 3, 'F')

    doc.setTextColor(17, 24, 39)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(titleFontSize)
    doc.text(titleText, textX, 12)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(107, 114, 128)
    doc.text(infoText, textX, 17.5)
    if (noteText) {
      doc.text(noteText, textX, 22)
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
    if (productLogo && productSize) {
      doc.addImage(
        productLogo.dataUrl,
        'PNG',
        pageWidth - margin - productSize.width,
        logoCenterY - productSize.height / 2,
        productSize.width,
        productSize.height,
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

export interface ArPdfMonthlyValue {
  month: string
  availability: number
  reliability: number
}

export interface ArPdfRow {
  labels: string[]
  monthly: ArPdfMonthlyValue[]
}

export interface ArPdfLabelColumn {
  header: string
  width: number
}

export interface ExportArTablePdfParams {
  rows: ArPdfRow[]
  months: string[]
  labelColumns: ArPdfLabelColumn[]
  title: string
  tenantName: string
  reportName: string
  filename: string
  filterNote?: string
  logoUrl?: string
  tenantLogoUrl?: string
}

const exportArTablePdf = ({
  rows,
  months,
  labelColumns,
  ...page
}: ExportArTablePdfParams): Promise<void> => {
  const labelCount = labelColumns.length

  return renderArPdf({
    ...page,
    addTable: (doc) =>
      // create the table
      autoTable(doc, {
        ...baseTableOptions,
        head: [
          [
            ...labelColumns.map((column) => ({
              content: column.header,
              rowSpan: 2,
            })),
            ...months.map((month) => ({
              content: formatMonthLabel(month),
              colSpan: 2,
            })),
          ],
          months.flatMap(() => ['Av', 'Re']),
        ],
        body: rows.map((row) => [
          ...row.labels,
          ...months.flatMap((month) => {
            const monthly = row.monthly.find((m) => m.month === month)
            return [monthly?.availability ?? '', monthly?.reliability ?? '']
          }),
        ]),
        columnStyles: Object.fromEntries(
          labelColumns.map((column, index) => [
            index,
            { cellWidth: column.width, halign: 'left' as const },
          ]),
        ),
        horizontalPageBreak: true,
        horizontalPageBreakRepeat: labelColumns.map((_, index) => index),
        didParseCell: (data: CellHookData) => {
          if (data.column.index < labelCount) {
            return
          }
          data.cell.styles.halign = 'center'
          if (data.section === 'body' && typeof data.cell.raw === 'number') {
            applyTone(data, toneFor(data.cell.raw))
          }
        },
      }),
  })
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

export const exportGroupArPdf = ({
  rows,
  entity,
  title = 'Availability & Reliability',
  ...rest
}: ExportGroupArPdfParams): Promise<void> =>
  exportArTablePdf({
    ...rest,
    title,
    labelColumns: [{ header: entity, width: 55 }],
    rows: rows.map((row) => ({ labels: [row.name], monthly: row.monthly })),
  })

export interface EndpointArRow {
  serviceName: string
  endpointName: string
  monthly: ArPdfMonthlyValue[]
}

export interface ExportEndpointArPdfParams {
  rows: EndpointArRow[]
  months: string[]
  groupName: string
  tenantName: string
  reportName: string
  filename: string
  filterNote?: string
  logoUrl?: string
  tenantLogoUrl?: string
}

export const exportEndpointArPdf = ({
  rows,
  groupName,
  ...rest
}: ExportEndpointArPdfParams): Promise<void> =>
  exportArTablePdf({
    ...rest,
    title: `Availability & Reliability for group ${groupName}`,
    labelColumns: [
      { header: 'Endpoint', width: 55 },
      { header: 'Service', width: 35 },
    ],
    rows: rows.map((row) => ({
      labels: [row.endpointName, row.serviceName],
      monthly: row.monthly,
    })),
  })

export interface DailyArRow {
  date: string
  availability: number
  reliability: number
  unknown?: number
  downtime?: number
}

export interface ExportDailyArPdfParams {
  rows: DailyArRow[]
  entityLabel: 'Group' | 'Supergroup'
  name: string
  month: string
  tenantName: string
  reportName: string
  filename: string
  logoUrl?: string
  tenantLogoUrl?: string
}

interface ExportDailyTablePdfParams
  extends Omit<RenderArPdfParams, 'addTable'> {
  rows: DailyArRow[]
  showUnknownAndDowntime: boolean
}

const exportDailyTablePdf = ({
  rows,
  showUnknownAndDowntime,
  ...page
}: ExportDailyTablePdfParams): Promise<void> =>
  renderArPdf({
    ...page,
    addTable: (doc) =>
      autoTable(doc, {
        ...baseTableOptions,
        styles: { ...baseTableOptions.styles, cellPadding: 0.9 },
        head: [
          [
            'Date',
            'Availability',
            'Reliability',
            ...(showUnknownAndDowntime ? ['Unknown', 'Downtime'] : []),
          ],
        ],
        body: rows.map((row) => [
          row.date,
          row.availability,
          row.reliability,
          ...(showUnknownAndDowntime
            ? [row.unknown ?? '', row.downtime ?? '']
            : []),
        ]),
        columnStyles: {
          0: { cellWidth: 40, halign: 'left' },
          1: { cellWidth: 35 },
          2: { cellWidth: 35 },
          3: { cellWidth: 35 },
          4: { cellWidth: 35 },
        },
        didParseCell: (data: CellHookData) => {
          if (data.column.index === 0) {
            return
          }
          data.cell.styles.halign = 'center'
          if (data.section === 'body' && typeof data.cell.raw === 'number') {
            applyTone(
              data,
              data.column.index <= 2
                ? toneFor(data.cell.raw)
                : downtimeToneFor(data.cell.raw),
            )
          }
        },
      }),
  })

export const exportDailyArPdf = ({
  rows,
  entityLabel,
  name,
  month,
  ...rest
}: ExportDailyArPdfParams): Promise<void> =>
  exportDailyTablePdf({
    ...rest,
    rows,
    showUnknownAndDowntime: entityLabel === 'Group',
    title: `Daily Availability & Reliability for ${entityLabel.toLowerCase()} ${name} - ${formatMonthLabel(month, 'long')}`,
  })

export interface ExportEndpointDailyArPdfParams {
  rows: DailyArRow[]
  serviceName: string
  endpointName: string
  month: string
  tenantName: string
  reportName: string
  filename: string
  logoUrl?: string
  tenantLogoUrl?: string
}

export const exportEndpointDailyArPdf = ({
  rows,
  serviceName,
  endpointName,
  month,
  ...rest
}: ExportEndpointDailyArPdfParams): Promise<void> =>
  exportDailyTablePdf({
    ...rest,
    rows,
    showUnknownAndDowntime: true,
    title: `Daily Availability & Reliability - ${formatMonthLabel(month, 'long')}`,
    filterNote: `Service: ${serviceName}   Endpoint: ${endpointName}`,
  })
