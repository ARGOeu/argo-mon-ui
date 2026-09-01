import type {
  Incident,
  IncidentActivity,
  IncidentRequest,
  IncidentsResponse,
  IncidentStatusUpdateRequest,
} from '@/types/incidents'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

export const fetchIncidents = async (
  tenantId: string,
  token: string,
  page: number = 1,
  size: number = 10,
  date?: string,
  search?: string,
): Promise<IncidentsResponse> => {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('size', String(size))
  if (date) {
    params.set('date', date)
  }
  if (search) {
    params.set('search', search)
  }

  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/incidents?${params.toString()}`,
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

export const createIncident = async (
  tenantId: string,
  data: IncidentRequest,
  token: string,
): Promise<Incident> => {
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/incidents`,
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

export const updateIncidentStatus = async (
  tenantId: string,
  incidentId: string,
  data: IncidentStatusUpdateRequest,
  token: string,
): Promise<Incident> => {
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/incidents/${incidentId}/status`,
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
    const error = new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    ) as Error & { errors?: string[] }
    error.errors = errorData.errors || []
    throw error
  }

  return response.json()
}

export const fetchIncidentActivity = async (
  tenantId: string,
  incidentId: string,
  token: string,
): Promise<IncidentActivity[]> => {
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/incidents/${incidentId}/activity`,
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

export const fetchIncident = async (
  tenantId: string,
  incidentId: string,
  token: string,
): Promise<Incident> => {
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/incidents/${incidentId}`,
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
