import type { ProjectList } from '@/types/projects'
import type {
  Job,
  Tenant,
  TenantList,
  PaginatedMembersResponse,
  ReportListItem,
  PublicReportItem,
  ReportDetail,
  MetricProfileResponse,
  TenantReadinessResponse,
  TopologyFeed,
  CapabilityAvailabilityResponse,
  CapabilityAvailabilityParams,
  CapabilityStatusResponse,
  CapabilityStatusParams,
} from '@/types/tenants'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

export const fetchCreateTenant = async (
  data: Tenant,
  token: string,
): Promise<Tenant> => {
  const response = await fetch(`${BACKEND_API}/v1/admin/tenants`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const error = new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    ) as Error & { errors?: string[] }
    error.errors = errorData.errors || []
    throw error
  }

  return response.json()
}

export const fetchDeleteTenant = async (
  id: string,
  token: string,
): Promise<void> => {
  const response = await fetch(`${BACKEND_API}/v1/admin/tenants/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    )
  }
}

export const fetchAssignTenantProjects = async (
  data: { tenant_id: string; project_ids: string[] },
  token: string,
): Promise<void> => {
  const response = await fetch(`${BACKEND_API}/v1/admin/tenant-project`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const error = new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    ) as Error & { errors?: string[] }
    error.errors = errorData.errors || []
    throw error
  }
}

export const fetchUserTenants = async (
  token: string,
  page: number = 1,
  size: number = 10,
  search?: string,
): Promise<TenantList> => {
  const searchParam = search ? `&search=${encodeURIComponent(search)}` : ''

  const response = await fetch(
    `${BACKEND_API}/v1/tenants?page=${page}&size=${size}${searchParam}`,
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

export const fetchUserTenantById = async (
  id: string,
  token: string,
): Promise<Tenant> => {
  const response = await fetch(`${BACKEND_API}/v1/tenants/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    )
  }

  return response.json()
}

