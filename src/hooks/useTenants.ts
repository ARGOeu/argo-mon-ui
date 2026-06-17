import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query'
import { useAuth } from '@/auth/useAuth'
import {
  fetchCreateTenant,
  fetchDeleteTenant,
  fetchAssignTenantProjects,
  fetchUserTenants,
  fetchUserTenantById,
  fetchUpdateUserTenant,
  fetchUserTenantProjects,
  fetchUserTenantStatus,
  fetchUserContactTypes,
  updateTenantStatus,
  fetchMembers,
  fetchTenantMembers,
  removeMemberFromTenant,
  revokeInvitation,
  fetchTenantReports,
  fetchPublicTenantReports,
  fetchTenantReportById,
  fetchSetReportPublic,
  fetchSetReportPrivate,
  fetchTenantMetricProfile,
  fetchTenantReadiness,
  notifyAmsCheckReadiness,
  notifyAms,
  setTenantNode,
  setNodeReport,
  fetchTenantCapabilityAvailability,
  fetchTenantCapabilityStatus,
  fetchGetTopologyFeed,
  fetchUpdateTopologyFeed,
} from '@/api/tenants'
import { fetchAssignRole } from '@/api/resources'
import type {
  Job,
  Tenant,
  TenantList,
  TenantProjectAssignment,
  Member,
  PaginatedMembersResponse,
  ReportListItem,
  PublicReportItem,
  ReportDetail,
  MetricProfileResponse,
  TenantReadinessResponse,
  TopologyFeed,
  CapabilityAvailabilityResponse,
  CapabilityAvailabilityParams,
  CapabilityStatusResponse,
  CapabilityStatusParams,
} from '@/types/tenants'
import type { ProjectList } from '@/types/projects'

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
      queryClient.invalidateQueries({ queryKey: ['user-tenants'] })
      queryClient.invalidateQueries({ queryKey: ['user-tenant'] })
    },
    onError: (error) => {
      console.error('Tenant create error:', error)
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
      queryClient.invalidateQueries({ queryKey: ['user-tenants'] })
      queryClient.invalidateQueries({ queryKey: ['user-tenant'] })
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-projects'] })
    },
    onError: (error) => {
      console.error('Tenant project assignment error:', error)
    },
  })
}

export const useGetUserTenants = (
  page: number = 1,
  size: number = 10,
  search?: string,
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useQuery<TenantList, Error>({
    queryKey: ['user-tenants', page, size, search],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchUserTenants(token, page, size, search)
    },
    retry: false,
    enabled: enabled && !!token,
  })
}

export const useGetAllTenants = (enabled: boolean = true) => {
  const { token } = useAuth()

  return useInfiniteQuery<TenantList, Error>({
    queryKey: ['user-tenants', 'all'],
    queryFn: ({ pageParam = 1 }) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchUserTenants(token, pageParam as number, 10)
    },
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.number_of_page
      const totalPages = lastPage.total_pages
      return currentPage < totalPages ? currentPage + 1 : undefined
    },
    initialPageParam: 1,
    retry: false,
    enabled: enabled && !!token,
  })
}

export const useGetUserTenantById = (id: string, enabled: boolean = true) => {
  const { token } = useAuth()

  return useQuery<Tenant, Error>({
    queryKey: ['user-tenant', id],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchUserTenantById(id, token)
    },
    retry: false,
    enabled: enabled && !!token && !!id,
  })
}

export const useUpdateUserTenantMutation = () => {
  const queryClient = useQueryClient()
  const { token } = useAuth()

  return useMutation<Tenant, Error, { id: string; data: Tenant }>({
    mutationFn: ({ id, data }) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchUpdateUserTenant(id, data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-tenants'] })
      queryClient.invalidateQueries({ queryKey: ['user-tenant'] })
    },
    onError: (error) => {
      console.error('User tenant update error:', error)
    },
  })
}

export const useGetUserTenantProjects = (
  tenantId: string,
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useInfiniteQuery<ProjectList, Error>({
    queryKey: ['user-tenant-projects', tenantId],
    queryFn: ({ pageParam = 1 }) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchUserTenantProjects(tenantId, token, pageParam as number, 10)
    },
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.number_of_page
      const totalPages = lastPage.total_pages
      return currentPage < totalPages ? currentPage + 1 : undefined
    },
    initialPageParam: 1,
    retry: false,
    refetchOnMount: 'always',
    enabled: enabled && !!token && !!tenantId,
  })
}

