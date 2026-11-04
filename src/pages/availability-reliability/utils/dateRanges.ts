export const toW3CTimestamp = (date: Date): string =>
  date.toISOString().replace(/\.\d{3}Z$/, 'Z')

const recentMonthsCount = 5

export const getRecentMonthsRange = (): {
  startTime: string
  endTime: string
} => {
  const now = new Date()
  const todayUtcDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  )
  const start = new Date(
    Date.UTC(
      todayUtcDate.getUTCFullYear(),
      todayUtcDate.getUTCMonth() - (recentMonthsCount - 1),
      1,
    ),
  )
  return {
    startTime: toW3CTimestamp(start),
    endTime: toW3CTimestamp(todayUtcDate),
  }
}

export const getMonthRange = (
  month: string,
): { startTime: string; endTime: string } => {
  const [year, mon] = month.split('-').map(Number)
  const start = new Date(Date.UTC(year, mon - 1, 1))
  const end = new Date(Date.UTC(year, mon, 0, 23, 59, 59))
  return { startTime: toW3CTimestamp(start), endTime: toW3CTimestamp(end) }
}

export const getMonthsWithData = (
  rows: Array<{ monthly: Array<{ month: string }> }>,
): string[] => {
  const allMonths = rows.flatMap((row) => row.monthly.map((m) => m.month))
  const uniqueMonths = [...new Set(allMonths)]
  return uniqueMonths.sort()
}

export const formatMonthLabel = (
  month: string,
  style: 'short' | 'long' = 'short',
): string => {
  const [year, mon] = month.split('-').map(Number)
  return new Date(year, mon - 1, 1).toLocaleDateString('en-GB', {
    month: style,
    year: 'numeric',
  })
}
