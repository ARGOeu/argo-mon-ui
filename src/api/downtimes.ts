import type {
  DowntimeRequest,
  Downtime,
  DowntimesResponse,
} from '@/types/downtimes'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

export const fetchDowntimes = async (
  tenantId: string,
  token: string,
  page: number = 1,
  size: number = 10,
  date?: string,
): Promise<DowntimesResponse> => {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('size', String(size))
  if (date) {
    params.set('date', date)
  }

  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/downtimes?${params.toString()}`,
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

export const fetchDowntime = async (
  tenantId: string,
  downtimeId: string,
  token: string,
): Promise<Downtime> => {
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/downtimes/${downtimeId}`,
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

export const createDowntime = async (
  tenantId: string,
  data: DowntimeRequest,
  token: string,
): Promise<Downtime> => {
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/downtimes`,
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

export const updateDowntime = async (
  tenantId: string,
  downtimeId: string,
  data: DowntimeRequest,
  token: string,
): Promise<void> => {
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/downtimes/${downtimeId}`,
    {
      method: 'PUT',
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
}

export const deleteDowntime = async (
  tenantId: string,
  downtimeId: string,
  token: string,
): Promise<Downtime> => {
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/downtimes/${downtimeId}`,
    {
      method: 'DELETE',
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
