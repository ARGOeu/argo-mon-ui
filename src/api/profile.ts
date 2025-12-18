import type { UserProfile } from '@/types/profile'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

export const fetchUserProfile = async (token: string): Promise<UserProfile> => {
  const response = await fetch(`${BACKEND_API}/v1/users/profile`, {
    method: 'GET',
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
