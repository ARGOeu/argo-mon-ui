import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { useAuth } from '@/auth/useAuth'
import { createIncident, fetchIncidents } from '@/api/incidents'
import type {
  Incident,
  IncidentRequest,
  IncidentsResponse,
} from '@/types/incidents'

export const useGetTenantIncidents = (
  tenantId: string,
  options: {
    size?: number
    date?: string
    search?: string
    enabled?: boolean
  } = {},
) => {
  const { size = 10, date, search, enabled = true } = options
  const { token } = useAuth()

  return useInfiniteQuery<IncidentsResponse, Error>({
    queryKey: ['incidents', tenantId, size, date, search],
    queryFn: ({ pageParam = 1 }) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      if (!tenantId) {
        throw new Error('Tenant ID is required')
      }
      return fetchIncidents(
        tenantId,
        token,
        pageParam as number,
        size,
        date,
        search,
      )
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

export const useCreateIncidentMutation = () => {
  const queryClient = useQueryClient()
  const { token } = useAuth()

  return useMutation<
    Incident,
    Error,
    { tenantId: string; data: IncidentRequest }
  >({
    mutationFn: ({
      tenantId,
      data,
    }: {
      tenantId: string
      data: IncidentRequest
    }) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      if (!tenantId) {
        throw new Error('Tenant ID is required')
      }
      return createIncident(tenantId, data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
    },
    onError: (error) => {
      console.error('Incident create error:', error)
    },
  })
}
