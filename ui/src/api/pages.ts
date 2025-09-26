import type { Page } from '@/types/pages'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

export const fetchSavePage = async (
  data: Page,
  token: string,
): Promise<Page> => {
  const response = await fetch(`${BACKEND_API}/v1/pages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    )
  }

  return response.json()
}

export const fetchPage = async (id: string, token: string): Promise<Page> => {
  const response = await fetch(`${BACKEND_API}/v1/pages/${id}`, {
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

export const fetchPages = async (token: string): Promise<Page[]> => {
  const response = await fetch(`${BACKEND_API}/v1/pages`, {
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
