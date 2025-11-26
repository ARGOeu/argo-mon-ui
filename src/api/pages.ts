import type { Page, PageContent } from '@/types/pages'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

export const fetchSavePage = async (
  data: PageContent,
  token: string,
): Promise<PageContent> => {
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
    const error = new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    ) as Error & { errors?: string[] }
    error.errors = errorData.errors || []
    throw error
  }

  return response.json()
}

export const fetchUpdatePage = async (
  id: string,
  data: PageContent,
  token: string,
): Promise<PageContent> => {
  const response = await fetch(`${BACKEND_API}/v1/pages/${id}`, {
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

export const fetchPage = async (
  id: string,
  token: string,
): Promise<PageContent> => {
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

export const fetchPages = async (
  token: string,
  page: number = 1,
  size: number = 10,
): Promise<Page> => {
  const response = await fetch(
    `${BACKEND_API}/v1/pages?page=${page}&size=${size}`,
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

export const fetchDeletePage = async (
  id: string,
  token: string,
): Promise<string> => {
  const response = await fetch(`${BACKEND_API}/v1/pages/${id}`, {
    method: 'DELETE',
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
