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

export type Tenant = {
  id?: string
  info: TenantInfo
  contacts?: Contact[]
  metadata?: Metadata
  updated_by?: string
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
