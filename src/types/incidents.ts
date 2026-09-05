export type IncidentStatus =
  | 'NEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'PENDING'
  | 'RESOLVED'
  | 'CLOSED'

export type IncidentService = {
  id: string
  name: string
}

export type IncidentComment = {
  id: string
  comment: string
  created_by: string
  created_at: string
}

export type IncidentCommentRequest = {
  comment: string
}

export type Incident = {
  id: string
  incident_number: string
  title: string
  description: string
  services: IncidentService[]
  status: IncidentStatus
  created_by: string
  created_at: string
  updated_by?: string
  updated_at?: string
  status_description?: string
  comments?: IncidentComment[]
}

export type IncidentsResponse = {
  content: Incident[]
  size_of_page: number
  number_of_page: number
  total_elements: number
  total_pages: number
}

export type IncidentRequest = {
  title: string
  description: string
  services: IncidentService[]
}

export type IncidentStatusUpdateRequest = {
  status: IncidentStatus
  status_description?: string
}

export type IncidentActivity = {
  id: string
  previous_status: IncidentStatus
  new_status: IncidentStatus
  changed_by: string
  created_at: string
  status_description?: string
}

export type IncidentActivityUpdateRequest = {
  status_description: string
}

export type IncidentUpdateRequest = {
  description: string
}
