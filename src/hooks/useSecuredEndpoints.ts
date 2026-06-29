import {
  useMutation,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useAuth } from '@/auth/useAuth'
import {
  fetchSecuredEndpoints,
  assignEndpointsToRole,
  fetchAssignedEndpoints,
  fetchRoleAssignedEndpoints,
  fetchRoles,
  createRole,
  fetchRoleMetadata,
} from '@/api/securedEndpoints'
import type {
  SecuredEndpointsPage,
  AssignEndpointsRequest,
  RoleAssignmentsResponse,
  RoleEndpointAssignmentResponse,
  Role,
  RolesPage,
  CreateRoleRequest,
  RoleMetadata,
} from '@/types/securedEndpoints'

export const useGetSecuredEndpoints = (
  size: number = 100,
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useInfiniteQuery<SecuredEndpointsPage, Error>({
    queryKey: ['secured-endpoints', size],
    queryFn: ({ pageParam = 1 }) => {
      if (!token) throw new Error('No authentication token available')
      return fetchSecuredEndpoints(pageParam as number, size, token)
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.number_of_page < lastPage.total_pages) {
        return lastPage.number_of_page + 1
      }
      return undefined
    },
    retry: false,
    enabled: enabled && !!token,
  })
}

export const useAssignEndpointsToRoleMutation = () => {
  const queryClient = useQueryClient()
  const { token } = useAuth()

  return useMutation<
    RoleEndpointAssignmentResponse,
    Error,
    { roleId: string; data: AssignEndpointsRequest }
  >({
    mutationFn: ({ roleId, data }) => {
      if (!token) throw new Error('No authentication token available')
      return assignEndpointsToRole(roleId, data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-assigned-endpoints'] })
      queryClient.invalidateQueries({ queryKey: ['assigned-endpoints'] })
    },
    onError: (error) => {
      console.error('Assign endpoints to role error:', error)
    },
  })
}

export const useGetAssignedEndpoints = (enabled: boolean = true) => {
  const { token } = useAuth()

  return useQuery<RoleAssignmentsResponse, Error>({
    queryKey: ['assigned-endpoints'],
    queryFn: () => {
      if (!token) throw new Error('No authentication token available')
      return fetchAssignedEndpoints(token)
    },
    retry: false,
    enabled: enabled && !!token,
  })
}

export const useGetRoleAssignedEndpoints = (
  roleId: string | null | undefined,
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useQuery<RoleAssignmentsResponse, Error>({
    queryKey: ['role-assigned-endpoints', roleId],
    queryFn: () => {
      if (!token) throw new Error('No authentication token available')
      if (!roleId) throw new Error('Role ID is required')
      return fetchRoleAssignedEndpoints(roleId, token)
    },
    retry: false,
    enabled: enabled && !!token && !!roleId,
  })
}

export const useGetRoles = (
  page: number = 1,
  size: number = 10,
  enabled: boolean = true,
) => {
  const { token } = useAuth()
  return useQuery<RolesPage, Error>({
    queryKey: ['roles', page, size],
    queryFn: () => {
      if (!token) throw new Error('No authentication token available')
      return fetchRoles(page, size, token)
    },
    retry: false,
    enabled: enabled && !!token,
  })
}

export const useGetRoleMetadata = (enabled: boolean = true) => {
  const { token } = useAuth()

  return useQuery<RoleMetadata, Error>({
    queryKey: ['role-metadata'],
    queryFn: () => {
      if (!token) throw new Error('No authentication token available')
      return fetchRoleMetadata(token)
    },
    retry: false,
    enabled: enabled && !!token,
  })
}

export const useCreateRoleMutation = () => {
  const queryClient = useQueryClient()
  const { token } = useAuth()

  return useMutation<Role, Error, CreateRoleRequest>({
    mutationFn: (data: CreateRoleRequest) => {
      if (!token) throw new Error('No authentication token available')
      return createRole(data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
    onError: (error) => {
      console.error('Create role error:', error)
    },
  })
}
