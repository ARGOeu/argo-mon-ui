import type { GroupStatus, ReqApi, ReqReport } from "../types/common"

const BACKEND_API = import.meta.env.VITE_BACKEND_URI




export const fetchReportsApi = async (
  data: ReqApi,
  token: string,
): Promise<Report[]> => {
  const response = await fetch(`${BACKEND_API}/v1/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    )
  }

  return response.json()
}

export const fetchGroupsApi = async (
  data: ReqReport,
  token: string,
): Promise<GroupStatus[]> => {
  const response = await fetch(`${BACKEND_API}/v1/status/groups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    )
  }

  return response.json()
}
