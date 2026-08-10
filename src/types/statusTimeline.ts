export interface StatusPoint {
  timestamp: string
  value: StatusValue
}

export type StatusValue =
  | 'OK'
  | 'WARNING'
  | 'CRITICAL'
  | 'DOWNTIME'
  | 'UNKNOWN'
  | 'MISSING'

export interface StatusTimelineGroup {
  name: string
  type: string
  statuses: StatusPoint[]
}

export interface StatusTimelineResponse {
  groups: StatusTimelineGroup[]
}
