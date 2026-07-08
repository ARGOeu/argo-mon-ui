import type { User } from '@/types/users'
import type { UserPages } from '@/types/pages'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

export const registerUser = async (token: string): Promise<User> => {
  const response = await fetch(`${BACKEND_API}/users/registration`, {
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

export const fetchUserPages = async (
  token: string,
  page: number = 1,
  size: number = 10,
): Promise<UserPages> => {
  const response = await fetch(
    `${BACKEND_API}/v1/users/pages?page=${page}&size=${size}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    )
  }

  return response.json()
}
