type FormatDateTimeOptions = {
  utc?: boolean
  seconds?: boolean
  weekday?: boolean
  utcSuffix?: boolean
}

// Default: UTC, no seconds, no weekday, no suffix
export const formatDateTime = (
  dateString?: string,
  {
    utc = true,
    seconds = false,
    weekday = false,
    utcSuffix = false,
  }: FormatDateTimeOptions = {},
): string => {
  if (!dateString) {
    return 'N/A'
  }

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) {
    return 'N/A'
  }

  const formatOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
  if (weekday) {
    formatOptions.weekday = 'short'
  }
  if (seconds) {
    formatOptions.second = '2-digit'
  }
  if (utc) {
    formatOptions.timeZone = 'UTC'
  }

  const formatted = date.toLocaleString('en-GB', formatOptions)
  return utcSuffix ? `${formatted} (UTC)` : formatted
}

// Ignores sub-second differences when comparing timestamps.
export const roundToSecond = (isoString: string): number =>
  Math.floor(new Date(isoString).getTime() / 1000)

export const formatRelativeTime = (
  dateString?: string,
  fallbackDateString?: string,
): string => {
  const primary =
    dateString && !Number.isNaN(new Date(dateString).getTime())
      ? dateString
      : fallbackDateString

  if (!primary) {
    return 'N/A'
  }

  const date = new Date(primary)
  if (Number.isNaN(date.getTime())) {
    return 'N/A'
  }

  const diffMs = date.getTime() - Date.now()
  if (Math.abs(diffMs) < 60_000) {
    return 'just now'
  }

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'always' })
  const divisions: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31_536_000_000],
    ['month', 2_592_000_000],
    ['day', 86_400_000],
    ['hour', 3_600_000],
    ['minute', 60_000],
  ]

  for (const [unit, unitMs] of divisions) {
    if (Math.abs(diffMs) >= unitMs) {
      return rtf.format(Math.trunc(diffMs / unitMs), unit)
    }
  }

  return 'just now'
}
