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
  tenantId: string,
  token: string,
  report?: string,
  item?: string,
  period?: string,
): Promise<GroupResultsResponse> => {
  const params = new URLSearchParams()
  if (report) params.set('report', report)
  if (period) params.set('period', period)

  const query = params.toString()
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/results/groups${item ? `/${item}` : ''}${query ? `?${query}` : ''}`,
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

export const fetchStatusGroups = async (
  tenantId: string,
  report: string,
  token: string,
  item?: string,
): Promise<GroupStatusResponse> => {
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/status/groups${
      item ? `/${item}` : ''
    }?report=${report}`,
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
