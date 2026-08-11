import type { AccessMode } from '@/types/common'
import type { StatusTimelineResponse } from '@/types/statusTimeline'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

export const fetchStatusTimelineGroups = async (
  tenantIdentifier: string,
  report: string | undefined,
  startTime: string,
  endTime: string,
  mode: AccessMode,
  token: string | undefined,
): Promise<StatusTimelineResponse> => {
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
  return { groups: data?.groups ?? [] }
}
