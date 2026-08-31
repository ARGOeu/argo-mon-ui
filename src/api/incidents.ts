import type { Incident, IncidentRequest } from '@/types/incidents'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

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
