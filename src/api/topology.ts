import type {
  EndpointTopologyItem,
  GroupTopologyItem,
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
  force: boolean = true,
): Promise<CreateTopologyEndpointResponse> => {
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/topology/endpoints?force=${force}`,
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

export const fetchTopologyGroups = async (
  tenantId: string,
  date: string,
  token: string,
): Promise<GroupTopologyItem[]> => {
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/topology/groups${date ? `?date=${date}` : ''}`,
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

export const fetchCreateTopologyGroups = async (
  tenantId: string,
  data: GroupTopologyItem[],
  token: string,
  force: boolean = true,
): Promise<CreateTopologyEndpointResponse> => {
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/topology/groups?force=${force}`,
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
