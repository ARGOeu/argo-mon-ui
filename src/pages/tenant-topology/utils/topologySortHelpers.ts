const getFieldValue = (item: unknown, propertyPath: string): string => {
  const value = propertyPath.split('.').reduce<unknown>((acc, propertyKey) => {
    if (!acc || typeof acc !== 'object') {
      return undefined
    }

    return (acc as Record<string, unknown>)[propertyKey]
  }, item)

  if (value === null || value === undefined) {
    return ''
  }

  return String(value)
}

export const sortByField = <T>(
  items: T[],
  sortField: string | null,
  sortAsc: boolean,
): T[] => {
  if (!sortField) {
    return items
  }

  return [...items].sort((a, b) => {
    const comparisonResult = getFieldValue(a, sortField).localeCompare(
      getFieldValue(b, sortField),
    )
    return sortAsc ? comparisonResult : -comparisonResult
  })
}
