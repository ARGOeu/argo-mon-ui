import type { StatusItemType } from '@/types/common'
import type { GroupResultsResponse, GroupStatusResponse } from '@/types/data'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

export const fetchGroupsApi = async (
  tenantId: string,
  reportId: string,
  token: string,
): Promise<StatusItemType[]> => {
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/reports/${reportId}/groups`,
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

export const fetchResultsGroups = async (
  tenantIdentifier: string,
  token: string | undefined,
  report?: string,
  item?: string,
  period?: string,
): Promise<GroupResultsResponse> => {
  const params = new URLSearchParams()
  if (report) params.set('report', report)
  if (period) params.set('period', period)

  const query = params.toString()
  const base = token
    ? `${BACKEND_API}/v1/tenants/${tenantIdentifier}/results/groups`
    : `${BACKEND_API}/v1/public/tenants/${tenantIdentifier}/results/groups`

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(
    `${base}${item ? `/${item}` : ''}${query ? `?${query}` : ''}`,
    { headers },
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    )
  }

  return response.json()
}

export const fetchStatusGroups = async (
  tenantIdentifier: string,
  report: string,
  token: string | undefined,
  item?: string,
): Promise<GroupStatusResponse> => {
  const base = token
    ? `${BACKEND_API}/v1/tenants/${tenantIdentifier}/status/groups`
    : `${BACKEND_API}/v1/public/tenants/${tenantIdentifier}/status/groups`

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(
    `${base}${item ? `/${item}` : ''}?report=${report}`,
    { headers },
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    )
  }

  return response.json()
}
