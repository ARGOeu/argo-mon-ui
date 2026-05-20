import type {
  ApiResourcesPage,
  AssignRoleRequest,
  RevokeRoleRequest,
} from '@/types/resources'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

export const fetchApiResources = async (
  page: number = 1,
  size: number = 10,
  token: string,
): Promise<ApiResourcesPage> => {
  const response = await fetch(
    `${BACKEND_API}/api-resources?page=${page}&size=${size}`,
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

export const fetchAssignRole = async (
  data: AssignRoleRequest,
  token: string,
): Promise<void> => {
  const response = await fetch(`${BACKEND_API}/roles/assign`, {
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
}

export const fetchRevokeRole = async (
  data: RevokeRoleRequest,
  token: string,
): Promise<void> => {
  const response = await fetch(`${BACKEND_API}/roles/revoke`, {
    method: 'DELETE',
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
