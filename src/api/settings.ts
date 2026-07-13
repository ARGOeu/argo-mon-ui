import type { Setting, SettingUpdateRequest } from '@/types/settings'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

export const fetchSettings = async (token: string): Promise<Setting[]> => {
  const response = await fetch(`${BACKEND_API}/v1/admin/settings`, {
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

export const fetchSettingById = async (
  id: string,
  token: string,
): Promise<Setting> => {
  const response = await fetch(`${BACKEND_API}/v1/admin/settings/${id}`, {
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

export const fetchPublicPerformanceSetting = async (): Promise<Setting> => {
  const response = await fetch(
    `${BACKEND_API}/v1/public/settings/performance`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
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

export const updateSetting = async (
  id: string,
  data: SettingUpdateRequest,
  token: string,
): Promise<Setting> => {
  const response = await fetch(`${BACKEND_API}/v1/admin/settings/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const error = new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    ) as Error & { errors?: string[] }
    error.errors = errorData.errors || []
    throw error
  }

  return response.json()
}
