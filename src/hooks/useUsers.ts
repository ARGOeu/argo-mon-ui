import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuth } from '@/auth/useAuth'
import { registerUser, fetchUserPages } from '@/api/users'
import type { User } from '@/types/users'
import type { UserPages } from '@/types/pages'

export const useRegisterUserMutation = () => {
  const { token } = useAuth()

  return useMutation<User, Error, void>({
    mutationFn: () => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return registerUser(token)
    },
    onError: (error) => {
      console.error('User registration error:', error)
    },
  })
}

export const useGetUserPages = (
  page: number = 1,
  size: number = 10,
  enabled: boolean = true,
) => {
  const { token } = useAuth()

  return useQuery<UserPages, Error>({
    queryKey: ['user-pages', page, size],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return fetchUserPages(token, page, size)
    },
    retry: false,
    refetchOnMount: 'always',
    enabled: enabled && !!token,
  })
}
