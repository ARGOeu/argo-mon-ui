import { Parser } from '@json2csv/plainjs'
import { flatten } from '@json2csv/transforms'

export const sanitizeFilename = (value: string): string =>
  value.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '')

const isBlankValue = (value: unknown): boolean =>
  value === '' || (Array.isArray(value) && value.every((item) => item === ''))

// Recursively turns blank strings and empty-string arrays into undefined, without deleting the key
const clearBlankValues = (value: unknown): unknown => {
  if (isBlankValue(value)) {
    return undefined
  }
  if (Array.isArray(value)) {
    return value
  }
  if (value !== null && typeof value === 'object') {
    const cleaned: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      cleaned[key] = clearBlankValues(val)
    }
    return cleaned
  }
  return value
}

export const buildCSV = <T extends object>(rows: T[]): string => {
  const parser = new Parser({ transforms: [flatten({ objects: true })] })
  return parser.parse(rows.map(clearBlankValues) as T[])
}

export const downloadCSV = (filename: string, csv: string): void => {
  const blob = new Blob([csv], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()

  document.body.removeChild(link)
  // Revoking synchronously can race Safari's async download
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
