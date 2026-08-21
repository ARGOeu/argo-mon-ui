export interface ResultEntry {
  date: string
  availability: string
  uptime: string
}

export interface GroupResultItem {
  name: string
  results: ResultEntry[]
}

export interface GroupResultsResponse {
  data: GroupResultItem[]
}

export interface StatusEntry {
  timestamp: string
  value: string
}

export interface GroupStatusItem {
  name: string
  results: StatusEntry[]
}

export interface GroupStatusResponse {
  data: GroupStatusItem[]
}

export interface GroupResultEntry {
  timestamp: string
  availability: string
  uptime?: string
}

export interface GroupServiceNode {
  name: string
  type: string
  results?: GroupResultEntry[]
}

export interface GroupDetailNode {
  name: string
  type: string
  results?: GroupResultEntry[]
  groups?: GroupServiceNode[]
}

export interface GroupDetailResponse {
  results: GroupDetailNode[]
}

export interface GroupEndpointNode {
  name: string
  type: string
  info?: Record<string, string>
  results?: GroupResultEntry[]
}

export interface GroupServiceTypeNode {
  name: string
  type: string
  endpoints?: GroupEndpointNode[]
}

export interface GroupEndpointsNode {
  name: string
  type: string
  'service-types'?: GroupServiceTypeNode[]
}

export interface GroupEndpointsResponse {
  results: GroupEndpointsNode[]
}
