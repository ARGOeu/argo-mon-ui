import type {
  Invitation,
  PaginatedInvitationsResponse,
  CreateInvitationRequest,
  RespondToInvitationRequest,
} from '@/types/invitations'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

export const fetchAdminInvitations = async (
  token: string,
  params?: {
    search?: string
    sort?: string
    order?: 'ASC' | 'DESC'
    page?: number
    size?: number
  },
): Promise<PaginatedInvitationsResponse> => {
  const queryParams = new URLSearchParams()

  if (params?.search) queryParams.append('search', params.search)
  if (params?.sort) queryParams.append('sort', params.sort)
  if (params?.order) queryParams.append('order', params.order)
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.size) queryParams.append('size', params.size.toString())

  const url = `${BACKEND_API}/v1/admin/invitations${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`

  const response = await fetch(url, {
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

export const createTenantInvitation = async (
  tenantId: string,
  data: CreateInvitationRequest,
  token: string,
): Promise<Invitation> => {
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/invitation`,
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

export const fetchTenantInvitations = async (
  tenantId: string,
  token: string,
  params?: {
    page?: number
    size?: number
  },
): Promise<PaginatedInvitationsResponse> => {
  const queryParams = new URLSearchParams()

  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.size) queryParams.append('size', params.size.toString())

  const url = `${BACKEND_API}/v1/tenants/${tenantId}/invitations${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`

  const response = await fetch(url, {
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

export const fetchUserInvitations = async (
  token: string,
  params?: {
    page?: number
    size?: number
  },
): Promise<PaginatedInvitationsResponse> => {
  const queryParams = new URLSearchParams()

  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.size) queryParams.append('size', params.size.toString())

  const url = `${BACKEND_API}/v1/users/invitations${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`

  const response = await fetch(url, {
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

export const fetchUserInvitationById = async (
  invitationId: string,
  token: string,
): Promise<Invitation> => {
  const response = await fetch(
    `${BACKEND_API}/v1/users/invitations/${invitationId}`,
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

export const respondToInvitation = async (
  invitationId: string,
  data: RespondToInvitationRequest,
  token: string,
): Promise<Invitation> => {
  const response = await fetch(
    `${BACKEND_API}/v1/users/invitations/${invitationId}`,
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
