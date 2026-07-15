export const toneForPercentage = (value: number): string => {
  if (value >= 99.5) {
    return 'bg-emerald-50 text-emerald-600'
  }
  if (value >= 95) {
    return 'bg-amber-50 text-amber-600'
  }
  return 'bg-red-50 text-red-600'
}