export const fetchUpdateUserTenant = async (
  id: string,
  data: Tenant,
  token: string,
): Promise<Tenant> => {
  const response = await fetch(`${BACKEND_API}/v1/tenants/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const error = new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    ) as Error & { errors?: string[] }
    error.errors = errorData.errors || []
    throw error
  }

  return response.json()
}

export const fetchUserTenantProjects = async (
  tenantId: string,
  token: string,
  page: number = 1,
  size: number = 10,
): Promise<ProjectList> => {
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/projects?page=${page}&size=${size}`,
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

export const fetchUserTenantStatus = async (
  id: string,
  token: string,
): Promise<{ name: string; status: { jobs: Job[] } }> => {
  const response = await fetch(`${BACKEND_API}/v1/tenants/${id}/status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    )
  }

  return response.json()
}

export const fetchUserContactTypes = async (
  token: string,
): Promise<string[]> => {
  const response = await fetch(`${BACKEND_API}/v1/tenants/contact-types`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    )
  }

  return response.json()
}

export const updateTenantStatus = async (
  id: string,
  data: { jobs: Job[] },
  token: string,
): Promise<{ name: string; status: { jobs: Job[] } }> => {
  const response = await fetch(
    `${BACKEND_API}/v1/admin/tenants/${id}/manual/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
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

export const fetchMembers = async (
  token: string,
  page?: number,
  size?: number,
  search?: string,
): Promise<PaginatedMembersResponse> => {
  const params = new URLSearchParams()
  if (page !== undefined) params.append('page', page.toString())
  if (size !== undefined) params.append('size', size.toString())
  if (search) params.append('search', search)

  const queryString = params.toString()
  const url = queryString
    ? `${BACKEND_API}/v1/admin/members?${queryString}`
    : `${BACKEND_API}/v1/admin/members`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    )
  }

  return response.json()
}

export const fetchTenantMembers = async (
  tenantId: string,
  token: string,
  page: number = 1,
  size: number = 10,
): Promise<PaginatedMembersResponse> => {
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/members?page=${page}&size=${size}`,
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

export const removeMemberFromTenant = async (
  tenantId: string,
  memberId: string,
  token: string,
): Promise<void> => {
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/members/${memberId}`,
    {
      method: 'DELETE',
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
}

export const revokeInvitation = async (
  tenantId: string,
  invitationId: string,
  token: string,
): Promise<void> => {
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/invitations/${invitationId}`,
    {
      method: 'PATCH',
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
}

export const fetchTenantReports = async (
  tenantId: string,
  token: string,
  search?: string,
  isPublic?: boolean,
): Promise<ReportListItem[]> => {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (isPublic === true || isPublic === false)
    params.set('public', String(isPublic))
  const queryString = params.toString() ? `?${params.toString()}` : ''

  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/reports${queryString}`,
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

export const fetchPublicTenantReports = async (
  tenantName: string,
  node?: boolean,
): Promise<PublicReportItem[]> => {
  const params = node !== undefined ? `?node=${node}` : ''

  const response = await fetch(
    `${BACKEND_API}/v1/public/tenants/${tenantName}/reports/public${params}`,
    {
      headers: { 'Content-Type': 'application/json' },
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

export const fetchSetReportPublic = async (
  tenantId: string,
  reportId: string,
  token: string,
): Promise<string> => {
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/reports/${reportId}/set-public`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`)
  }
  return data.status?.message ?? ''
}

export const fetchSetReportPrivate = async (
  tenantId: string,
  reportId: string,
  token: string,
): Promise<string> => {
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/reports/${reportId}/set-private`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`)
  }
  return data.status?.message ?? ''
}

export const fetchTenantReportById = async (
  tenantId: string,
  reportId: string,
  token: string,
): Promise<ReportDetail> => {
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/reports/${reportId}`,
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

export const fetchTenantMetricProfile = async (
  tenantId: string,
  profileId: string,
  token: string,
): Promise<MetricProfileResponse> => {
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/metric-profiles/${profileId}`,
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

export const fetchTenantReadiness = async (
  tenantId: string,
  token: string,
): Promise<TenantReadinessResponse> => {
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/check-readiness`,
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

export const notifyAmsCheckReadiness = async (
  tenantId: string,
  tenantName: string,
  token: string,
): Promise<{ jobs: Job[] }> => {
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/notify-ams-check-readiness`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'CHECK_READINESS',
        properties: {
          tenant_name: tenantName,
        },
      }),
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

export const notifyAms = async (
  tenantId: string,
  tenantName: string,
  jobName: string,
  token: string,
): Promise<{ jobs: Job[] }> => {
  const response = await fetch(
    `${BACKEND_API}/v1/admin/tenants/${tenantId}/notify-ams`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: jobName,
        properties: {
          tenant_name: tenantName,
        },
      }),
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

export const fetchTenantCapabilityAvailability = async (
  tenantId: string,
  params: CapabilityAvailabilityParams = {},
  token: string,
): Promise<CapabilityAvailabilityResponse> => {
  const query = new URLSearchParams()
  if (params.date) {
    query.append('date', params.date)
  }
  if (params.start_date) {
    query.append('start_date', params.start_date)
  }
  if (params.end_date) {
    query.append('end_date', params.end_date)
  }
  if (params.start_time) {
    query.append('start_time', params.start_time)
  }
  if (params.end_time) {
    query.append('end_time', params.end_time)
  }
  if (params.granularity) {
    query.append('granularity', params.granularity)
  }
  const queryString = query.toString()

  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/capabilities/availability${queryString ? `?${queryString}` : ''}`,
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

export const fetchTenantCapabilityStatus = async (
  tenantId: string,
  params: CapabilityStatusParams = {},
  token: string,
): Promise<CapabilityStatusResponse> => {
  const query = new URLSearchParams()
  if (params.start_time) {
    query.append('start_time', params.start_time)
  }
  if (params.end_time) {
    query.append('end_time', params.end_time)
  }
  if (params.history !== undefined) {
    query.append('history', String(params.history))
  }

  const queryString = query.toString()

  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/capabilities/status${queryString ? `?${queryString}` : ''}`,
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

export const setTenantNode = async (
  id: string,
  node: boolean,
  token: string,
): Promise<void> => {
  const response = await fetch(`${BACKEND_API}/v1/tenants/${id}/set-node`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ node }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    )
  }
}

export const setNodeReport = async (
  tenantId: string,
  reportId: string,
  token: string,
): Promise<void> => {
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/reports/${reportId}/set-node-report`,
    {
      method: 'POST',
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
}

export const fetchGetTopologyFeed = async (
  tenantId: string,
  token: string,
): Promise<TopologyFeed> => {
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/feeds/topology`,
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
    ) as Error & { status: number }
    error.status = response.status
    throw error
  }

  return response.json()
}

export const fetchUpdateTopologyFeed = async (
  tenantId: string,
  data: TopologyFeed,
  token: string,
): Promise<void> => {
  const response = await fetch(
    `${BACKEND_API}/v1/tenants/${tenantId}/feeds/topology`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    },
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    )
  }
}
