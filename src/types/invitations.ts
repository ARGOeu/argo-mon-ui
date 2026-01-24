export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

export type InvitationRole = 'admin' | 'viewer'

export type Invitation = {
  id: string
  tenant_id: string
  tenant_name: string
  email: string
  role: InvitationRole
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
  role: InvitationRole
}

export type RespondToInvitationRequest = {
  action: 'ACCEPT' | 'REJECT'
}
