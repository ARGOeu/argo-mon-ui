import {
  fetchResultsGroupDetails,
  fetchResultsGroupEndpoints,
  fetchResultsGroups,
  fetchStatusGroups,
} from '@/api/data'
import { useAuth } from '@/auth/useAuth'
import type { AccessMode } from '@/types/common'
import type {
  GroupDetailResponse,
  GroupEndpointsResponse,
  GroupResultsResponse,
  GroupStatusResponse,
} from '@/types/data'
import { useQuery } from '@tanstack/react-query'

export const useGetResultsGroups = (
  tenantIdentifier: string,
  mode: AccessMode,
  report?: string,
  item?: string,
  period?: string,
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useQuery<GroupResultsResponse, Error>({
    queryKey: ['results-groups', mode, tenantIdentifier, report, item, period],
    queryFn: () => {
      if (mode === 'private' && !token) {
        throw new Error('No authentication token available')
      }
      if (!tenantIdentifier) throw new Error('Tenant identifier is required')
      return fetchResultsGroups(
        tenantIdentifier,
        report,
        item,
        period,
        mode,
        mode === 'private' ? token : undefined,
      )
    },
    retry: false,
    refetchOnMount: 'always',
    enabled:
      enabled && (mode === 'private' ? !!token : true) && !!tenantIdentifier,
  })
}

export const useGetStatusGroups = (
  tenantIdentifier: string,
  mode: AccessMode,
  report: string = '',
  item?: string,
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useQuery<GroupStatusResponse, Error>({
    queryKey: ['status-groups', mode, tenantIdentifier, report, item],
    queryFn: () => {
      if (mode === 'private' && !token) {
        throw new Error('No authentication token available')
      }
      if (!tenantIdentifier) throw new Error('Tenant identifier is required')
      return fetchStatusGroups(
        tenantIdentifier,
        report,
        item,
        mode,
        mode === 'private' ? token : undefined,
      )
    },
    retry: false,
    refetchOnMount: 'always',
    enabled:
      enabled && (mode === 'private' ? !!token : true) && !!tenantIdentifier,
  })
}

export const useGetResultsGroupDetails = (
  tenantIdentifier: string,
  mode: AccessMode,
  report: string,
  groupName: string,
  startTime: string,
  endTime: string,
  granularity: string = 'daily',
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useQuery<GroupDetailResponse, Error>({
    queryKey: [
      'results-group-details',
      mode,
      tenantIdentifier,
      report,
      groupName,
      startTime,
      endTime,
      granularity,
    ],
    queryFn: () => {
      if (mode === 'private' && !token) {
        throw new Error('No authentication token available')
      }
      if (!tenantIdentifier) throw new Error('Tenant identifier is required')
      return fetchResultsGroupDetails(
        tenantIdentifier,
        report,
        groupName,
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
      !!groupName,
  })
}

export const useGetResultsGroupEndpoints = (
  tenantIdentifier: string,
  mode: AccessMode,
  report: string,
  groupName: string,
  startTime: string,
  endTime: string,
  granularity: string = 'daily',
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useQuery<GroupEndpointsResponse, Error>({
    queryKey: [
      'results-group-endpoints',
      mode,
      tenantIdentifier,
      report,
      groupName,
      startTime,
      endTime,
      granularity,
    ],
    queryFn: () => {
      if (mode === 'private' && !token) {
        throw new Error('No authentication token available')
      }
      if (!tenantIdentifier) throw new Error('Tenant identifier is required')
      return fetchResultsGroupEndpoints(
        tenantIdentifier,
        report,
        groupName,
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
      !!groupName,
  })
}
