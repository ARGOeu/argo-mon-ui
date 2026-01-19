import type { User } from '@/types/users'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

export const registerUser = async (token: string): Promise<User> => {
  const response = await fetch(`${BACKEND_API}/v1/users/registration`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    )
  }

  return response.json()
}
