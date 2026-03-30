type DateItem = {
  date: string
}

export const getLatestTopologyDate = (items?: DateItem[]): string => {
  if (!items?.length) {
    return ''
  }

  return items.reduce(
    (max, item) => (item.date > max ? item.date : max),
    items[0].date,
  )
}
