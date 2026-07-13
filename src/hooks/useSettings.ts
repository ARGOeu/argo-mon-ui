import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/auth/useAuth'
import {
  fetchSettings,
  fetchSettingById,
  fetchPublicPerformanceSetting,
  updateSetting,
} from '@/api/settings'
import type { Setting, SettingUpdateRequest } from '@/types/settings'

export const useGetSettings = (enabled: boolean = true) => {
  const { token } = useAuth()

  return useQuery<Setting[], Error>({
    queryKey: ['settings'],
    queryFn: () => {
      if (!token) throw new Error('No authentication token available')
      return fetchSettings(token)
    },
    retry: false,
    enabled: enabled && !!token,
  })
}

export const useGetSettingById = (id: string, enabled: boolean = true) => {
  const { token } = useAuth()

  return useQuery<Setting, Error>({
    queryKey: ['setting', id],
    queryFn: () => {
      if (!token) throw new Error('No authentication token available')
      if (!id) throw new Error('Setting ID is required')
      return fetchSettingById(id, token)
    },
    retry: false,
    enabled: enabled && !!token && !!id,
  })
}

export const useUpdateSettingMutation = () => {
  const queryClient = useQueryClient()
  const { token } = useAuth()

  return useMutation<
    Setting,
    Error,
    { id: string; payload: SettingUpdateRequest }
  >({
    mutationFn: ({ id, payload }) => {
      if (!token) throw new Error('No authentication token available')
      if (!id) throw new Error('Setting ID is required')
      return updateSetting(id, payload, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      queryClient.invalidateQueries({ queryKey: ['setting', variables.id] })
    },
    onError: (error) => {
      console.error('Setting update error:', error)
    },
  })
}

export const useGetPerformanceSettings = () => {
  return useQuery<Setting, Error>({
    queryKey: ['public-performance-setting'],
    queryFn: () => {
      return fetchPublicPerformanceSetting()
    },
    retry: false,
  })
}
