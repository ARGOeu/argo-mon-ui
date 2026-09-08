export type MetricTier = 'good' | 'warn' | 'bad' | 'none'

export const getMetricTier = (value?: number): MetricTier => {
  if (value === undefined) return 'none'
  if (value > 99) return 'good'
  if (value > 98) return 'warn'
  return 'bad'
}

export const METRIC_TIER_BADGE_CLASSES: Record<MetricTier, string> = {
  good: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  warn: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  bad: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200',
  none: 'bg-slate-50 text-slate-400 ring-1 ring-inset ring-slate-200',
}

export const METRIC_TIER_TEXT_CLASSES: Record<MetricTier, string> = {
  good: 'text-emerald-600',
  warn: 'text-amber-600',
  bad: 'text-red-600',
  none: 'text-slate-400',
}
