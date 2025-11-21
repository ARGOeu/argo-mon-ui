import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/auth/useAuth'
import { fetchTenants, fetchCreateTenant } from '@/api/tenants'
import type { Tenant, TenantList } from '@/types/tenants'

export const useGetTenants = () => {
  const { token } = useAuth()

  return useQuery<TenantList, Error>({
    queryKey: ['tenants'],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchTenants(token)
    },
    retry: false,
    enabled: !!token,
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
