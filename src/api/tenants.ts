import type { Tenant, TenantList } from '@/types/tenants'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

export const fetchTenants = async (
  token: string,
  page: number = 1,
  size: number = 10,
): Promise<TenantList> => {
  const response = await fetch(
    `${BACKEND_API}/v1/admin/tenants?page=${page}&size=${size}`,
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

export const fetchTenantById = async (
  id: string,
  token: string,
): Promise<Tenant> => {
  const response = await fetch(`${BACKEND_API}/v1/admin/tenants/${id}`, {
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

export const fetchCreateTenant = async (
  data: Tenant,
  token: string,
): Promise<Tenant> => {
  const response = await fetch(`${BACKEND_API}/v1/admin/tenants`, {
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

export const fetchUpdateTenant = async (
  id: string,
  data: Tenant,
  token: string,
): Promise<Tenant> => {
  const response = await fetch(`${BACKEND_API}/v1/admin/tenants/${id}`, {
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

export const fetchDeleteTenant = async (
  id: string,
  token: string,
): Promise<void> => {
  const response = await fetch(`${BACKEND_API}/v1/admin/tenants/${id}`, {
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
}
