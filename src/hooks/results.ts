import { fetchResultsEndpoints } from '@/api/results'
import { useAuth } from '@/auth/useAuth'
import type { AccessMode } from '@/types/common'
import type { Granularity, EndpointResultsResponse } from '@/types/results'
import { useQuery } from '@tanstack/react-query'

export const useGetResultsEndpoints = (
  tenantIdentifier: string,
  mode: AccessMode,
  report: string | undefined,
  startTime: string | undefined,
  endTime: string | undefined,
  granularity: Granularity = 'daily',
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useQuery<EndpointResultsResponse, Error>({
    queryKey: [
      'results-endpoints',
      mode,
      tenantIdentifier,
      report,
      startTime,
      endTime,
      granularity,
    ],
    queryFn: () => {
      if (mode === 'private' && !token) {
        throw new Error('No authentication token available')
      }
      if (!tenantIdentifier) throw new Error('Tenant identifier is required')
      if (!report) throw new Error('Report is required')
      if (!startTime || !endTime) {
        throw new Error('Start and end time are required')
      }
      return fetchResultsEndpoints(
        tenantIdentifier,
        report,
        startTime,
        endTime,
        granularity,
        mode,
        mode === 'private' ? token : undefined,
      )
    },
    retry: false,
    refetchOnMount: 'always',
    enabled:
      enabled &&
      (mode === 'private' ? !!token : true) &&
      !!tenantIdentifier &&
      !!report &&
      !!startTime &&
      !!endTime,
  })
}
