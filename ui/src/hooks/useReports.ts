import { useMutation } from '@tanstack/react-query'
import { useAuth } from '../auth/useAuth'
import { fetchReportsApi } from '../api/data'

type ApiData = {
  api: string
  secret: string
}

type Report = {
  name: string
  description: string
}

export const useReportsMutation = () => {
  const { token } = useAuth() // Get token from your auth context

  return useMutation<Report[], Error, ApiData>({
    mutationFn: (data: ApiData) => {
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
