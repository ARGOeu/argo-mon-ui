export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

export type Invitation = {
  id: string
  tenant_id: string
  tenant_name: string
  email: string
  role: string
  status: InvitationStatus
  created_at: string
}

export type PaginatedInvitationsResponse = {
  size_of_page: number
  number_of_page: number
  total_elements: number
  total_pages: number
  content: Invitation[]
}

export type CreateInvitationRequest = {
  email: string
  role: string
}

export type RespondToInvitationRequest = {
  action: 'ACCEPT' | 'REJECT'
  api_resource: string
  resource_id: string
  role: string
}
