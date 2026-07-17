import type {
  GroupsAvailabilityReliabilityResponse,
  EndpointsARResponse,
  ResultGranularity,
} from '@/types/availabilityReliability'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

export const fetchGroupsAvailabilityReliability = async (
  tenantId: string,
  reportName: string,
  granularity: ResultGranularity,
  startTime: string,
  endTime: string,
  token: string,
): Promise<GroupsAvailabilityReliabilityResponse> => {
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/results/${encodeURIComponent(reportName)}/groups?granularity=${granularity}&start-time=${encodeURIComponent(startTime)}&end-time=${encodeURIComponent(endTime)}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const error = new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    ) as Error & { status?: number }
    error.status = response.status
    throw error
  }

  return response.json()
}

export const fetchGroupAvailabilityReliability = async (
  tenantId: string,
  reportName: string,
  groupName: string,
  granularity: ResultGranularity,
  startTime: string,
  endTime: string,
  token: string,
): Promise<GroupsAvailabilityReliabilityResponse> => {
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/results/${encodeURIComponent(reportName)}/groups/${encodeURIComponent(groupName)}?granularity=${granularity}&start-time=${encodeURIComponent(startTime)}&end-time=${encodeURIComponent(endTime)}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const error = new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    ) as Error & { status?: number }
    error.status = response.status
    throw error
  }

  return response.json()
}

export const fetchEndpointsAvailabilityReliability = async (
  tenantId: string,
  reportName: string,
  granularity: ResultGranularity,
  startTime: string,
  endTime: string,
  token: string,
): Promise<EndpointsARResponse> => {
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/results/${encodeURIComponent(reportName)}/endpoints?granularity=${granularity}&start-time=${encodeURIComponent(startTime)}&end-time=${encodeURIComponent(endTime)}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const error = new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    ) as Error & { status?: number }
    error.status = response.status
    throw error
  }

  return response.json()
}

export const fetchEndpointAvailabilityReliability = async (
  tenantId: string,
  reportName: string,
  endpointName: string,
  granularity: ResultGranularity,
  startTime: string,
  endTime: string,
  token: string,
): Promise<EndpointsARResponse> => {
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/results/${encodeURIComponent(reportName)}/endpoints/${encodeURIComponent(endpointName)}?granularity=${granularity}&start-time=${encodeURIComponent(startTime)}&end-time=${encodeURIComponent(endTime)}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const error = new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    ) as Error & { status?: number }
    error.status = response.status
    throw error
  }

  return response.json()
}
