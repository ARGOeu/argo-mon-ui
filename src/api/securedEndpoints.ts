import type {
  SecuredEndpointsPage,
  AssignEndpointsRequest,
  RoleAssignmentsResponse,
  RoleEndpointAssignmentResponse,
  Role,
  RolesPage,
  CreateRoleRequest,
} from '@/types/securedEndpoints'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

export const fetchSecuredEndpoints = async (
  page: number = 1,
  size: number = 10,
  token: string,
): Promise<SecuredEndpointsPage> => {
  const response = await fetch(
    `${BACKEND_API}/secured-endpoints?page=${page}&size=${size}`,
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

export const assignEndpointsToRole = async (
  roleId: string,
  data: AssignEndpointsRequest,
  token: string,
): Promise<RoleEndpointAssignmentResponse> => {
  const response = await fetch(
    `${BACKEND_API}/roles/${roleId}/assign-endpoints`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    },
  )

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

export const fetchAssignedEndpoints = async (
  token: string,
): Promise<RoleAssignmentsResponse> => {
  const response = await fetch(`${BACKEND_API}/roles/assigned-endpoints`, {
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

export const fetchRoleAssignedEndpoints = async (
  roleId: string,
  token: string,
): Promise<RoleAssignmentsResponse> => {
  const response = await fetch(
    `${BACKEND_API}/roles/${roleId}/assigned-endpoints`,
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

export const fetchRoles = async (
  page: number = 1,
  size: number = 10,
  token: string,
): Promise<RolesPage> => {
  const response = await fetch(
    `${BACKEND_API}/roles?page=${page}&size=${size}`,
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

export const createRole = async (
  data: CreateRoleRequest,
  token: string,
): Promise<Role> => {
  const response = await fetch(`${BACKEND_API}/roles`, {
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
