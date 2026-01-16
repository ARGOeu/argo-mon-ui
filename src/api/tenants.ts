import type { Job, Tenant, TenantList } from '@/types/tenants'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

export const fetchTenants = async (
  token: string,
  page: number = 1,
  size: number = 10,
  search?: string,
): Promise<TenantList> => {
  const searchParam = search ? `&search=${encodeURIComponent(search)}` : ''

  const response = await fetch(
    `${BACKEND_API}/v1/admin/tenants?page=${page}&size=${size}${searchParam}`,
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

export const fetchAssignTenantProjects = async (
  data: { tenant_id: string; project_ids: string[] },
  token: string,
): Promise<void> => {
  const response = await fetch(`${BACKEND_API}/v1/admin/tenant-project`, {
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
}

export const fetchTenantProjects = async (
  tenantId: string,
  token: string,
  page: number = 1,
  size: number = 10,
): Promise<TenantList> => {
  const response = await fetch(
    `${BACKEND_API}/v1/admin/tenants/${tenantId}/projects?page=${page}&size=${size}`,
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

export const fetchContactTypes = async (token: string): Promise<string[]> => {
  const response = await fetch(`${BACKEND_API}/v1/admin/contact-types`, {
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

// Endpoints for admin and viewer roles
export const fetchUserTenants = async (
  token: string,
  page: number = 1,
  size: number = 10,
  search?: string,
): Promise<TenantList> => {
  const searchParam = search ? `&search=${encodeURIComponent(search)}` : ''

  const response = await fetch(
    `${BACKEND_API}/v1/tenants?page=${page}&size=${size}${searchParam}`,
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

export const fetchUserTenantById = async (
  id: string,
  token: string,
): Promise<Tenant> => {
  const response = await fetch(`${BACKEND_API}/v1/tenants/${id}`, {
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

export const fetchUpdateUserTenant = async (
  id: string,
  data: Tenant,
  token: string,
): Promise<Tenant> => {
  const response = await fetch(`${BACKEND_API}/v1/tenants/${id}`, {
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

export const fetchUserTenantProjects = async (
  tenantId: string,
  token: string,
  page: number = 1,
  size: number = 10,
): Promise<TenantList> => {
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/projects?page=${page}&size=${size}`,
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

export const fetchTenantStatus = async (
  id: string,
  token: string,
): Promise<{ name: string; status: { jobs: Job[] } }> => {
  const response = await fetch(`${BACKEND_API}/v1/admin/tenants/${id}/status`, {
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

export const updateTenantStatus = async (
  id: string,
  data: { jobs: Job[] },
  token: string,
): Promise<{ name: string; status: { jobs: Job[] } }> => {
  const response = await fetch(
    `${BACKEND_API}/v1/admin/tenants/${id}/manual/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
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
