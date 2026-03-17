import type {
  EndpointTopologyItem,
  ServiceType,
  CreateTopologyEndpointResponse,
} from '@/types/topology'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

export const fetchTopologyEndpoints = async (
  tenantId: string,
  date: string,
  token: string,
): Promise<EndpointTopologyItem[]> => {
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/topology/endpoints${date ? `?date=${date}` : ''}`,
    {
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

export const fetchCreateTopologyEndpoints = async (
  tenantId: string,
  data: EndpointTopologyItem[],
  token: string,
): Promise<CreateTopologyEndpointResponse> => {
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/topology/endpoints`,
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
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    )
  }

  return response.json()
}

export const fetchTopologyServiceTypes = async (
  tenantId: string,
  token: string,
): Promise<ServiceType[]> => {
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/topology/service-types`,
    {
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
