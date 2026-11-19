import type { LatestMetricData } from '@/types/latestProblems'
import {
  PROBLEM_SEVERITIES,
  SEVERITY_STYLES,
  getProblemSeverity,
  toTime,
  type ProblemSeverity,
} from '@/utils/latestProblems'

export type MetricStatus = ProblemSeverity | 'ok'

// Ordered from the most to the least severe
export const METRIC_STATUSES: MetricStatus[] = [...PROBLEM_SEVERITIES, 'ok']

export const METRIC_STATUS_STYLES: Record<
  MetricStatus,
  { label: string; pill: string; dot: string; accent: string }
> = {
  ...SEVERITY_STYLES,
  ok: {
    label: 'OK',
    pill: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    dot: 'bg-emerald-500',
    accent: 'border-l-emerald-500',
  },
}

export const getMetricStatus = (status: string): MetricStatus =>
  status?.toUpperCase() === 'OK'
    ? 'ok'
    : (getProblemSeverity(status) ?? 'unknown')

export const isProblemStatus = (status: MetricStatus): boolean =>
  status === 'critical' || status === 'warning'

// Turns the probe output into readable text:
// removes the wrapping quotes, replaces "\n" with line break
// and turns an empty output ('') into an empty string.
export const cleanMetricOutput = (
  message: string | null | undefined,
): string => {
  const text = (message ?? '').trim()
  const isQuoted =
    text.length >= 2 &&
    (text.startsWith("'") || text.startsWith('"')) &&
    text.endsWith(text[0])

  return (isQuoted ? text.slice(1, -1) : text).replace(/\\n/g, '\n').trim()
}

// Keep every result and sort by severity first, then newest first
export const sortLatestMetrics = (
  metrics: LatestMetricData[],
): LatestMetricData[] =>
  [...metrics].sort(
    (a, b) =>
      METRIC_STATUSES.indexOf(getMetricStatus(a.status)) -
        METRIC_STATUSES.indexOf(getMetricStatus(b.status)) ||
      toTime(b.timestamp) - toTime(a.timestamp),
  )

export const countMetricsByStatus = (
  metrics: LatestMetricData[],
): Record<MetricStatus, number> => {
  const counts: Record<MetricStatus, number> = {
    critical: 0,
    warning: 0,
    unknown: 0,
    missing: 0,
    ok: 0,
  }
  for (const metric of metrics) {
    counts[getMetricStatus(metric.status)] += 1
  }
  return counts
}
