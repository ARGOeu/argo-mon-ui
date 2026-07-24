import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/auth/useAuth'
import {
  fetchGroupsAvailabilityReliability,
  fetchGroupAvailabilityReliability,
  fetchEndpointsAvailabilityReliability,
  fetchEndpointAvailabilityReliability,
} from '@/api/availabilityReliability'
import type { AccessMode } from '@/types/common'
import type {
  GroupsAvailabilityReliabilityResponse,
  EndpointsARResponse,
  ResultGranularity,
} from '@/types/availabilityReliability'

export const useGetGroupsAR = (
  tenantIdentifier: string,
  reportName: string,
  granularity: ResultGranularity,
  startTime: string,
  endTime: string,
  mode: AccessMode,
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useQuery<GroupsAvailabilityReliabilityResponse, Error>({
    queryKey: [
      'availability-reliability-groups',
      mode,
      tenantIdentifier,
      reportName,
      granularity,
      startTime,
      endTime,
    ],
    queryFn: () => {
      if (mode === 'private' && !token) {
        throw new Error('No authentication token available')
      }
      if (!tenantIdentifier) {
        throw new Error('Tenant identifier is required')
      }
      if (!reportName) {
        throw new Error('Report name is required')
      }
      return fetchGroupsAvailabilityReliability(
        tenantIdentifier,
        reportName,
        granularity,
        startTime,
        endTime,
        mode,
        mode === 'private' ? token : undefined,
      )
    },
    retry: false,
    enabled:
      enabled &&
      (mode === 'private' ? !!token : true) &&
      !!tenantIdentifier &&
      !!reportName &&
      !!startTime &&
      !!endTime,
  })
}

export const useGetGroupAR = (
  tenantIdentifier: string,
  reportName: string,
  groupName: string,
  granularity: ResultGranularity,
  startTime: string,
  endTime: string,
  mode: AccessMode,
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useQuery<GroupsAvailabilityReliabilityResponse, Error>({
    queryKey: [
      'availability-reliability-group-daily',
      mode,
      tenantIdentifier,
      reportName,
      groupName,
      granularity,
      startTime,
      endTime,
    ],
    queryFn: () => {
      if (mode === 'private' && !token) {
        throw new Error('No authentication token available')
      }
      if (!tenantIdentifier) {
        throw new Error('Tenant identifier is required')
      }
      if (!reportName) {
        throw new Error('Report name is required')
      }
      if (!groupName) {
        throw new Error('Group name is required')
      }
      return fetchGroupAvailabilityReliability(
        tenantIdentifier,
        reportName,
        groupName,
        granularity,
        startTime,
        endTime,
        mode,
        mode === 'private' ? token : undefined,
      )
    },
    retry: false,
    enabled:
      enabled &&
      (mode === 'private' ? !!token : true) &&
      !!tenantIdentifier &&
      !!reportName &&
      !!groupName &&
      !!startTime &&
      !!endTime,
  })
}

export const useGetEndpointsAR = (
  tenantIdentifier: string,
  reportName: string,
  groupName: string,
  granularity: ResultGranularity,
  startTime: string,
  endTime: string,
  mode: AccessMode,
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useQuery<EndpointsARResponse, Error>({
    queryKey: [
      'availability-reliability-endpoints',
      mode,
      tenantIdentifier,
      reportName,
      groupName,
      granularity,
      startTime,
      endTime,
    ],
    queryFn: () => {
      if (mode === 'private' && !token) {
        throw new Error('No authentication token available')
      }
      if (!tenantIdentifier) {
        throw new Error('Tenant identifier is required')
      }
      if (!reportName) {
        throw new Error('Report name is required')
      }
      if (!groupName) {
        throw new Error('Group name is required')
      }
      return fetchEndpointsAvailabilityReliability(
        tenantIdentifier,
        reportName,
        groupName,
        granularity,
        startTime,
        endTime,
        mode,
        mode === 'private' ? token : undefined,
      )
    },
    retry: false,
    enabled:
      enabled &&
      (mode === 'private' ? !!token : true) &&
      !!tenantIdentifier &&
      !!reportName &&
      !!groupName &&
      !!startTime &&
      !!endTime,
  })
}

export const useGetEndpointAR = (
  tenantIdentifier: string,
  reportName: string,
  groupName: string,
  endpointName: string,
  granularity: ResultGranularity,
  startTime: string,
  endTime: string,
  mode: AccessMode,
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useQuery<EndpointsARResponse, Error>({
    queryKey: [
      'availability-reliability-endpoint-daily',
      mode,
      tenantIdentifier,
      reportName,
      groupName,
      endpointName,
      granularity,
      startTime,
      endTime,
    ],
    queryFn: () => {
      if (mode === 'private' && !token) {
        throw new Error('No authentication token available')
      }
      if (!tenantIdentifier) {
        throw new Error('Tenant identifier is required')
      }
      if (!reportName) {
        throw new Error('Report name is required')
      }
      if (!groupName) {
        throw new Error('Group name is required')
      }
      if (!endpointName) {
        throw new Error('Endpoint name is required')
      }
      return fetchEndpointAvailabilityReliability(
        tenantIdentifier,
        reportName,
        groupName,
        endpointName,
        granularity,
        startTime,
        endTime,
        mode,
        mode === 'private' ? token : undefined,
      )
    },
    retry: false,
    enabled:
      enabled &&
      (mode === 'private' ? !!token : true) &&
      !!tenantIdentifier &&
      !!reportName &&
      !!groupName &&
      !!endpointName &&
      !!startTime &&
      !!endTime,
  })
}