export const useGetUserTenantStatus = (
  id: string,
  refetchInterval: number = 0,
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useQuery<{ name: string; status: { jobs: Job[] } }, Error>({
    queryKey: ['user-tenant-status', id],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchUserTenantStatus(id, token)
    },
    retry: false,
    refetchInterval,
    enabled: enabled && !!token && !!id,
  })
}

export const useGetUserContactTypes = (enabled: boolean = true) => {
  const { token } = useAuth()

  return useQuery<string[], Error>({
    queryKey: ['user-contact-types'],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchUserContactTypes(token)
    },
    retry: false,
    enabled: enabled && !!token,
  })
}

export const useUpdateTenantStatusMutation = () => {
  const queryClient = useQueryClient()
  const { token } = useAuth()

  return useMutation<
    { name: string; status: { jobs: Job[] } },
    Error,
    { id: string; data: { jobs: Job[] } }
  >({
    mutationFn: ({ id, data }) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return updateTenantStatus(id, data, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['user-tenant-status', variables.id],
      })
      queryClient.invalidateQueries({
        queryKey: ['user-tenants'],
      })
    },
    onError: (error) => {
      console.error('Tenant status update error:', error)
    },
  })
}

export const useGetMembers = (
  page?: number,
  size?: number,
  search?: string,
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useQuery<PaginatedMembersResponse, Error>({
    queryKey: ['members', page, size, search],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchMembers(token, page, size, search)
    },
    retry: false,
    enabled: enabled && !!token,
  })
}

export const useGetTenantMembers = (
  tenantId: string,
  page: number = 1,
  size: number = 10,
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useQuery<PaginatedMembersResponse, Error>({
    queryKey: ['tenant-members', tenantId, page, size],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchTenantMembers(tenantId, token, page, size)
    },
    retry: false,
    enabled: enabled && !!token && !!tenantId,
    refetchOnMount: 'always',
  })
}

export const useGetUserProfileByUsername = (
  username: string,
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useQuery<Member | undefined, Error>({
    queryKey: ['user-profile', username],
    queryFn: async () => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      const response = await fetchMembers(token, 1, 1, username)
      return response.content.length > 0 ? response.content[0] : undefined
    },
    retry: false,
    enabled: enabled && !!token && !!username,
    refetchOnMount: 'always',
  })
}

export const useAddMemberDirectly = () => {
  const queryClient = useQueryClient()
  const { token } = useAuth()

  return useMutation<
    string,
    Error,
    {
      tenantId: string
      data: {
        username: string
        email: string
        role: string
      }
    }
  >({
    mutationFn: ({ tenantId, data }) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchAssignRole(
        {
          api_resource: 'Tenant',
          resource_id: tenantId,
          role: data.role,
          username: data.username,
          extras: {
            email: data.email,
            voperson_id: data.username,
          },
        },
        token,
      )
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tenant-members', variables.tenantId],
      })
    },
    onError: (error) => {
      console.error('Add member error:', error)
    },
  })
}

export const useRemoveMemberFromTenant = () => {
  const queryClient = useQueryClient()
  const { token } = useAuth()

  return useMutation<void, Error, { tenantId: string; memberId: string }>({
    mutationFn: ({ tenantId, memberId }) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return removeMemberFromTenant(tenantId, memberId, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tenant-members', variables.tenantId],
      })
      queryClient.invalidateQueries({
        queryKey: ['members'],
      })
      queryClient.invalidateQueries({
        queryKey: ['user-profile', variables.memberId],
      })
    },
    onError: (error) => {
      console.error('Remove member error:', error)
    },
  })
}

export const useGetTenantByName = () => {
  const { token } = useAuth()

  return useMutation<TenantList | null, Error, string>({
    mutationFn: (tenantName: string) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchUserTenants(token, 1, 1, tenantName)
    },
    onError: (error) => {
      console.error('Fetch tenant by name error:', error)
    },
  })
}

export const useRevokeInvitation = () => {
  const queryClient = useQueryClient()
  const { token } = useAuth()

  return useMutation<void, Error, { tenantId: string; invitationId: string }>({
    mutationFn: ({ tenantId, invitationId }) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return revokeInvitation(tenantId, invitationId, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-invitations'] })
      queryClient.invalidateQueries({ queryKey: ['admin-invitations'] })
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] })
    },
    onError: (error) => {
      console.error('Revoke invitation error:', error)
    },
  })
}

