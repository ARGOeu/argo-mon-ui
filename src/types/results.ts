export type Granularity = 'daily' | 'monthly'

export interface EndpointResultItem {
  timestamp: string
  availability: string
  reliability: string
  unknown: string
  uptime: string
  downtime: string
}

export interface EndpointResult {
  name: string
  type: string
  info: Record<string, string> | null
  results: EndpointResultItem[]
}

export interface EndpointServiceType {
  name: string
  type: string
  endpoints: EndpointResult[]
}

export interface EndpointGroupResult {
  name: string
  type: string
  'service-types': EndpointServiceType[]
}

export interface EndpointResultsResponse {
  results: EndpointGroupResult[]
}
