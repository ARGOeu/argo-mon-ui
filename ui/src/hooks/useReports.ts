import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/auth/useAuth'
import { fetchReportsApi } from '@/api/data'
import type { DataSource, ItemDesc } from '@/types/common'

export const useReportsMutation = () => {
  const { token } = useAuth() // Get token from your auth context

  return useMutation<ItemDesc[], Error, DataSource>({
    mutationFn: (data: DataSource) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchReportsApi(data, token)
    },
    onSuccess: (data) => {
      console.log('Report API success:', data)
    },
    onError: (error) => {
      console.error('Report API error:', error)
    },
  })
}
