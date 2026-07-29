import type { Downtime } from '@/types/downtimes'

export type DowntimeTimeStatus = 'active' | 'upcoming' | 'completed'

type DowntimeDateGroup = {
  dateKey: string
  dateLabel: string
  downtimes: Downtime[]
}

export const sectionLabels: Record<DowntimeTimeStatus, string> = {
  active: 'Active',
  upcoming: 'Upcoming',
  completed: 'Completed',
}

export const formatDateTimeUTC = (dateString?: string): string => {
  if (!dateString) {
    return 'N/A'
  }
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) {
    return 'N/A'
  }
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  })
}

const getDowntimeTimeStatus = (
  downtime: Downtime,
  now: number = Date.now(),
): DowntimeTimeStatus => {
  const scheduledAt = new Date(downtime.scheduled_at).getTime()
  const completedAt = downtime.completed_at
    ? new Date(downtime.completed_at).getTime()
    : null

  if (scheduledAt > now) {
    return 'upcoming'
  }
  if (completedAt !== null && completedAt <= now) {
    return 'completed'
  }
  return 'active'
}

export const groupDowntimesByTimeStatus = (
  downtimes: Downtime[],
): Record<DowntimeTimeStatus, Downtime[]> => {
  const now = Date.now()
  const buckets: Record<DowntimeTimeStatus, Downtime[]> = {
    active: [],
    upcoming: [],
    completed: [],
  }

  downtimes.forEach((downtime) => {
    buckets[getDowntimeTimeStatus(downtime, now)].push(downtime)
  })

  return buckets
}

const getDateKey = (isoString: string) => {
  const date = new Date(isoString)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

const getDateLabel = (isoString: string) =>
  new Date(isoString).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })

export const groupByDate = (downtimes: Downtime[]): DowntimeDateGroup[] => {
  const groupsByKey: Record<string, DowntimeDateGroup> = {}

  downtimes.forEach((downtime) => {
    const dateKey = getDateKey(downtime.scheduled_at)
    groupsByKey[dateKey] ??= {
      dateKey,
      dateLabel: getDateLabel(downtime.scheduled_at),
      downtimes: [],
    }
    groupsByKey[dateKey].downtimes.push(downtime)
  })

  return Object.values(groupsByKey)
}
