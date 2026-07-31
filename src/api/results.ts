import type { AccessMode } from '@/types/common'
import type { EndpointResultsResponse, Granularity } from '@/types/results'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

export const fetchResultsEndpoints = async (
  tenantIdentifier: string,
  report: string,
  startTime: string,
  endTime: string,
  granularity: Granularity,
  mode: AccessMode,
  token: string | undefined,
): Promise<EndpointResultsResponse> => {
  if (mode === 'private' && !token) {
    throw new Error('Access token is required for private mode requests')
  }

  const params = new URLSearchParams()
  params.set('start-time', startTime)
  params.set('end-time', endTime)
  params.set('granularity', granularity)

  const base =
    mode === 'private'
      ? `${BACKEND_API}/v1/tenants/${tenantIdentifier}/results/${report}/endpoints`
      : `${BACKEND_API}/v1/public/tenants/${tenantIdentifier}/results/${report}/endpoints`

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (mode === 'private') {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${base}?${params.toString()}`, { headers })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    )
  }

  return response.json()
}
