export type SecuredEndpoint = {
  secured_endpoint_id: string
  action: string
  path: string
  description?: string
  scopes?: string[]
}

export type SecuredEndpointsPage = {
  content: SecuredEndpoint[]
  size_of_page: number
  number_of_page: number
  total_elements: number
  total_pages: number
}

export type EndpointAssignment = {
  secured_endpoint_id: string
  scope?: string
}

export type RoleAssignment = {
  role_id: string
  role_name: string
  secured_endpoints: EndpointAssignment[]
}

export type RoleAssignmentsResponse = {
  assignments: RoleAssignment[]
}

export type AssignEndpointsRequest = {
  secured_endpoint_assignments: EndpointAssignment[]
}

export type RoleEndpointAssignmentResponse = {
  message: string
  code: string
}

export type Role = {
  id: string
  name: string
  attributes?: Record<string, string[]>
}

export type RolesPage = {
  content: Role[]
  size_of_page: number
  number_of_page: number
  total_elements: number
  total_pages: number
  links: { href: string; rel: string }[]
}

export type CreateRoleRequest = {
  name: string
  attributes?: Record<string, string[]>
}

export type RoleMetadataAttribute = {
  key: string
  label: string
  required: boolean
}

export type RoleMetadata = {
  attributes: RoleMetadataAttribute[]
}
