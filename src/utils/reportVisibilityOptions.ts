import type { SelectOption } from '@/components/SelectDropdown'

type ReportOption = { id?: string; name: string; public?: boolean }

export const buildReportOptions = (
  reports: ReportOption[] | undefined,
  valueKey: 'name' | 'id' = 'name',
): SelectOption[] => {
  if (!reports) {
    return []
  }

  const toOption = (r: ReportOption): SelectOption => ({
    value: valueKey === 'id' ? (r.id ?? r.name) : r.name,
    label: r.name,
  })

  const hasVisibility = reports.some((r) => r.public !== undefined)
  if (!hasVisibility) {
    return reports.map(toOption)
  }

  const options: SelectOption[] = []
  const privateReports = reports.filter((r) => r.public !== true)
  const publicReports = reports.filter((r) => r.public === true)

  if (privateReports.length > 0) {
    options.push({ value: 'group_private', label: 'Private', disabled: true })
    privateReports.forEach((r) => options.push(toOption(r)))
  }
  if (publicReports.length > 0) {
    options.push({ value: 'group_public', label: 'Public', disabled: true })
    publicReports.forEach((r) => options.push(toOption(r)))
  }

  return options
}
