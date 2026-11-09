import type {
  DailyResultRow,
  GroupsAvailabilityReliabilityResponse,
  SupergroupsArResponse,
} from '@/types/availabilityReliability'

export const toGroupDailyRows = (
  data: GroupsAvailabilityReliabilityResponse | undefined,
): DailyResultRow[] =>
  data?.results.flatMap((projectGroup) =>
    projectGroup.groups.flatMap((group) =>
      group.results.map((result) => ({
        date: result.timestamp,
        availability: parseFloat(result.availability),
        reliability: parseFloat(result.reliability),
        unknown: parseFloat(result.unknown),
        downtime: parseFloat(result.downtime),
      })),
    ),
  ) ?? []

export const toSupergroupDailyRows = (
  data: SupergroupsArResponse | undefined,
): DailyResultRow[] =>
  data?.results.flatMap((supergroup) =>
    supergroup.results.map((result) => ({
      date: result.timestamp,
      availability: parseFloat(result.availability),
      reliability: parseFloat(result.reliability),
    })),
  ) ?? []
