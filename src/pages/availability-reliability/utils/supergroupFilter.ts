import type { SelectOption } from '@/components/SelectDropdown'
import type {
  GroupAvailabilityReliability,
  GroupItem,
  GroupsAvailabilityReliabilityResponse,
} from '@/types/availabilityReliability'
import type { GroupTopologyItem } from '@/types/topology'

export const supergroupParam = 'supergroup'
export const scopeParam = 'scope'

const getItemScopes = (item: GroupTopologyItem): string[] =>
  (item.tags?.scope ?? '')
    .split(',')
    .map((scope) => scope.trim())
    .filter(Boolean)

export const getSupergroupTypes = (
  ...resultLists: ({ type: string }[] | undefined)[]
): string[] =>
  Array.from(
    new Set(
      resultLists
        .flatMap((results) => results ?? [])
        .map((supergroup) => supergroup.type)
        .filter(Boolean),
    ),
  )

export const getSupergroupTopology = (
  topologyGroups: GroupTopologyItem[],
  supergroupTypes: string[],
): GroupTopologyItem[] =>
  supergroupTypes.length > 0
    ? topologyGroups.filter((item) => supergroupTypes.includes(item.type))
    : topologyGroups

export const getTopologySupergroupNames = (
  topologyGroups: GroupTopologyItem[],
): string[] =>
  Array.from(new Set(topologyGroups.map((item) => item.group))).sort((a, b) =>
    a.localeCompare(b),
  )

export const getTopologyScopeNames = (
  topologyGroups: GroupTopologyItem[],
): string[] =>
  Array.from(new Set(topologyGroups.flatMap(getItemScopes))).sort((a, b) =>
    a.localeCompare(b),
  )

export const getTopologyGroupNames = (
  topologyGroups: GroupTopologyItem[],
  supergroupName: string,
): string[] =>
  topologyGroups
    .filter((item) => item.group === supergroupName)
    .map((item) => item.subgroup)

const getTopologyScopeGroupNames = (
  topologyGroups: GroupTopologyItem[],
  scopeName: string,
): string[] =>
  topologyGroups
    .filter((item) => getItemScopes(item).includes(scopeName))
    .map((item) => item.subgroup)

const getSectionOptions = (
  heading: string,
  param: string,
  names: string[],
): SelectOption[] =>
  names.length === 0
    ? []
    : [
        { value: `heading:${param}`, label: heading, disabled: true },
        ...names.map((name) => ({ value: `${param}:${name}`, label: name })),
      ]

const getSupergroupsHeading = (supergroupTypes: string[]): string =>
  supergroupTypes.length === 1 && supergroupTypes[0] === 'NGI'
    ? 'NGIs'
    : 'Supergroups'

export const getFilterOptions = (
  topologyGroups: GroupTopologyItem[],
  supergroupTypes: string[],
): SelectOption[] => [
  { value: '', label: 'All entries' },
  ...getSectionOptions(
    'Scopes',
    scopeParam,
    getTopologyScopeNames(topologyGroups),
  ),
  ...getSectionOptions(
    getSupergroupsHeading(supergroupTypes),
    supergroupParam,
    getTopologySupergroupNames(topologyGroups),
  ),
]

export const getFilterValue = (
  supergroupFilter: string | null,
  scopeFilter: string | null,
): string => {
  if (scopeFilter) {
    return `${scopeParam}:${scopeFilter}`
  }
  if (supergroupFilter) {
    return `${supergroupParam}:${supergroupFilter}`
  }
  return ''
}

export const getFilterParams = (value: string): Record<string, string> => {
  const separatorIndex = value.indexOf(':')
  if (separatorIndex === -1) {
    return {}
  }
  return { [value.slice(0, separatorIndex)]: value.slice(separatorIndex + 1) }
}

const toGroupRow = (group: GroupItem): GroupAvailabilityReliability => ({
  name: group.name,
  monthly: group.results.map((result) => ({
    month: result.timestamp,
    availability: parseFloat(result.availability),
    reliability: parseFloat(result.reliability),
  })),
})

export const getGroupRows = (
  groupsData: GroupsAvailabilityReliabilityResponse | undefined,
  topologyGroups: GroupTopologyItem[] | undefined,
  supergroupFilter: string | null,
  scopeFilter: string | null,
): GroupAvailabilityReliability[] => {
  if (!groupsData) {
    return []
  }

  let topologyGroupNames: string[] = []
  if (topologyGroups && scopeFilter) {
    topologyGroupNames = getTopologyScopeGroupNames(topologyGroups, scopeFilter)
  } else if (topologyGroups && supergroupFilter) {
    topologyGroupNames = getTopologyGroupNames(topologyGroups, supergroupFilter)
  }

  if (topologyGroupNames.length === 0) {
    if (scopeFilter) {
      return []
    }
    return groupsData.results
      .filter(
        (projectGroup) =>
          !supergroupFilter || projectGroup.name === supergroupFilter,
      )
      .flatMap((projectGroup) => projectGroup.groups.map(toGroupRow))
  }

  const topologyGroupNameSet = new Set(topologyGroupNames)
  const rowsByName = new Map<string, GroupAvailabilityReliability>()
  groupsData.results.forEach((projectGroup) => {
    projectGroup.groups.forEach((group) => {
      const isInTopology = topologyGroupNameSet.has(group.name)

      const isSelectedRow = projectGroup.name === supergroupFilter

      if (isInTopology && (isSelectedRow || !rowsByName.has(group.name))) {
        rowsByName.set(group.name, toGroupRow(group))
      }
    })
  })
  return [...rowsByName.values()]
}
