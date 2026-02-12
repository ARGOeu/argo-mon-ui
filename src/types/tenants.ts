export type Contact = {
  name: string
  email: string
  type?: string
}

export type Topology = {
  type?: string
  url?: string
  feed?: string
}

export type Instance = {
  ui_url?: string
  poem_url?: string
  topology?: Topology
}

export type InternalList = {
  email?: string
  type?: string
}

export type AuthMetadata = {
  auth_name?: string
  auth_url?: string
}

export type Metadata = {
  instance?: Instance
  internalLists?: InternalList[]
  auth_metadata?: AuthMetadata
}

export type TenantInfo = {
  name: string
  email: string
  description: string
  website?: string
  image?: string
  created_at?: string
  updated_at?: string
}

export type JobStatus =
  | 'UNKNOWN'
  | 'INITIALISING'
  | 'INITIALISED'
  | 'FAILED_INITIALISATION'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'

export type Job = {
  name: string
  status: JobStatus
  start?: string
  end?: string
  message?: string
  mode?: 'AUTO' | 'MANUAL'
}

export type TenantStatus = {
  jobs: Job[]
}

export type Tenant = {
  id?: string
  info: TenantInfo
  contacts?: Contact[]
  metadata?: Metadata
  updated_by?: string
  status?: TenantStatus
  ['group-status']?: 'UNKNOWN' | 'NOT_FOUND' | 'EXISTS'
}

export type TenantList = {
  content: Tenant[]
  size_of_page: number
  number_of_page: number
  total_elements: number
  total_pages: number
}

export type TenantProjectAssignment = {
  tenant_id: string
  project_ids: string[]
}

export type TenantMembership = {
  name: string
  role: 'admin' | 'viewer'
}

export type Member = {
  id: string
  username: string
  firstName: string
  lastName: string
  email: string
  tenants?: TenantMembership[]
}

export type PaginatedMembersResponse = {
  size_of_page: number
  number_of_page: number
  total_elements: number
  total_pages: number
  content: Member[]
}

export type ReportListItem = {
  id: string
  name: string
  description: string
  tenant_name: string
  disabled: boolean
  created_at: string
  updated_at: string
}

export type ReportProfile = {
  id: string
  name: string
  type: string
}

export type MetricProfileService = {
  service: string
  metrics: string[]
}

export type MetricProfileData = {
  id: string
  services: MetricProfileService[]
}

export type MetricProfileResponse = {
  status: {
    message: string
    code: string
  }
  data: MetricProfileData[]
}

export type ReportTopologySchema = {
  group: {
    type: string
    group?: {
      type: string
    }
  }
}

export type ReportComputations = {
  ar: boolean
  status: boolean
  trends: string[]
}

export type ReportThresholds = {
  availability: number
  reliability: number
  uptime: number
  unknown: number
  downtime: number
}

export type ReportInfo = {
  name: string
  description: string
  created: string
  updated: string
}

export type ReportDetail = {
  id: string
  tenant: string
  disabled: boolean
  info: ReportInfo
  computations: ReportComputations
  thresholds: ReportThresholds
  topology_schema: ReportTopologySchema
  profiles: ReportProfile[]
  filter_tags: string[]
}

export type ReportListResponse = {
  size_of_page: number
  number_of_page: number
  total_elements: number
  total_pages: number
  content: ReportListItem[]
}
