import type { RoleMetadataAttribute } from '@/types/securedEndpoints'

export type ApiResourceMetadata = {
  resourceName: string
  className: string
}

export type ApiResourcesPage = {
  content: ApiResourceMetadata[]
  size_of_page: number
  number_of_page: number
  total_elements: number
  total_pages: number
}

export type AssignRoleRequest = {
  api_resource?: string
  resource_id?: unknown
  role: string
  username: string
  extras?: Record<string, unknown>
  attributes?: Record<string, string[]>
}

export type RevokeRoleRequest = {
  api_resource?: string
  resource_id?: unknown
  role: string
  member_id: string
}

export type AssignRoleMetadata = {
  resources: Record<string, RoleMetadataAttribute[]>
}
