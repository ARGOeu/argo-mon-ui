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

export const useGetGroupAvailabilityReliability = (
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

export const useGetEndpointsAvailabilityReliability = (
  tenantId: string,
  reportName: string,
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
      return fetchEndpointsAvailabilityReliability(
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

export const useGetEndpointAvailabilityReliability = (
  tenantId: string,
  reportName: string,
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
      if (!endpointName) {
        throw new Error('Endpoint name is required')
      }
      return fetchEndpointAvailabilityReliability(
        tenantId,
        reportName,
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
      !!endpointName &&
      !!startTime &&
      !!endTime,
  })
}
