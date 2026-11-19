import type { LatestMetricData } from '@/types/latestProblems'

export type ProblemSeverity = 'critical' | 'warning' | 'unknown' | 'missing'

// ordered list per severity
export const PROBLEM_SEVERITIES: ProblemSeverity[] = [
  'critical',
  'warning',
  'unknown',
  'missing',
]

// severity map
export const getProblemSeverity = (status: string): ProblemSeverity | null => {
  switch (status?.toUpperCase()) {
    case 'CRITICAL':
      return 'critical'
    case 'WARNING':
      return 'warning'
    case 'UNKNOWN':
      return 'unknown'
    case 'MISSING':
      return 'missing'
    default:
      return null
  }
}

export const SEVERITY_STYLES: Record<
  ProblemSeverity,
  { label: string; pill: string; dot: string; accent: string }
> = {
  critical: {
    label: 'Critical',
    pill: 'bg-red-50 text-red-700 ring-red-600/20',
    dot: 'bg-red-500',
    accent: 'border-l-red-500',
  },
  warning: {
    label: 'Warning',
    pill: 'bg-amber-50 text-amber-800 ring-amber-600/20',
    dot: 'bg-amber-500',
    accent: 'border-l-amber-500',
  },
  unknown: {
    label: 'Unknown',
    pill: 'bg-neutral-100 text-neutral-600 ring-neutral-500/20',
    dot: 'bg-neutral-400',
    accent: 'border-l-neutral-400',
  },
  missing: {
    label: 'Missing',
    pill: 'bg-gray-50 text-gray-600 ring-gray-500/20',
    dot: 'bg-gray-400',
    accent: 'border-l-gray-400',
  },
}

export const toTime = (iso: string) => {
  const t = Date.parse(iso)
  return Number.isFinite(t) ? t : 0
}

const severityRank = (status: string) => {
  const s = getProblemSeverity(status)
  return s === null ? PROBLEM_SEVERITIES.length : PROBLEM_SEVERITIES.indexOf(s)
}

// get problematic statuses
export const selectLatestProblems = (
  metrics: LatestMetricData[],
): LatestMetricData[] =>
  metrics
    .filter((m) => getProblemSeverity(m.status) !== null)
    .sort(
      (a, b) =>
        toTime(b.timestamp) - toTime(a.timestamp) ||
        severityRank(a.status) - severityRank(b.status),
    )

export const formatRelativeTime = (iso: string, now: number): string => {
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return '—'
  const seconds = Math.max(0, Math.round((now - t) / 1000))
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

// create navigation link towards status view timeline displaying the metric details
export const buildStatusTimelineHref = (
  basePath: string,
  report: string,
  check: LatestMetricData,
): string => {
  const params = new URLSearchParams({
    report,
    group: check.endpoint_group,
    serviceType: check.service,
    endpoint: check.endpoint,
    metric: check.metric,
  })
  if (check.timestamp) params.set('ts', check.timestamp)
  return `${basePath}?${params.toString()}`
}
