import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/auth/useAuth'
import { fetchGroupsAvailabilityReliability } from '@/api/availabilityReliability'
import type {
  GroupsAvailabilityReliabilityResponse,
  ResultGranularity,
} from '@/types/availabilityReliability'

export const useGetGroupsAvailabilityReliability = (
  tenantId: string,
  reportName: string,
  granularity: ResultGranularity,
  startTime: string,
  endTime: string,
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useQuery<GroupsAvailabilityReliabilityResponse, Error>({
    queryKey: [
      'availability-reliability-groups',
      tenantId,
      reportName,
      granularity,
      startTime,
      endTime,
    ],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      if (!tenantId) {
        throw new Error('Tenant ID is required')
      }
      if (!reportName) {
        throw new Error('Report name is required')
      }
      return fetchGroupsAvailabilityReliability(
        tenantId,
        reportName,
        granularity,
        startTime,
        endTime,
        token,
      )
    },
    retry: false,
    enabled:
      enabled &&
      !!token &&
      !!tenantId &&
      !!reportName &&
      !!startTime &&
      !!endTime,
  })
}
