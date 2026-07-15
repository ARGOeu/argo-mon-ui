import type {
  GroupsAvailabilityReliabilityResponse,
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
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    )
  }

  return response.json()
}
