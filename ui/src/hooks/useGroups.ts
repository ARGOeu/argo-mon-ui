import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/auth/useAuth'
import { fetchGroupsApi } from '@/api/data'
import type { DataSourceReport, StatusItemType } from '@/types/common'


export const useGroupsMutation = () => {
  const { token } = useAuth() // Get token from your auth context

  return useMutation<StatusItemType[], Error, DataSourceReport>({
    mutationFn: (data: DataSourceReport) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchGroupsApi(data, token)
    },
    onSuccess: (data) => {
      console.log('Retrieve Page success:', data)
    },
    onError: (error) => {
      console.error('Retrieve Page error:', error)
    },
  })
}
