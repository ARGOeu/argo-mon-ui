import type { EndpointTopologyItem, EndpointWithGroups } from '@/types/topology'

export const splitEndpoint = ({
  groups,
  ...fields
}: EndpointWithGroups): EndpointTopologyItem[] =>
  groups.map((group) => ({ ...fields, group }))

const getMergeKey = (entry: EndpointTopologyItem): string => {
  const { group, ...fields } = entry
  const infoId = fields.tags?.info_ID

  if (infoId) {
    const url = fields.tags?.info_URL ?? fields.hostname
    return JSON.stringify([infoId, fields.service, url])
  }
  return JSON.stringify([fields, group])
}

export const mergeEntries = (
  entries: EndpointTopologyItem[],
): EndpointWithGroups[] => {
  const endpoints: Record<string, EndpointWithGroups> = {}

  entries.forEach((entry, index) => {
    const { group, ...fields } = entry
    const key = fields.tags?.info_ID ? getMergeKey(entry) : `no-id-${index}`

    if (!endpoints[key]) {
      endpoints[key] = { ...fields, groups: [] }
    }
    if (!endpoints[key].groups.includes(group)) {
      endpoints[key].groups.push(group)
    }
  })

  return Object.values(endpoints).map((endpoint) => ({
    ...endpoint,
    groups: endpoint.groups.sort((a, b) => a.localeCompare(b)),
  }))
}

const findEntryIndexes = (
  entries: EndpointTopologyItem[],
  endpoint: EndpointWithGroups,
): number[] => {
  const key = getMergeKey(splitEndpoint(endpoint)[0])
  const indexes = entries.flatMap((entry, index) =>
    getMergeKey(entry) === key ? [index] : [],
  )

  return endpoint.tags?.info_ID ? indexes : indexes.slice(0, 1)
}

export const removeEndpoint = (
  entries: EndpointTopologyItem[],
  endpoint: EndpointWithGroups,
): EndpointTopologyItem[] => {
  const indexes = findEntryIndexes(entries, endpoint)

  return entries.filter((_, index) => !indexes.includes(index))
}

export const replaceEndpoint = (
  entries: EndpointTopologyItem[],
  originalEndpoint: EndpointWithGroups,
  updatedEndpoint: EndpointWithGroups,
): EndpointTopologyItem[] => {
  const indexes = findEntryIndexes(entries, originalEndpoint)

  return entries.flatMap((entry, index) => {
    if (index === indexes[0]) {
      return splitEndpoint(updatedEndpoint)
    }
    return indexes.includes(index) ? [] : [entry]
  })
}
