export const availabilityTone = (value: number): string => {
  if (value >= 99.5) {
    return 'bg-emerald-50 text-emerald-600'
  }
  if (value >= 95) {
    return 'bg-amber-50 text-amber-600'
  }
  return 'bg-red-50 text-red-600'
}

export const downtimeTone = (value: number): string => {
  if (value <= 0) {
    return 'bg-emerald-50 text-emerald-600'
  }
  if (value <= 1) {
    return 'bg-amber-50 text-amber-600'
  }
  return 'bg-red-50 text-red-600'
}
