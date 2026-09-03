// Ignores sub-second differences when comparing timestamps.
export const roundToSecond = (isoString: string) =>
  Math.floor(new Date(isoString).getTime() / 1000)

export const formatDateTime = (isoString: string) =>
  new Date(isoString).toLocaleString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  })

export const formatDateTimeWithWeekday = (isoString: string) =>
  new Date(isoString).toLocaleString('en-GB', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  })

export const formatDateTimeWithSeconds = (isoString: string) =>
  new Date(isoString).toLocaleString('en-GB', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'UTC',
  })
