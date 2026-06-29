export const statusConfig = [
  { status: 'CRITICAL', colorClass: 'text-red-500', label: 'Critical' },
  { status: 'DOWNTIME', colorClass: 'text-slate-500', label: 'Downtime' },
  { status: 'WARNING', colorClass: 'text-yellow-500', label: 'Warning' },
  { status: 'UNKNOWN', colorClass: 'text-slate-400', label: 'Unknown' },
  { status: 'MISSING', colorClass: 'text-blue-500', label: 'Missing' },
  { status: 'OK', colorClass: 'text-green-600', label: 'OK' },
]

const statusDisplayOrder = [
  'OK',
  'CRITICAL',
  'WARNING',
  'MISSING',
  'DOWNTIME',
  'UNKNOWN',
]

export type StatusCount = {
  status: string
  colorClass: string
  label: string
  count: number
}

export const computeAvailabilityStats = (
  results: { availability: string }[],
): { name: string; value: number }[] | undefined => {
  if (results.length === 0) {
    return undefined
  }
  const validValues = results
    .map((r) => parseFloat(r.availability))
    .filter((v) => !isNaN(v) && v >= 0)

  if (validValues.length === 0) {
    return undefined
  }
  const avg =
    Math.round(
      (validValues.reduce((sum, v) => sum + v, 0) / validValues.length) * 10,
    ) / 10
  return [{ name: 'Avg Avail', value: avg }]
}

export const computeStatusStats = (
  results: { value: string }[],
): {
  statusStats: { name: string; value: string; colorClass: string }[] | undefined
  statusCounts: StatusCount[]
} => {
  const count = (status: string) =>
    results.filter((r) => r.value === status).length
  const counts = statusConfig
    .map((p) => ({ ...p, count: count(p.status) }))
    .filter((c) => c.count > 0)

  if (counts.length === 0) {
    return { statusStats: undefined, statusCounts: [] }
  }

  const top = counts[0]
  const sorted = [...counts].sort(
    (a, b) =>
      statusDisplayOrder.indexOf(a.status) -
      statusDisplayOrder.indexOf(b.status),
  )

  return {
    statusStats: [
      { name: 'Current State', value: top.label, colorClass: top.colorClass },
    ],
    statusCounts: sorted,
  }
}