export const useGetTenantReports = (
  tenantId: string,
  search?: string,
  isPublic?: boolean,
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useQuery<ReportListItem[], Error>({
    queryKey: ['tenant-reports', tenantId, search, isPublic],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      if (!tenantId) {
        throw new Error('Tenant ID is required')
      }
      return fetchTenantReports(tenantId, token, search, isPublic)
    },
    retry: false,
    enabled: enabled && !!token && !!tenantId,
  })
}

export const useGetPublicTenantReports = (
  tenantName: string,
  enabled: boolean = true,
) => {
  return useQuery<PublicReportItem[], Error>({
    queryKey: ['public-tenant-reports', tenantName],
    queryFn: () => {
      if (!tenantName) throw new Error('Tenant name is required')
      return fetchPublicTenantReports(tenantName)
    },
    retry: false,
    enabled: enabled && !!tenantName,
  })
}

export const useSetReportPublicMutation = () => {
  const queryClient = useQueryClient()
  const { token } = useAuth()

  return useMutation<string, Error, { tenantId: string; reportId: string }>({
    mutationFn: ({ tenantId, reportId }) => {
      if (!token) throw new Error('No authentication token available')
      if (!tenantId) throw new Error('Tenant ID is required')
      if (!reportId) throw new Error('Report ID is required')
      return fetchSetReportPublic(tenantId, reportId, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tenant-reports', variables.tenantId],
      })
    },
    onError: (error) => {
      console.error('Set report public error:', error)
    },
  })
}

export const useSetReportPrivateMutation = () => {
  const queryClient = useQueryClient()
  const { token } = useAuth()

  return useMutation<string, Error, { tenantId: string; reportId: string }>({
    mutationFn: ({ tenantId, reportId }) => {
      if (!token) throw new Error('No authentication token available')
      if (!tenantId) throw new Error('Tenant ID is required')
      if (!reportId) throw new Error('Report ID is required')
      return fetchSetReportPrivate(tenantId, reportId, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tenant-reports', variables.tenantId],
      })
    },
    onError: (error) => {
      console.error('Set report private error:', error)
    },
  })
}

export const useGetTenantReportById = (
  tenantId: string,
  reportId: string,
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useQuery<ReportDetail, Error>({
    queryKey: ['tenant-report', tenantId, reportId],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      if (!tenantId || !reportId) {
        throw new Error('Tenant ID and Report ID are required')
      }
      return fetchTenantReportById(tenantId, reportId, token)
    },
    retry: false,
    enabled: enabled && !!token && !!tenantId && !!reportId,
  })
}

export const useGetTenantMetricProfile = (
  tenantId: string,
  profileId: string,
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useQuery<MetricProfileResponse, Error>({
    queryKey: ['tenant-metric-profile', tenantId, profileId],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      if (!tenantId || !profileId) {
        throw new Error('Tenant ID and Profile ID are required')
      }
      return fetchTenantMetricProfile(tenantId, profileId, token)
    },
    retry: false,
    enabled: enabled && !!token && !!tenantId && !!profileId,
  })
}

export const useGetTenantReadiness = (
  tenantId: string,
  enabled: boolean = true,
  refetchInterval: number = 0,
) => {
  const { token } = useAuth()

  return useQuery<TenantReadinessResponse, Error>({
    queryKey: ['tenant-readiness', tenantId],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      if (!tenantId) {
        throw new Error('Tenant ID is required')
      }
      return fetchTenantReadiness(tenantId, token)
    },
    retry: false,
    enabled: enabled && !!token && !!tenantId,
    refetchInterval,
  })
}

export const useCheckReadinessMutation = () => {
  const { token } = useAuth()

  return useMutation<
    { jobs: Job[] },
    Error,
    { tenantId: string; tenantName: string }
  >({
    mutationFn: ({ tenantId, tenantName }) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return notifyAmsCheckReadiness(tenantId, tenantName, token)
    },
    onError: (error) => {
      console.error('Failed to notify AMS check readiness:', error)
    },
  })
}

export const useNotifyAmsMutation = () => {
  const queryClient = useQueryClient()
  const { token } = useAuth()

  return useMutation<
    { jobs: Job[] },
    Error,
    { tenantId: string; tenantName: string; jobName: string }
  >({
    mutationFn: ({ tenantId, tenantName, jobName }) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return notifyAms(tenantId, tenantName, jobName, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['user-tenant-status', variables.tenantId],
      })
      queryClient.invalidateQueries({
        queryKey: ['user-tenants'],
      })
    },
    onError: (error) => {
      console.error('Failed to rerun AMS job:', error)
    },
  })
}

