import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/auth/useAuth'
import {
  fetchTenants,
  fetchTenantById,
  fetchCreateTenant,
  fetchUpdateTenant,
  fetchDeleteTenant,
} from '@/api/tenants'
import type { Tenant, TenantList } from '@/types/tenants'

export const useGetTenants = (page: number = 1, size: number = 10) => {
  const { token } = useAuth()

  return useQuery<TenantList, Error>({
    queryKey: ['tenants', page, size],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchTenants(token, page, size)
    },
    retry: false,
    enabled: !!token,
  })
}

export const useGetTenantById = (id: string) => {
  const { token } = useAuth()

  return useQuery<Tenant, Error>({
    queryKey: ['tenant', id],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchTenantById(id, token)
    },
    retry: false,
    enabled: !!token && !!id,
  })
}

export const useCreateTenantMutation = () => {
  const queryClient = useQueryClient()
  const { token } = useAuth()

  return useMutation<Tenant, Error, Tenant>({
    mutationFn: (data: Tenant) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchCreateTenant(data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
    },
    onError: (error) => {
      console.error('Tenant create error:', error)
    },
  })
}

export const useUpdateTenantMutation = () => {
  const queryClient = useQueryClient()
  const { token } = useAuth()

  return useMutation<Tenant, Error, { id: string; data: Tenant }>({
    mutationFn: ({ id, data }) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchUpdateTenant(id, data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
    },
    onError: (error) => {
      console.error('Tenant update error:', error)
    },
  })
}

export const useDeleteTenantMutation = () => {
  const queryClient = useQueryClient()
  const { token } = useAuth()

  return useMutation<void, Error, string>({
    mutationFn: (id: string) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchDeleteTenant(id, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
    },
    onError: (error) => {
      console.error('Tenant delete error:', error)
    },
  })
}
