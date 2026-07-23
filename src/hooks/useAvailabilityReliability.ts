import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/auth/useAuth'
import {
  fetchGroupsAvailabilityReliability,
  fetchGroupAvailabilityReliability,
  fetchEndpointsAvailabilityReliability,
  fetchEndpointAvailabilityReliability,
} from '@/api/availabilityReliability'
import type {
  GroupsAvailabilityReliabilityResponse,
  EndpointsARResponse,
  ResultGranularity,
} from '@/types/availabilityReliability'

export const useGetGroupsAR = (
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

export const useGetGroupAR = (
  tenantId: string,
  reportName: string,
  groupName: string,
  granularity: ResultGranularity,
  startTime: string,
  endTime: string,
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useQuery<GroupsAvailabilityReliabilityResponse, Error>({
    queryKey: [
      'availability-reliability-group-daily',
      tenantId,
      reportName,
      groupName,
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
      if (!groupName) {
        throw new Error('Group name is required')
      }
      return fetchGroupAvailabilityReliability(
        tenantId,
        reportName,
        groupName,
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
      !!groupName &&
      !!startTime &&
      !!endTime,
  })
}

export const useGetEndpointsAR = (
  tenantId: string,
  reportName: string,
  groupName: string,
  granularity: ResultGranularity,
  startTime: string,
  endTime: string,
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useQuery<EndpointsARResponse, Error>({
    queryKey: [
      'availability-reliability-endpoints',
      tenantId,
      reportName,
      groupName,
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
      if (!groupName) {
        throw new Error('Group name is required')
      }
      return fetchEndpointsAvailabilityReliability(
        tenantId,
        reportName,
        groupName,
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
      !!groupName &&
      !!startTime &&
      !!endTime,
  })
}

export const useGetEndpointAR = (
  tenantId: string,
  reportName: string,
  groupName: string,
  endpointName: string,
  granularity: ResultGranularity,
  startTime: string,
  endTime: string,
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useQuery<EndpointsARResponse, Error>({
    queryKey: [
      'availability-reliability-endpoint-daily',
      tenantId,
      reportName,
      groupName,
      endpointName,
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
      if (!groupName) {
        throw new Error('Group name is required')
      }
      if (!endpointName) {
        throw new Error('Endpoint name is required')
      }
      return fetchEndpointAvailabilityReliability(
        tenantId,
        reportName,
        groupName,
        endpointName,
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
      !!groupName &&
      !!endpointName &&
      !!startTime &&
      !!endTime,
  })
}

export const useGetPublicGroupsAR = (
  tenantName: string,
  reportName: string,
  granularity: ResultGranularity,
  startTime: string,
  endTime: string,
  enabled: boolean = true,
) => {
  return useQuery<GroupsAvailabilityReliabilityResponse, Error>({
    queryKey: [
      'public-availability-reliability-groups',
      tenantName,
      reportName,
      granularity,
      startTime,
      endTime,
    ],
    queryFn: () => {
      if (!tenantName) {
        throw new Error('Tenant name is required')
      }
      if (!reportName) {
        throw new Error('Report name is required')
      }
      return fetchGroupsAvailabilityReliability(
        tenantName,
        reportName,
        granularity,
        startTime,
        endTime,
        undefined,
      )
    },
    retry: false,
    enabled:
      enabled && !!tenantName && !!reportName && !!startTime && !!endTime,
  })
}

export const useGetPublicGroupAR = (
  tenantName: string,
  reportName: string,
  groupName: string,
  granularity: ResultGranularity,
  startTime: string,
  endTime: string,
  enabled: boolean = true,
) => {
  return useQuery<GroupsAvailabilityReliabilityResponse, Error>({
    queryKey: [
      'public-availability-reliability-group-daily',
      tenantName,
      reportName,
      groupName,
      granularity,
      startTime,
      endTime,
    ],
    queryFn: () => {
      if (!tenantName) {
        throw new Error('Tenant name is required')
      }
      if (!reportName) {
        throw new Error('Report name is required')
      }
      if (!groupName) {
        throw new Error('Group name is required')
      }
      return fetchGroupAvailabilityReliability(
        tenantName,
        reportName,
        groupName,
        granularity,
        startTime,
        endTime,
        undefined,
      )
    },
    retry: false,
    enabled:
      enabled &&
      !!tenantName &&
      !!reportName &&
      !!groupName &&
      !!startTime &&
      !!endTime,
  })
}

export const useGetPublicEndpointsAR = (
  tenantName: string,
  reportName: string,
  groupName: string,
  granularity: ResultGranularity,
  startTime: string,
  endTime: string,
  enabled: boolean = true,
) => {
  return useQuery<EndpointsARResponse, Error>({
    queryKey: [
      'public-availability-reliability-endpoints',
      tenantName,
      reportName,
      groupName,
      granularity,
      startTime,
      endTime,
    ],
    queryFn: () => {
      if (!tenantName) {
        throw new Error('Tenant name is required')
      }
      if (!reportName) {
        throw new Error('Report name is required')
      }
      if (!groupName) {
        throw new Error('Group name is required')
      }
      return fetchEndpointsAvailabilityReliability(
        tenantName,
        reportName,
        groupName,
        granularity,
        startTime,
        endTime,
        undefined,
      )
    },
    retry: false,
    enabled:
      enabled &&
      !!tenantName &&
      !!reportName &&
      !!groupName &&
      !!startTime &&
      !!endTime,
  })
}

export const useGetPublicEndpointAR = (
  tenantName: string,
  reportName: string,
  groupName: string,
  endpointName: string,
  granularity: ResultGranularity,
  startTime: string,
  endTime: string,
  enabled: boolean = true,
) => {
  return useQuery<EndpointsARResponse, Error>({
    queryKey: [
      'public-availability-reliability-endpoint-daily',
      tenantName,
      reportName,
      groupName,
      endpointName,
      granularity,
      startTime,
      endTime,
    ],
    queryFn: () => {
      if (!tenantName) {
        throw new Error('Tenant name is required')
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
        tenantName,
        reportName,
        groupName,
        endpointName,
        granularity,
        startTime,
        endTime,
        undefined,
      )
    },
    retry: false,
    enabled:
      enabled &&
      !!tenantName &&
      !!reportName &&
      !!groupName &&
      !!endpointName &&
      !!startTime &&
      !!endTime,
  })
}
