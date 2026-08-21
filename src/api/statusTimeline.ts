import type { AccessMode } from '@/types/common'
import type { StatusNode, StatusTimelineResponse } from '@/types/statusTimeline'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

// fetch status timelines for top level groups
export const fetchStatusTimelineGroups = async (
  tenantIdentifier: string,
  report: string | undefined,
  startTime: string,
  endTime: string,
  mode: AccessMode,
  token: string | undefined,
): Promise<StatusNode[]> => {
  if (mode === 'private' && !token) {
    throw new Error('Access token is required for private mode requests')
  }
  if (!tenantIdentifier) {
    throw new Error('Tenant identifier is required')
  }
  if (!report) {
    throw new Error('A report name is required for status timeline requests')
  }
  if (!startTime || !endTime) {
    throw new Error('Both start-time and end-time are required')
  }

  const params = new URLSearchParams()
  params.set('start-time', startTime)
  params.set('end-time', endTime)

  const root =
    mode === 'private'
      ? `${BACKEND_API}/v1/tenants`
      : `${BACKEND_API}/v1/public/tenants`

  const url = `${root}/${encodeURIComponent(tenantIdentifier)}/status/${encodeURIComponent(
    report,
  )}/groups?${params.toString()}`

  const headers: Record<string, string> = { Accept: 'application/json' }
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

  const data: StatusTimelineResponse = await response.json()
  return (data?.groups ?? []).map((g) => ({
    name: g.name,
    type: g.type,
    statuses: g.statuses ?? [],
  }))
}

// fetch status timelines for service-types (under groups)
export const fetchStatusTimelineServiceTypes = async (
  tenantIdentifier: string,
  report: string | undefined,
  group: string | undefined,
  startTime: string,
  endTime: string,
  mode: AccessMode,
  token: string | undefined,
): Promise<StatusNode[]> => {
  if (mode === 'private' && !token) {
    throw new Error('Access token is required for private mode requests')
  }
  if (!tenantIdentifier) {
    throw new Error('Tenant identifier is required')
  }
  if (!report) {
    throw new Error('A report name is required for status timeline requests')
  }
  if (!group) {
    throw new Error('A group name is required')
  }
  if (!startTime || !endTime) {
    throw new Error('Both start-time and end-time are required')
  }

  const params = new URLSearchParams()
  params.set('start-time', startTime)
  params.set('end-time', endTime)

  const root =
    mode === 'private'
      ? `${BACKEND_API}/v1/tenants`
      : `${BACKEND_API}/v1/public/tenants`

  const url = `${root}/${encodeURIComponent(tenantIdentifier)}/status/${encodeURIComponent(
    report,
  )}/groups/${encodeURIComponent(group)}/service-types?${params.toString()}`

  const headers: Record<string, string> = { Accept: 'application/json' }
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

  const data: StatusTimelineResponse = await response.json()
  return (data?.groups ?? [])
    .flatMap((g) => g['service-types'] ?? [])
    .map((st) => ({
      name: st.name,
      type: st.type,
      statuses: st.statuses ?? [],
    }))
}

// fetch status timelines for endpoints (under groups/service-types)
export const fetchStatusTimelineEndpoints = async (
  tenantIdentifier: string,
  report: string | undefined,
  group: string | undefined,
  serviceType: string | undefined,
  startTime: string,
  endTime: string,
  mode: AccessMode,
  token: string | undefined,
): Promise<StatusNode[]> => {
  if (mode === 'private' && !token) {
    throw new Error('Access token is required for private mode requests')
  }
  if (!tenantIdentifier) {
    throw new Error('Tenant identifier is required')
  }
  if (!report) {
    throw new Error('A report name is required for status timeline requests')
  }
  if (!group) {
    throw new Error('A group name is required')
  }
  if (!serviceType) {
    throw new Error('A service type name is required')
  }
  if (!startTime || !endTime) {
    throw new Error('Both start-time and end-time are required')
  }

  const params = new URLSearchParams()
  params.set('start-time', startTime)
  params.set('end-time', endTime)

  const root =
    mode === 'private'
      ? `${BACKEND_API}/v1/tenants`
      : `${BACKEND_API}/v1/public/tenants`

  const url = `${root}/${encodeURIComponent(tenantIdentifier)}/status/${encodeURIComponent(
    report,
  )}/groups/${encodeURIComponent(group)}/service-types/${encodeURIComponent(
    serviceType,
  )}/endpoints?${params.toString()}`

  const headers: Record<string, string> = { Accept: 'application/json' }
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

  const data: StatusTimelineResponse = await response.json()
  return (data?.groups ?? [])
    .flatMap((g) => g['service-types'] ?? [])
    .flatMap((st) => st.endpoints ?? [])
    .map((e) => ({ name: e.name, statuses: e.statuses ?? [] }))
}

