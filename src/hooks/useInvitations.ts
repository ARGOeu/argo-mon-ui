import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/auth/useAuth'
import {
  fetchAdminInvitations,
  createTenantInvitation,
  fetchTenantInvitations,
  fetchUserInvitations,
  fetchUserInvitationById,
  respondToInvitation,
} from '@/api/invitations'
import type {
  Invitation,
  PaginatedInvitationsResponse,
  CreateInvitationRequest,
  RespondToInvitationRequest,
} from '@/types/invitations'

export const useGetAdminInvitations = (
  enabled: boolean = true,
  params?: {
    search?: string
    sort?: string
    order?: 'ASC' | 'DESC'
    page?: number
    size?: number
  },
) => {
  const { token } = useAuth()

  return useQuery<PaginatedInvitationsResponse, Error>({
    queryKey: ['admin-invitations', params],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchAdminInvitations(token, params)
    },
    retry: false,
    enabled: enabled && !!token,
    refetchOnMount: 'always',
  })
}

export const useCreateTenantInvitation = () => {
  const queryClient = useQueryClient()
  const { token } = useAuth()

  return useMutation<
    Invitation,
    Error,
    { tenantId: string; data: CreateInvitationRequest }
  >({
    mutationFn: ({ tenantId, data }) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return createTenantInvitation(tenantId, data, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tenant-invitations', variables.tenantId],
      })
      queryClient.invalidateQueries({ queryKey: ['admin-invitations'] })
    },
    onError: (error) => {
      console.error('Create invitation error:', error)
    },
  })
}

export const useGetTenantInvitations = (
  tenantId: string,
  page: number,
  size: number,
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useQuery<PaginatedInvitationsResponse, Error>({
    queryKey: ['tenant-invitations', tenantId, page, size],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchTenantInvitations(tenantId, token, { page, size })
    },
    retry: false,
    enabled: enabled && !!token && !!tenantId,
    refetchOnMount: 'always',
  })
}

export const useGetUserInvitations = (
  enabled: boolean = true,
  params?: {
    page?: number
    size?: number
  },
  options?: {
    refetchInterval?: number
    staleTime?: number
  },
) => {
  const { token } = useAuth()

  return useQuery<PaginatedInvitationsResponse, Error>({
    queryKey: ['user-invitations', params],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchUserInvitations(token, params)
    },
    retry: false,
    enabled: enabled && !!token,
    refetchOnMount: 'always',
    ...options,
  })
}

export const useGetUserInvitationById = (
  invitationId: string,
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useQuery<Invitation, Error>({
    queryKey: ['user-invitation', invitationId],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchUserInvitationById(invitationId, token)
    },
    retry: false,
    enabled: enabled && !!token && !!invitationId,
  })
}

export const useRespondToInvitation = () => {
  const queryClient = useQueryClient()
  const { token } = useAuth()

  return useMutation<
    Invitation,
    Error,
    { invitationId: string; data: RespondToInvitationRequest }
  >({
    mutationFn: ({ invitationId, data }) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return respondToInvitation(invitationId, data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] })
      queryClient.invalidateQueries({ queryKey: ['user-invitation'] })
      queryClient.invalidateQueries({ queryKey: ['tenant-invitations'] })
      queryClient.invalidateQueries({ queryKey: ['admin-invitations'] })
      queryClient.invalidateQueries({ queryKey: ['members'] })
    },
    onError: (error) => {
      console.error('Respond to invitation error:', error)
    },
  })
}
