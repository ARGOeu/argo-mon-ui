import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/auth/useAuth'

import type { StatusTimelineResponse } from '@/types/statusTimeline'
import type { AccessMode } from '@/types/common'
import { fetchStatusTimelineGroups } from '@/api/statusTimeline'

export const useGetStatusTimelineGroups = (
  tenantIdentifier: string,
  mode: AccessMode,
  report: string | undefined,
  startTime: string,
  endTime: string,
  enabled: boolean = true,
  refetchInterval?: number,
) => {
  const { token } = useAuth()

  return useQuery<StatusTimelineResponse, Error>({
    queryKey: [
      'status-timeline-groups',
      mode,
      tenantIdentifier,
      report,
      startTime,
      endTime,
    ],
    queryFn: () => {
      if (mode === 'private' && !token) {
        throw new Error('No authentication token available')
      }
      if (!tenantIdentifier) throw new Error('Tenant identifier is required')
      return fetchStatusTimelineGroups(
        tenantIdentifier,
        report,
        startTime,
        endTime,
        mode,
        mode === 'private' ? token : undefined,
      )
    },
    retry: false,
    refetchOnMount: 'always',
    refetchInterval,
    enabled:
      enabled &&
      (mode === 'private' ? !!token : true) &&
      !!tenantIdentifier &&
      !!report,
  })
}
