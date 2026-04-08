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

export type AddRulesRequest = {
  rules: string[]
}

export type AddRulesResponse = {
  message: string
  code: string
}

export type AuthorizationRules = {
  id: number
  rule: string
  securedEndpointId: string
  createdAt: string
}
