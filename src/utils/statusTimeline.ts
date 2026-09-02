import type { StatusEntry, StatusValue } from '@/types/statusTimeline'

export const STATUS_STYLES: Record<
  StatusValue,
  { bar: string; dot: string; label: string }
> = {
  OK: { bar: 'bg-emerald-500', dot: 'bg-emerald-500', label: 'OK' },
  WARNING: { bar: 'bg-amber-500', dot: 'bg-amber-500', label: 'Warning' },
  CRITICAL: { bar: 'bg-red-500', dot: 'bg-red-500', label: 'Critical' },
  DOWNTIME: {
    bar: 'bg-sky-400 bg-[repeating-linear-gradient(45deg,transparent,transparent_3px,rgba(255,255,255,.45)_3px,rgba(255,255,255,.45)_6px)]',
    dot: 'bg-sky-400',
    label: 'Downtime',
  },
  UNKNOWN: { bar: 'bg-neutral-400', dot: 'bg-neutral-400', label: 'Unknown' },
  MISSING: { bar: 'bg-neutral-200', dot: 'bg-neutral-200', label: 'No data' },
}

// Predifined periods to view status timelines
export const STATUS_RANGE_DAYS = {
  '1d': 1,
  '3d': 3,
  '7d': 7,
} as const

export type StatusRangeId = keyof typeof STATUS_RANGE_DAYS

export const STATUS_RANGES = Object.keys(STATUS_RANGE_DAYS) as StatusRangeId[]

// Use timezone mode to distinquish between UTC and local
export type TimeZoneMode = 'utc' | 'local'

// Individual segment - part of a status timeline
export interface StatusSegment {
  key: string
  value: StatusValue
  start: number
  end: number
  leftPct: number
  widthPct: number
}

// Method that builds a visual segment - part of a status timeline
export const buildSegments = (
  statuses: StatusEntry[] | undefined,
  windowStart: number,
  windowEnd: number,
  dataEnd: number = windowEnd,
): StatusSegment[] => {
  const span = windowEnd - windowStart
  if (span <= 0) return []

  const end = Math.min(dataEnd, windowEnd)
  if (end <= windowStart) return []

  const toSegment = (
    s: { start: number; end: number; value: StatusValue },
    i: number,
  ): StatusSegment => ({
    key: `${i}-${s.start}`,
    value: s.value,
    start: s.start,
    end: s.end,
    leftPct: ((s.start - windowStart) / span) * 100,
    widthPct: ((s.end - s.start) / span) * 100,
  })

  const points = (statuses ?? [])
    .map((s) => ({ t: Date.parse(s.timestamp), value: s.value }))
    .filter((p) => Number.isFinite(p.t))
    .sort((a, b) => a.t - b.t)

  if (points.length === 0) {
    return [toSegment({ start: windowStart, end, value: 'MISSING' }, 0)]
  }

  // merge identical values
  const merged: { t: number; value: StatusValue }[] = []

  points.forEach((p) => {
    const prev = merged[merged.length - 1]
    if (prev && prev.value === p.value) return
    merged.push(p)
  })

  const raw: { start: number; end: number; value: StatusValue }[] = []
  if (merged[0].t > windowStart) {
    raw.push({
      start: windowStart,
      end: Math.min(merged[0].t, end),
      value: 'MISSING',
    })
  }
  merged.forEach((p, i) => {
    const start = Math.max(p.t, windowStart)
    const rawEnd = i < merged.length - 1 ? merged[i + 1].t : end
    const segEnd = Math.min(rawEnd, end)
    if (segEnd > start) raw.push({ start, end: segEnd, value: p.value })
  })

  return raw.map(toSegment)
}

export interface StatusDivision {
  time: number
  pct: number
  label: string
  major: boolean
}

const MINUTE = 60_000
const DAY = 24 * 60 * MINUTE
const DIVISION_STEPS = [
  5 * MINUTE,
  15 * MINUTE,
  30 * MINUTE,
  60 * MINUTE,
  2 * 60 * MINUTE,
  3 * 60 * MINUTE,
  6 * 60 * MINUTE,
  12 * 60 * MINUTE,
  DAY,
  2 * DAY,
  7 * DAY,
]

