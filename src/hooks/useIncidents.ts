import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/auth/useAuth'
import { createIncident } from '@/api/incidents'
import type { Incident, IncidentRequest } from '@/types/incidents'

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