export const useSetTenantNodeMutation = () => {
  const queryClient = useQueryClient()
  const { token } = useAuth()

  return useMutation<void, Error, { id: string; node: boolean }>({
    mutationFn: ({ id, node }) => {
      if (!token) throw new Error('No authentication token available')
      if (!id) throw new Error('Tenant ID is required')
      return setTenantNode(id, node, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-tenant', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['user-tenants'] })
      queryClient.invalidateQueries({
        queryKey: ['tenant-capability-availability', variables.id],
      })
      queryClient.invalidateQueries({
        queryKey: ['tenant-capability-status', variables.id],
      })
    },
    onError: (error) => {
      console.error('Set tenant node error:', error)
    },
  })
}

export const useSetNodeReportMutation = () => {
  const queryClient = useQueryClient()
  const { token } = useAuth()

  return useMutation<void, Error, { tenantId: string; reportId: string }>({
    mutationFn: ({ tenantId, reportId }) => {
      if (!token) throw new Error('No authentication token available')
      if (!tenantId) throw new Error('Tenant ID is required')
      if (!reportId) throw new Error('Report ID is required')
      return setNodeReport(tenantId, reportId, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tenant-reports', variables.tenantId],
      })
      queryClient.invalidateQueries({
        queryKey: ['user-tenant', variables.tenantId],
      })
      queryClient.invalidateQueries({
        queryKey: ['tenant-capability-availability', variables.tenantId],
      })
      queryClient.invalidateQueries({
        queryKey: ['tenant-capability-status', variables.tenantId],
      })
    },
    onError: (error) => {
      console.error('Set node report error:', error)
    },
  })
}

export const useGetTenantCapabilityAvailability = (
  tenantId: string,
  params: CapabilityAvailabilityParams = {},
  enabled: boolean = true,
) => {
  const { token } = useAuth()
  return useQuery<CapabilityAvailabilityResponse, Error>({
    queryKey: ['tenant-capability-availability', tenantId, params],
    queryFn: () => {
      if (!token) throw new Error('No authentication token available')
      if (!tenantId) throw new Error('Tenant ID is required')
      return fetchTenantCapabilityAvailability(tenantId, params, token)
    },
    retry: false,
    enabled: enabled && !!token && !!tenantId,
  })
}

export const useGetTenantCapabilityStatus = (
  tenantId: string,
  params: CapabilityStatusParams = {},
  enabled: boolean = true,
) => {
  const { token } = useAuth()
  return useQuery<CapabilityStatusResponse, Error>({
    queryKey: ['tenant-capability-status', tenantId, params],
    queryFn: () => {
      if (!token) throw new Error('No authentication token available')
      if (!tenantId) throw new Error('Tenant ID is required')
      return fetchTenantCapabilityStatus(tenantId, params, token)
    },
    retry: false,
    enabled: enabled && !!token && !!tenantId,
  })
}

export const useGetTopologyFeedQuery = (
  tenantId: string,
  enabled: boolean = true,
) => {
  const { token } = useAuth()
  return useQuery<TopologyFeed, Error>({
    queryKey: ['topology-feed', tenantId],
    queryFn: () => {
      if (!token) throw new Error('No authentication token available')
      if (!tenantId) throw new Error('Tenant ID is required')
      return fetchGetTopologyFeed(tenantId, token)
    },
    retry: false,
    enabled: enabled && !!token && !!tenantId,
  })
}

export const useUpdateTopologyFeedMutation = () => {
  const queryClient = useQueryClient()
  const { token } = useAuth()

  return useMutation<void, Error, { tenantId: string; data: TopologyFeed }>({
    mutationFn: ({ tenantId, data }) => {
      if (!token) throw new Error('No authentication token available')
      if (!tenantId) throw new Error('Tenant ID is required')
      return fetchUpdateTopologyFeed(tenantId, data, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['topology-feed', variables.tenantId],
      })
      queryClient.invalidateQueries({
        queryKey: ['topology-endpoints', variables.tenantId],
      })
      queryClient.invalidateQueries({
        queryKey: ['topology-groups', variables.tenantId],
      })
      queryClient.invalidateQueries({
        queryKey: ['user-tenant-status', variables.tenantId],
      })
    },
    onError: (error) => {
      console.error('Update topology feed error:', error)
    },
  })
}
