import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useAuth } from '@/auth/useAuth'
import {
  createDowntime,
  deleteDowntime,
  fetchDowntime,
  fetchDowntimes,
  updateDowntime,
} from '@/api/downtimes'
import type {
  DowntimeRequest,
  DowntimeResponse,
  Downtimes,
} from '@/types/downtimes'

export const useGetTenantDowntimes = (
  tenantId: string,
  size: number = 10,
  date?: string,
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useInfiniteQuery<Downtimes, Error>({
    queryKey: ['downtimes', tenantId, size, date],
    queryFn: ({ pageParam = 1 }) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      if (!tenantId) {
        throw new Error('Tenant ID is required')
      }
      return fetchDowntimes(tenantId, token, pageParam as number, size, date)
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.number_of_page < lastPage.total_pages) {
        return lastPage.number_of_page + 1
      }
      return undefined
    },
    retry: false,
    enabled: enabled && !!token && !!tenantId,
  })
}

export const useGetDowntime = (
  tenantId: string,
  downtimeId: string,
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useQuery<DowntimeResponse, Error>({
    queryKey: ['downtime', tenantId, downtimeId],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      if (!tenantId) {
        throw new Error('Tenant ID is required')
      }
      if (!downtimeId) {
        throw new Error('Downtime ID is required')
      }
      return fetchDowntime(tenantId, downtimeId, token)
    },
    retry: false,
    enabled: enabled && !!token && !!tenantId && !!downtimeId,
  })
}

export const useCreateDowntimeMutation = () => {
  const queryClient = useQueryClient()
  const { token } = useAuth()

  return useMutation<
    DowntimeResponse,
    Error,
    { tenantId: string; data: DowntimeRequest }
  >({
    mutationFn: ({
      tenantId,
      data,
    }: {
      tenantId: string
      data: DowntimeRequest
    }) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      if (!tenantId) {
        throw new Error('Tenant ID is required')
      }
      return createDowntime(tenantId, data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['downtimes'] })
    },
    onError: (error) => {
      console.error('Downtime create error:', error)
    },
  })
}

export const useUpdateDowntimeMutation = () => {
  const queryClient = useQueryClient()
  const { token } = useAuth()

  return useMutation<
    void,
    Error,
    { tenantId: string; downtimeId: string; data: DowntimeRequest }
  >({
    mutationFn: ({
      tenantId,
      downtimeId,
      data,
    }: {
      tenantId: string
      downtimeId: string
      data: DowntimeRequest
    }) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      if (!tenantId) {
        throw new Error('Tenant ID is required')
      }
      if (!downtimeId) {
        throw new Error('Downtime ID is required')
      }
      return updateDowntime(tenantId, downtimeId, data, token)
    },
    onSuccess: (_, { tenantId, downtimeId }) => {
      queryClient.invalidateQueries({ queryKey: ['downtimes'] })
      queryClient.invalidateQueries({
        queryKey: ['downtime', tenantId, downtimeId],
      })
    },
    onError: (error) => {
      console.error('Downtime update error:', error)
    },
  })
}

export const useDeleteDowntimeMutation = () => {
  const queryClient = useQueryClient()
  const { token } = useAuth()

  return useMutation<
    DowntimeResponse,
    Error,
    { tenantId: string; downtimeId: string }
  >({
    mutationFn: ({
      tenantId,
      downtimeId,
    }: {
      tenantId: string
      downtimeId: string
    }) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      if (!tenantId) {
        throw new Error('Tenant ID is required')
      }
      if (!downtimeId) {
        throw new Error('Downtime ID is required')
      }
      return deleteDowntime(tenantId, downtimeId, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['downtimes'] })
    },
    onError: (error) => {
      console.error('Downtime delete error:', error)
    },
  })
}
