import type {
  GroupsAvailabilityReliabilityResponse,
  EndpointsARResponse,
  ResultGranularity,
} from '@/types/availabilityReliability'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

export const fetchGroupsAvailabilityReliability = async (
  tenantIdentifier: string,
  reportName: string,
  granularity: ResultGranularity,
  startTime: string,
  endTime: string,
  token: string | undefined,
): Promise<GroupsAvailabilityReliabilityResponse> => {
  const base = token
    ? `${BACKEND_API}/v1/tenants/${tenantIdentifier}`
    : `${BACKEND_API}/v1/public/tenants/${tenantIdentifier}`

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(
    `${base}/results/${encodeURIComponent(reportName)}/groups?granularity=${granularity}&start-time=${encodeURIComponent(startTime)}&end-time=${encodeURIComponent(endTime)}`,
    { headers },
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
  tenantIdentifier: string,
  reportName: string,
  groupName: string,
  granularity: ResultGranularity,
  startTime: string,
  endTime: string,
  token: string | undefined,
): Promise<GroupsAvailabilityReliabilityResponse> => {
  const base = token
    ? `${BACKEND_API}/v1/tenants/${tenantIdentifier}`
    : `${BACKEND_API}/v1/public/tenants/${tenantIdentifier}`

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(
    `${base}/results/${encodeURIComponent(reportName)}/groups/${encodeURIComponent(groupName)}?granularity=${granularity}&start-time=${encodeURIComponent(startTime)}&end-time=${encodeURIComponent(endTime)}`,
    { headers },
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
  tenantIdentifier: string,
  reportName: string,
  groupName: string,
  granularity: ResultGranularity,
  startTime: string,
  endTime: string,
  token: string | undefined,
): Promise<EndpointsARResponse> => {
  const base = token
    ? `${BACKEND_API}/v1/tenants/${tenantIdentifier}`
    : `${BACKEND_API}/v1/public/tenants/${tenantIdentifier}`

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(
    `${base}/results/${encodeURIComponent(reportName)}/groups/${encodeURIComponent(groupName)}/endpoints?granularity=${granularity}&start-time=${encodeURIComponent(startTime)}&end-time=${encodeURIComponent(endTime)}`,
    { headers },
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
  tenantIdentifier: string,
  reportName: string,
  groupName: string,
  endpointName: string,
  granularity: ResultGranularity,
  startTime: string,
  endTime: string,
  token: string | undefined,
): Promise<EndpointsARResponse> => {
  const base = token
    ? `${BACKEND_API}/v1/tenants/${tenantIdentifier}`
    : `${BACKEND_API}/v1/public/tenants/${tenantIdentifier}`

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(
    `${base}/results/${encodeURIComponent(reportName)}/groups/${encodeURIComponent(groupName)}/endpoints/${encodeURIComponent(endpointName)}?granularity=${granularity}&start-time=${encodeURIComponent(startTime)}&end-time=${encodeURIComponent(endTime)}`,
    { headers },
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
