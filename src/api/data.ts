import type { AccessMode, StatusItemType } from '@/types/common'
import type {
  GroupDetailResponse,
  GroupEndpointsResponse,
  GroupResultsResponse,
  GroupStatusResponse,
} from '@/types/data'

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
  report: string | undefined,
  item: string | undefined,
  period: string | undefined,
  mode: AccessMode,
  token: string | undefined,
): Promise<GroupResultsResponse> => {
  if (mode === 'private' && !token) {
    throw new Error('Access token is required for private mode requests')
  }

  const params = new URLSearchParams()
  if (report) params.set('report', report)
  if (period) params.set('period', period)

  const query = params.toString()
  const base =
    mode === 'private'
      ? `${BACKEND_API}/v1/tenants/${tenantIdentifier}/results/groups`
      : `${BACKEND_API}/v1/public/tenants/${tenantIdentifier}/results/groups`

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (mode === 'private') {
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
  item: string | undefined,
  mode: AccessMode,
  token: string | undefined,
): Promise<GroupStatusResponse> => {
  if (mode === 'private' && !token) {
    throw new Error('Access token is required for private mode requests')
  }

  const base =
    mode === 'private'
      ? `${BACKEND_API}/v1/tenants/${tenantIdentifier}/status/groups`
      : `${BACKEND_API}/v1/public/tenants/${tenantIdentifier}/status/groups`

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (mode === 'private') {
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

const buildGroupResultsUrl = (
  tenantIdentifier: string,
  report: string,
  groupName: string,
  suffix: '' | '/endpoints',
  startTime: string,
  endTime: string,
  granularity: string,
  mode: AccessMode,
) => {
  const base =
    mode === 'private'
      ? `${BACKEND_API}/v1/tenants/${tenantIdentifier}/results`
      : `${BACKEND_API}/v1/public/tenants/${tenantIdentifier}/results`

  const params = new URLSearchParams({
    'start-time': startTime,
    'end-time': endTime,
  })
  if (granularity) params.set('granularity', granularity)

  return (
    `${base}/${encodeURIComponent(report)}` +
    `/groups/${encodeURIComponent(groupName)}${suffix}?${params.toString()}`
  )
}

const requestGroupResults = async <T>(
  url: string,
  mode: AccessMode,
  token: string | undefined,
): Promise<T> => {
  if (mode === 'private' && !token) {
    throw new Error('Access token is required for private mode requests')
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (mode === 'private') {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, { headers })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    )
  }

  return response.json()
}

export const fetchResultsGroupDetails = async (
  tenantIdentifier: string,
  report: string,
  groupName: string,
  startTime: string,
  endTime: string,
  granularity: string,
  mode: AccessMode,
  token: string | undefined,
): Promise<GroupDetailResponse> =>
  requestGroupResults<GroupDetailResponse>(
    buildGroupResultsUrl(
      tenantIdentifier,
      report,
      groupName,
      '',
      startTime,
      endTime,
      granularity,
      mode,
    ),
    mode,
    token,
  )

export const fetchResultsGroupEndpoints = async (
  tenantIdentifier: string,
  report: string,
  groupName: string,
  startTime: string,
  endTime: string,
  granularity: string,
  mode: AccessMode,
  token: string | undefined,
): Promise<GroupEndpointsResponse> =>
  requestGroupResults<GroupEndpointsResponse>(
    buildGroupResultsUrl(
      tenantIdentifier,
      report,
      groupName,
      '/endpoints',
      startTime,
      endTime,
      granularity,
      mode,
    ),
    mode,
    token,
  )
