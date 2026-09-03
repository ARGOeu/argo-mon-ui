import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/auth/useAuth'

import type { StatusNode, StatusResultDetails } from '@/types/statusTimeline'
import type { AccessMode } from '@/types/common'
import {
  fetchStatusTimelineAllEndpoints,
  fetchStatusTimelineEndpoints,
  fetchStatusTimelineGroup,
  fetchStatusTimelineGroupEndpoints,
  fetchStatusTimelineGroups,
  fetchStatusTimelineMetricDetails,
  fetchStatusTimelineMetrics,
  fetchStatusTimelineServiceTypes,
} from '@/api/statusTimeline'

export const useGetStatusTimelineMetricDetails = (
  tenantIdentifier: string,
  mode: AccessMode,
  report: string | undefined,
  group: string | undefined,
  serviceType: string | undefined,
  endpoint: string | undefined,
  metric: string | undefined,
  timestamp: string | undefined,
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useQuery<StatusResultDetails, Error>({
    queryKey: [
      'status-timeline-metric-details',
      mode,
      tenantIdentifier,
      report,
      group,
      serviceType,
      endpoint,
      metric,
      timestamp,
    ],
    queryFn: () => {
      if (mode === 'private' && !token) {
        throw new Error('No authentication token available')
      }
      if (!tenantIdentifier) throw new Error('Tenant identifier is required')
      return fetchStatusTimelineMetricDetails(
        tenantIdentifier,
        report,
        group,
        serviceType,
        endpoint,
        metric,
        timestamp,
        mode,
        mode === 'private' ? token : undefined,
      )
    },
    retry: false,
    staleTime: Infinity, // a past reading's details never change
    enabled:
      enabled &&
      (mode === 'private' ? !!token : true) &&
      !!tenantIdentifier &&
      !!report &&
      !!group &&
      !!serviceType &&
      !!endpoint &&
      !!metric &&
      !!timestamp,
  })
}

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

  return useQuery<StatusNode[], Error>({
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

export const useGetStatusTimelineServiceTypes = (
  tenantIdentifier: string,
  mode: AccessMode,
  report: string | undefined,
  group: string | undefined,
  startTime: string,
  endTime: string,
  enabled: boolean = true,
  refetchInterval?: number,
) => {
  const { token } = useAuth()

  return useQuery<StatusNode[], Error>({
    queryKey: [
      'status-timeline-service-types',
      mode,
      tenantIdentifier,
      report,
      group,
      startTime,
      endTime,
    ],
    queryFn: () => {
      if (mode === 'private' && !token) {
        throw new Error('No authentication token available')
      }
      if (!tenantIdentifier) throw new Error('Tenant identifier is required')
      return fetchStatusTimelineServiceTypes(
        tenantIdentifier,
        report,
        group,
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
      !!report &&
      !!group,
  })
}

export const useGetStatusTimelineEndpoints = (
  tenantIdentifier: string,
  mode: AccessMode,
  report: string | undefined,
  group: string | undefined,
  serviceType: string | undefined,
  startTime: string,
  endTime: string,
  enabled: boolean = true,
  refetchInterval?: number,
) => {
  const { token } = useAuth()

  return useQuery<StatusNode[], Error>({
    queryKey: [
      'status-timeline-endpoints',
      mode,
      tenantIdentifier,
      report,
      group,
      serviceType,
      startTime,
      endTime,
    ],
    queryFn: () => {
      if (mode === 'private' && !token) {
        throw new Error('No authentication token available')
      }
      if (!tenantIdentifier) throw new Error('Tenant identifier is required')
      return fetchStatusTimelineEndpoints(
        tenantIdentifier,
        report,
        group,
        serviceType,
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
      !!report &&
      !!group &&
      !!serviceType,
  })
}

export const useGetStatusTimelineMetrics = (
  tenantIdentifier: string,
  mode: AccessMode,
  report: string | undefined,
  group: string | undefined,
  serviceType: string | undefined,
  endpoint: string | undefined,
  startTime: string,
  endTime: string,
  enabled: boolean = true,
  refetchInterval?: number,
) => {
  const { token } = useAuth()

  return useQuery<StatusNode[], Error>({
    queryKey: [
      'status-timeline-metrics',
      mode,
      tenantIdentifier,
      report,
      group,
      serviceType,
      endpoint,
      startTime,
      endTime,
    ],
    queryFn: () => {
      if (mode === 'private' && !token) {
        throw new Error('No authentication token available')
      }
      if (!tenantIdentifier) throw new Error('Tenant identifier is required')
      return fetchStatusTimelineMetrics(
        tenantIdentifier,
        report,
        group,
        serviceType,
        endpoint,
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
      !!report &&
      !!group &&
      !!serviceType &&
      !!endpoint,
  })
}

export const useGetStatusTimelineGroup = (
  tenantIdentifier: string,
  mode: AccessMode,
  report: string | undefined,
  group: string | undefined,
  startTime: string,
  endTime: string,
  enabled: boolean = true,
  refetchInterval?: number,
) => {
  const { token } = useAuth()

  return useQuery<StatusNode[], Error>({
    queryKey: [
      'status-timeline-group',
      mode,
      tenantIdentifier,
      report,
      group,
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

      return fetchStatusTimelineGroup(
        tenantIdentifier,
        report,
        group,
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
      !!report &&
      !!group,
  })
}

export const useGetStatusTimelineGroupEndpoints = (
  tenantIdentifier: string,
  mode: AccessMode,
  report: string | undefined,
  group: string | undefined,
  startTime: string,
  endTime: string,
  enabled: boolean = true,
  refetchInterval?: number,
) => {
  const { token } = useAuth()

  return useQuery<StatusNode[], Error>({
    queryKey: [
      'status-timeline-group-endpoints',
      mode,
      tenantIdentifier,
      report,
      group,
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

      return fetchStatusTimelineGroupEndpoints(
        tenantIdentifier,
        report,
        group,
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
      !!report &&
      !!group,
  })
}

export const useGetStatusTimelineAllEndpoints = (
  tenantIdentifier: string,
  mode: AccessMode,
  report: string | undefined,
  startTime: string,
  endTime: string,
  enabled: boolean = true,
  refetchInterval?: number,
) => {
  const { token } = useAuth()

  return useQuery<StatusNode[], Error>({
    queryKey: [
      'status-timeline-all-endpoints',
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

      if (!tenantIdentifier) {
        throw new Error('Tenant identifier is required')
      }

      return fetchStatusTimelineAllEndpoints(
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
