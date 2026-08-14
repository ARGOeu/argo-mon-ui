export type StatusValue =
  | 'OK'
  | 'WARNING'
  | 'CRITICAL'
  | 'DOWNTIME'
  | 'UNKNOWN'
  | 'MISSING'

export interface StatusEntry {
  timestamp: string
  value: StatusValue
}

/** A metric is always a leaf. */
export interface StatusMetric {
  name: string
  statuses?: StatusEntry[]
}

export interface StatusEndpoint {
  name: string
  info?: Record<string, string>
  statuses?: StatusEntry[]
  metrics?: StatusMetric[]
}

export interface StatusServiceType {
  name: string
  type?: string
  statuses?: StatusEntry[]
  endpoints?: StatusEndpoint[]
}

export interface StatusGroup {
  name: string
  type: string
  statuses?: StatusEntry[]
  'service-types'?: StatusServiceType[]
}

export interface StatusTimelineResponse {
  groups: StatusGroup[]
}

export type StatusLevel = 'group' | 'service-type' | 'endpoint' | 'metric'

export interface StatusPath {
  group?: string
  serviceType?: string
  endpoint?: string
}

export interface StatusNode {
  name: string
  type?: string
  statuses: StatusEntry[]
}
