export const padTwoDigits = (n: number): string => String(n).padStart(2, '0')

const toDateString = (date: Date): string =>
  `${date.getUTCFullYear()}-${padTwoDigits(date.getUTCMonth() + 1)}-${padTwoDigits(date.getUTCDate())}`

export const getTodayDateString = (): string => {
  return toDateString(new Date())
}
