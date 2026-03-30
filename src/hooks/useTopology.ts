import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/auth/useAuth'
import {
  fetchTopologyEndpoints,
  fetchCreateTopologyEndpoints,
  fetchTopologyGroups,
  fetchCreateTopologyGroups,
  fetchTopologyServiceTypes,
} from '@/api/topology'
import type {
  EndpointTopologyItem,
  GroupTopologyItem,
  ServiceType,
  CreateTopologyEndpointResponse,
} from '@/types/topology'

export const useGetTopologyEndpoints = (
  tenantId: string,
  date: string = '',
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useQuery<EndpointTopologyItem[], Error>({
    queryKey: ['topology-endpoints', tenantId, date],
    queryFn: () => {
      if (!token) throw new Error('No authentication token available')
      if (!tenantId) throw new Error('Tenant ID is required')
      return fetchTopologyEndpoints(tenantId, date, token)
    },
    retry: false,
    enabled: enabled && !!token && !!tenantId,
  })
}

export const useGetTopologyServiceTypes = (
  tenantId: string,
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useQuery<ServiceType[], Error>({
    queryKey: ['topology-service-types', tenantId],
    queryFn: () => {
      if (!token) throw new Error('No authentication token available')
      if (!tenantId) throw new Error('Tenant ID is required')
      return fetchTopologyServiceTypes(tenantId, token)
    },
    retry: false,
    enabled: enabled && !!token && !!tenantId,
  })
}

export const useGetTopologyGroups = (
  tenantId: string,
  date: string = '',
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useQuery<GroupTopologyItem[], Error>({
    queryKey: ['topology-groups', tenantId, date],
    queryFn: () => {
      if (!token) throw new Error('No authentication token available')
      if (!tenantId) throw new Error('Tenant ID is required')
      return fetchTopologyGroups(tenantId, date, token)
    },
    retry: false,
    enabled: enabled && !!token && !!tenantId,
  })
}

export const useCreateTopologyGroupsMutation = () => {
  const queryClient = useQueryClient()
  const { token } = useAuth()

  return useMutation<
    CreateTopologyEndpointResponse,
    Error,
    { tenantId: string; data: GroupTopologyItem[] }
  >({
    mutationFn: ({
      tenantId,
      data,
    }: {
      tenantId: string
      data: GroupTopologyItem[]
    }) => {
      if (!token) throw new Error('No authentication token available')
      if (!tenantId) throw new Error('Tenant ID is required')
      return fetchCreateTopologyGroups(tenantId, data, token)
    },
    onSuccess: (_result, { tenantId }) => {
      queryClient.invalidateQueries({
        queryKey: ['topology-groups', tenantId],
      })
    },
    onError: (error) => {
      console.error('Topology groups create error:', error)
    },
  })
}

export const useCreateTopologyEndpointMutation = () => {
  const queryClient = useQueryClient()
  const { token } = useAuth()

  return useMutation<
    CreateTopologyEndpointResponse,
    Error,
    { tenantId: string; data: EndpointTopologyItem[] }
  >({
    mutationFn: ({
      tenantId,
      data,
    }: {
      tenantId: string
      data: EndpointTopologyItem[]
    }) => {
      if (!token) throw new Error('No authentication token available')
      if (!tenantId) throw new Error('Tenant ID is required')
      return fetchCreateTopologyEndpoints(tenantId, data, token)
    },
    onSuccess: (_result, { tenantId }) => {
      queryClient.invalidateQueries({
        queryKey: ['topology-endpoints', tenantId],
      })
    },
    onError: (error) => {
      console.error('Topology endpoint create error:', error)
    },
  })
}
