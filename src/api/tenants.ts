import type { Tenant, TenantList } from '@/types/tenants'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

export const fetchTenants = async (token: string): Promise<TenantList> => {
  const response = await fetch(`${BACKEND_API}/v1/admin/tenants`, {
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
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    )
  }

  return response.json()
}
