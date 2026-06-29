export const squishEmail = (
  email: string,
  start: number = 3,
  end: number = 3,
): string => {
  const parts = email?.split('@')
  if (!parts) return email
  const [local, domain] = parts

  return local?.length > start + end
    ? `${local.slice(0, start)}...${local.slice(-end)}@${domain}`
    : email
}
