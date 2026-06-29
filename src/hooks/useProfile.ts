import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/auth/useAuth'
import { fetchUserProfile } from '@/api/profile'
import type { UserProfile } from '@/types/profile'

export const useGetUserProfile = () => {
  const { token } = useAuth()

  return useQuery<UserProfile, Error>({
    queryKey: ['user-profile'],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchUserProfile(token)
    },
    retry: false,
    enabled: !!token,
  })
}