// fetch status timelines for metrics (lowest level under groups/service-types/endpoints)
export const fetchStatusTimelineMetrics = async (
  tenantIdentifier: string,
  report: string | undefined,
  group: string | undefined,
  serviceType: string | undefined,
  endpoint: string | undefined,
  startTime: string,
  endTime: string,
  mode: AccessMode,
  token: string | undefined,
): Promise<StatusNode[]> => {
  if (mode === 'private' && !token) {
    throw new Error('Access token is required for private mode requests')
  }
  if (!tenantIdentifier) {
    throw new Error('Tenant identifier is required')
  }
  if (!report) {
    throw new Error('A report name is required for status timeline requests')
  }
  if (!group) {
    throw new Error('A group name is required')
  }
  if (!serviceType) {
    throw new Error('A service type name is required')
  }
  if (!endpoint) {
    throw new Error('An endpoint name is required')
  }
  if (!startTime || !endTime) {
    throw new Error('Both start-time and end-time are required')
  }

  const params = new URLSearchParams()
  params.set('start-time', startTime)
  params.set('end-time', endTime)

  const root =
    mode === 'private'
      ? `${BACKEND_API}/v1/tenants`
      : `${BACKEND_API}/v1/public/tenants`

  const url = `${root}/${encodeURIComponent(tenantIdentifier)}/status/${encodeURIComponent(
    report,
  )}/groups/${encodeURIComponent(group)}/service-types/${encodeURIComponent(
    serviceType,
  )}/endpoints/${encodeURIComponent(endpoint)}/metrics?${params.toString()}`

  const headers: Record<string, string> = { Accept: 'application/json' }
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

  const data: StatusTimelineResponse = await response.json()
  return (data?.groups ?? [])
    .flatMap((g) => g['service-types'] ?? [])
    .flatMap((st) => st.endpoints ?? [])
    .flatMap((e) => e.metrics ?? [])
    .map((m) => ({ name: m.name, statuses: m.statuses ?? [] }))
}

export const fetchStatusTimelineGroup = async (
  tenantIdentifier: string,
  report: string | undefined,
  group: string | undefined,
  startTime: string,
  endTime: string,
  mode: AccessMode,
  token: string | undefined,
): Promise<StatusNode[]> => {
  if (mode === 'private' && !token) {
    throw new Error('Access token is required for private mode requests')
  }
  if (!tenantIdentifier) {
    throw new Error('Tenant identifier is required')
  }
  if (!report) {
    throw new Error('A report name is required for status timeline requests')
  }
  if (!group) {
    throw new Error('A group name is required')
  }
  if (!startTime || !endTime) {
    throw new Error('Both start-time and end-time are required')
  }

  const params = new URLSearchParams()
  params.set('start-time', startTime)
  params.set('end-time', endTime)

  const root =
    mode === 'private'
      ? `${BACKEND_API}/v1/tenants`
      : `${BACKEND_API}/v1/public/tenants`

  const url = `${root}/${encodeURIComponent(
    tenantIdentifier,
  )}/status/${encodeURIComponent(
    report,
  )}/groups/${encodeURIComponent(group)}?${params.toString()}`

  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

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

  const data: StatusTimelineResponse = await response.json()

  return (data?.groups ?? []).map((g) => ({
    name: g.name,
    type: g.type,
    statuses: g.statuses ?? [],
  }))
}

// fetch status timelines for endpoints directly under a group
export const fetchStatusTimelineGroupEndpoints = async (
  tenantIdentifier: string,
  report: string | undefined,
  group: string | undefined,
  startTime: string,
  endTime: string,
  mode: AccessMode,
  token: string | undefined,
): Promise<StatusNode[]> => {
  if (mode === 'private' && !token) {
    throw new Error('Access token is required for private mode requests')
  }
  if (!tenantIdentifier) {
    throw new Error('Tenant identifier is required')
  }
  if (!report) {
    throw new Error('A report name is required for status timeline requests')
  }
  if (!group) {
    throw new Error('A group name is required')
  }
  if (!startTime || !endTime) {
    throw new Error('Both start-time and end-time are required')
  }

  const params = new URLSearchParams()
  params.set('start-time', startTime)
  params.set('end-time', endTime)

  const root =
    mode === 'private'
      ? `${BACKEND_API}/v1/tenants`
      : `${BACKEND_API}/v1/public/tenants`

  const url = `${root}/${encodeURIComponent(
    tenantIdentifier,
  )}/status/${encodeURIComponent(
    report,
  )}/groups/${encodeURIComponent(group)}/endpoints?${params.toString()}`

  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

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

  const data: StatusTimelineResponse = await response.json()

  return (data?.groups ?? [])
    .flatMap((g) => g['service-types'] ?? [])
    .flatMap((st) => st.endpoints ?? [])
    .map((e) => ({ name: e.name, statuses: e.statuses ?? [] }))
}

export const fetchStatusTimelineAllEndpoints = async (
  tenantIdentifier: string,
  report: string | undefined,
  startTime: string,
  endTime: string,
  mode: AccessMode,
  token: string | undefined,
): Promise<StatusNode[]> => {
  if (mode === 'private' && !token) {
    throw new Error('Access token is required for private mode requests')
  }

  if (!tenantIdentifier) {
    throw new Error('Tenant identifier is required')
  }

  if (!report) {
    throw new Error('A report name is required for status timeline requests')
  }

  if (!startTime || !endTime) {
    throw new Error('Both start-time and end-time are required')
  }

  const params = new URLSearchParams()
  params.set('start-time', startTime)
  params.set('end-time', endTime)

  const root =
    mode === 'private'
      ? `${BACKEND_API}/v1/tenants`
      : `${BACKEND_API}/v1/public/tenants`

  const url = `${root}/${encodeURIComponent(
    tenantIdentifier,
  )}/status/${encodeURIComponent(report)}/endpoints?${params.toString()}`

  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

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

  const data: StatusTimelineResponse = await response.json()

  return (data?.groups ?? [])
    .flatMap((g) => g['service-types'] ?? [])
    .flatMap((st) => st.endpoints ?? [])
    .map((e) => ({
      name: e.name,
      statuses: e.statuses ?? [],
    }))
}
