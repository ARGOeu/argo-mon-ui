import { Parser, type FieldInfo } from '@json2csv/plainjs'

export type CsvField<T> = FieldInfo<T, unknown>

export const sanitizeFilename = (value: string): string =>
  value.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '')

const isEmptyValue = (value: unknown): boolean =>
  value === undefined || value === null || value === ''

// Used to detect empty columns before parsing
const previewFieldValue = <T>(row: T, field: CsvField<T>): unknown => {
  if (typeof field.value !== 'string') {
    return field.value(row, {
      label: field.label ?? '',
      default: field.default,
    })
  }

  let current: unknown = row
  for (const key of field.value.split('.')) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== 'object'
    ) {
      return undefined
    }
    current = (current as Record<string, unknown>)[key]
  }
  return current
}

export const buildCSV = <T extends object>(
  rows: T[],
  fields: CsvField<T>[],
): string => {
  const nonEmptyFields = fields.filter((field) =>
    rows.some((row) => !isEmptyValue(previewFieldValue(row, field))),
  )
  const parser = new Parser<T, T>({ fields: nonEmptyFields })
  return parser.parse(rows)
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
