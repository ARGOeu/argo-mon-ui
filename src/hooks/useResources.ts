import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/auth/useAuth'
import {
  fetchApiResources,
  fetchAssignRole,
  fetchAssignRoleMetadata,
  fetchRevokeRole,
} from '@/api/resources'
import type {
  ApiResourcesPage,
  AssignRoleRequest,
  AssignRoleMetadata,
  RevokeRoleRequest,
} from '@/types/resources'

export const useGetApiResources = (
  page: number = 1,
  size: number = 10,
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useQuery<ApiResourcesPage, Error>({
    queryKey: ['api-resources', page, size],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchApiResources(page, size, token)
    },
    retry: false,
    enabled: enabled && !!token,
  })
}

export const useGetAssignRoleMetadata = (enabled: boolean = true) => {
  const { token } = useAuth()

  return useQuery<AssignRoleMetadata, Error>({
    queryKey: ['assign-role-metadata'],
    queryFn: () => {
      if (!token) throw new Error('No authentication token available')
      return fetchAssignRoleMetadata(token)
    },
    retry: false,
    enabled: enabled && !!token,
  })
}

export const useAssignRoleMutation = () => {
  const queryClient = useQueryClient()
  const { token } = useAuth()

  return useMutation<string, Error, AssignRoleRequest>({
    mutationFn: (data: AssignRoleRequest) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchAssignRole(data, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      if (variables.resource_id) {
        queryClient.invalidateQueries({
          queryKey: ['tenant-members', variables.resource_id],
        })
      }
    },
    onError: (error) => {
      console.error('Assign role error:', error)
    },
  })
}

export const useRevokeRoleMutation = () => {
  const queryClient = useQueryClient()
  const { token } = useAuth()

  return useMutation<void, Error, RevokeRoleRequest>({
    mutationFn: (data: RevokeRoleRequest) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchRevokeRole(data, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      queryClient.invalidateQueries({
        queryKey: ['tenant-members', variables.resource_id],
      })
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
    },
    onError: (error) => {
      console.error('Revoke role error:', error)
    },
  })
}
