import { fetchResultsGroups, fetchStatusGroups } from '@/api/data'
import { useAuth } from '@/auth/useAuth'
import type { GroupResultsResponse, GroupStatusResponse } from '@/types/data'
import { useQuery } from '@tanstack/react-query'

export const useGetResultsGroups = (
  tenantId: string,
  report?: string,
  item?: string,
  period?: string,
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useQuery<GroupResultsResponse, Error>({
    queryKey: ['results-groups', tenantId, report, item],
    queryFn: () => {
      if (!token) throw new Error('No authentication token available')
      if (!tenantId) throw new Error('Tenant ID is required')
      return fetchResultsGroups(tenantId, token, report, item, period)
    },
    retry: false,
    enabled: enabled && !!token && !!tenantId,
  })
}

export const useGetStatusGroups = (
  tenantId: string,
  report: string = '',
  item?: string,
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useQuery<GroupStatusResponse, Error>({
    queryKey: ['status-groups', tenantId, report, item],
    queryFn: () => {
      if (!token) throw new Error('No authentication token available')
      if (!tenantId) throw new Error('Tenant ID is required')
      return fetchStatusGroups(tenantId, report, token, item)
    },
    retry: false,
    enabled: enabled && !!token && !!tenantId,
  })
}
