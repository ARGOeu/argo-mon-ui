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
    queryKey: ['results-groups', tenantId, report, item, period],
    queryFn: () => {
      if (!token) throw new Error('No authentication token available')
      if (!tenantId) throw new Error('Tenant ID is required')
      return fetchResultsGroups(tenantId, token, report, item, period)
    },
    retry: false,
    refetchOnMount: 'always',
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
    refetchOnMount: 'always',
    enabled: enabled && !!token && !!tenantId,
  })
}

export const useGetPublicResultsGroups = (
  tenantName: string,
  report?: string,
  item?: string,
  period?: string,
  enabled: boolean = true,
) => {
  return useQuery<GroupResultsResponse, Error>({
    queryKey: ['public-results-groups', tenantName, report, item, period],
    queryFn: () => {
      if (!tenantName) throw new Error('Tenant name is required')
      return fetchResultsGroups(tenantName, undefined, report, item, period)
    },
    retry: false,
    enabled: enabled && !!tenantName,
  })
}

export const useGetPublicStatusGroups = (
  tenantName: string,
  report: string = '',
  item?: string,
  enabled: boolean = true,
) => {
  return useQuery<GroupStatusResponse, Error>({
    queryKey: ['public-status-groups', tenantName, report, item],
    queryFn: () => {
      if (!tenantName) throw new Error('Tenant name is required')
      return fetchStatusGroups(tenantName, report, undefined, item)
    },
    retry: false,
    enabled: enabled && !!tenantName,
  })
}
