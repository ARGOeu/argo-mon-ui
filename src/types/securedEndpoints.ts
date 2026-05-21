export type SecuredEndpoint = {
  secured_endpoint_id: string
  action: string
  path: string
  description?: string
}

export type SecuredEndpointsPage = {
  content: SecuredEndpoint[]
  size_of_page: number
  number_of_page: number
  total_elements: number
  total_pages: number
}

export type RoleAssignment = {
  role_id: string
  role_name: string
  secured_endpoint_ids: string[]
}

export type RoleAssignmentsResponse = {
  assignments: RoleAssignment[]
}

export type AssignEndpointsRequest = {
  secured_endpoint_ids: string[]
}

export type RoleEndpointAssignmentResponse = {
  message: string
  code: string
}

export type Role = {
  id: string
  name: string
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
}
