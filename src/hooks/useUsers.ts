import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/auth/useAuth'
import { registerUser } from '@/api/users'
import type { User } from '@/types/users'

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