const padTwoDigits = (n: number) => String(n).padStart(2, '0')

const getParts = (ms: number, tz: TimeZoneMode) => {
  const d = new Date(ms)
  return tz === 'utc'
    ? { hours: d.getUTCHours(), minutes: d.getUTCMinutes() }
    : { hours: d.getHours(), minutes: d.getMinutes() }
}

export const fmtClock = (ms: number, tz: TimeZoneMode) => {
  const { hours, minutes } = getParts(ms, tz)
  return `${padTwoDigits(hours)}:${padTwoDigits(minutes)}`
}

export const fmtDay = (ms: number, tz: TimeZoneMode) =>
  new Date(ms).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    ...(tz === 'utc' ? { timeZone: 'UTC' } : {}),
  })

export const fmtStamp = (ms: number, tz: TimeZoneMode) =>
  tz === 'utc'
    ? `${fmtDay(ms, tz)} ${fmtClock(ms, tz)}Z`
    : `${fmtDay(ms, tz)} ${fmtClock(ms, tz)}`

// Create a UTC+number label when user selects local time
export const localOffsetLabel = (ms: number = Date.now()) => {
  const offsetMin = -new Date(ms).getTimezoneOffset()
  if (offsetMin === 0) return 'UTC'
  const sign = offsetMin > 0 ? '+' : '-'
  const abs = Math.abs(offsetMin)
  const h = Math.floor(abs / 60)
  const m = abs % 60
  return `UTC${sign}${h}${m ? `:${padTwoDigits(m)}` : ''}`
}

export const fmtDuration = (ms: number) => {
  const totalMinutes = Math.round(ms / MINUTE)
  if (totalMinutes < 1) return '<1m'
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const minutes = totalMinutes % 60
  const parts: string[] = []
  if (days) parts.push(`${days}d`)
  if (hours) parts.push(`${hours}h`)
  if (minutes && !days) parts.push(`${minutes}m`)
  return parts.join(' ') || '<1m'
}

// Start of day based on timezone
const startOfDay = (ms: number, tz: TimeZoneMode) => {
  const d = new Date(ms)
  if (tz === 'utc') d.setUTCHours(0, 0, 0, 0)
  else d.setHours(0, 0, 0, 0)
  return d.getTime()
}

const addCalendarDays = (ms: number, days: number, tz: TimeZoneMode) => {
  const d = new Date(ms)
  if (tz === 'utc') d.setUTCDate(d.getUTCDate() + days)
  else d.setDate(d.getDate() + days)
  return d.getTime()
}

const isMidnight = (ms: number, tz: TimeZoneMode) => {
  const { hours, minutes } = getParts(ms, tz)
  return hours === 0 && minutes === 0
}

// Create divisions - markers on time axis
export const buildStatusDivisions = (
  windowStart: number,
  windowEnd: number,
  tz: TimeZoneMode = 'utc',
  target = 8,
): StatusDivision[] => {
  const span = windowEnd - windowStart
  if (span <= 0) return []

  const ideal = span / target
  const step = DIVISION_STEPS.find((s) => s >= ideal) ?? DIVISION_STEPS.at(-1)!

  const statusDivisions: StatusDivision[] = []

  if (step >= DAY) {
    const dayStep = step / DAY
    let t = startOfDay(windowStart, tz)
    if (t < windowStart) t = addCalendarDays(t, dayStep, tz)
    for (; t <= windowEnd; t = addCalendarDays(t, dayStep, tz)) {
      statusDivisions.push({
        time: t,
        pct: ((t - windowStart) / span) * 100,
        label: fmtDay(t, tz),
        major: true,
      })
    }
    return statusDivisions
  }

  const dayStart = startOfDay(windowStart, tz)
  const first = dayStart + Math.ceil((windowStart - dayStart) / step) * step
  for (let t = first; t <= windowEnd; t += step) {
    const midnight = isMidnight(t, tz)
    statusDivisions.push({
      time: t,
      pct: ((t - windowStart) / span) * 100,
      label: midnight ? fmtDay(t, tz) : fmtClock(t, tz),
      major: midnight,
    })
  }
  return statusDivisions
}
