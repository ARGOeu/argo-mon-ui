import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query'
import { useAuth } from '@/auth/useAuth'
import {
  fetchTenants,
  fetchTenantById,
  fetchCreateTenant,
  fetchUpdateTenant,
  fetchDeleteTenant,
  fetchAssignTenantProjects,
  fetchTenantProjects,
  fetchContactTypes,
} from '@/api/tenants'
import type {
  Tenant,
  TenantList,
  TenantProjectAssignment,
} from '@/types/tenants'

export const useGetTenants = (
  page: number = 1,
  size: number = 10,
  search?: string,
) => {
  const { token } = useAuth()

  return useQuery<TenantList, Error>({
    queryKey: ['tenants', page, size, search],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchTenants(token, page, size, search)
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
    refetchOnMount: 'always',
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

export const useAssignTenantProjectsMutation = () => {
  const queryClient = useQueryClient()
  const { token } = useAuth()

  return useMutation<void, Error, TenantProjectAssignment>({
    mutationFn: (data: TenantProjectAssignment) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchAssignTenantProjects(data, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tenant-projects', variables.tenant_id],
      })
      queryClient.invalidateQueries({ queryKey: ['all-projects'] })
    },
    onError: (error) => {
      console.error('Tenant project assignment error:', error)
    },
  })
}

export const useGetTenantProjects = (tenantId: string) => {
  const { token } = useAuth()

  return useInfiniteQuery<TenantList, Error>({
    queryKey: ['tenant-projects', tenantId],
    queryFn: ({ pageParam = 1 }) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchTenantProjects(tenantId, token, pageParam as number, 10)
    },
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.number_of_page
      const totalPages = lastPage.total_pages
      return currentPage < totalPages ? currentPage + 1 : undefined
    },
    initialPageParam: 1,
    retry: false,
    enabled: !!token && !!tenantId,
    refetchOnMount: 'always',
  })
}

export const useGetContactTypes = () => {
  const { token } = useAuth()

  return useQuery<string[], Error>({
    queryKey: ['contact-types'],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchContactTypes(token)
    },
    retry: false,
    enabled: !!token,
  })
}
