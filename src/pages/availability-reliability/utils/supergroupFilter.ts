import type {
  GroupAvailabilityReliability,
  GroupItem,
  GroupsAvailabilityReliabilityResponse,
} from '@/types/availabilityReliability'
import type { GroupTopologyItem } from '@/types/topology'

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

export const getTopologyGroupNames = (
  topologyGroups: GroupTopologyItem[],
  supergroupName: string,
): string[] =>
  topologyGroups
    .filter((item) => item.group === supergroupName)
    .map((item) => item.subgroup)

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
  supergroupFilter: string | null,
  topologyGroups: GroupTopologyItem[] | undefined,
): GroupAvailabilityReliability[] => {
  if (!groupsData) {
    return []
  }

  const topologyGroupNames =
    supergroupFilter && topologyGroups
      ? getTopologyGroupNames(topologyGroups, supergroupFilter)
      : []

  if (topologyGroupNames.length === 0) {
    return groupsData.results
      .filter(
        (projectGroup) =>
          !supergroupFilter || projectGroup.name === supergroupFilter,
      )
      .flatMap((projectGroup) => projectGroup.groups.map(toGroupRow))
  }

  const rowsByName = new Map<string, GroupAvailabilityReliability>()
  groupsData.results.forEach((projectGroup) => {
    projectGroup.groups.forEach((group) => {
      const isInTopology = topologyGroupNames.includes(group.name)

      const isSelectedRow = projectGroup.name === supergroupFilter

      if (isInTopology && (isSelectedRow || !rowsByName.has(group.name))) {
        rowsByName.set(group.name, toGroupRow(group))
      }
    })
  })
  return [...rowsByName.values()]
}
