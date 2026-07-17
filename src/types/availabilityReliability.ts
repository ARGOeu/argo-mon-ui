export type ResultGranularity = 'daily' | 'monthly'

export type GroupMonthlyResult = {
  month: string
  availability: number
  reliability: number
}

export type GroupAvailabilityReliability = {
  name: string
  monthly: GroupMonthlyResult[]
}

export type GroupDailyResult = {
  date: string
  availability: number
  reliability: number
  unknown: number
  downtime: number
}

export type GroupResult = {
  timestamp: string
  availability: string
  reliability: string
  unknown: string
  uptime: string
  downtime: string
}

export type GroupItem = {
  name: string
  type: string
  results: GroupResult[]
}

export type GroupData = {
  name: string
  type: string
  groups: GroupItem[]
}

export type GroupsAvailabilityReliabilityResponse = {
  results: GroupData[]
}

export type EndpointItem = {
  name: string
  type: string
  info: Record<string, string>
  results: GroupResult[]
}

export type ServiceTypeItem = {
  name: string
  type: string
  endpoints: EndpointItem[]
}

export type EndpointsData = {
  name: string
  type: string
  'service-types': ServiceTypeItem[]
}

export type EndpointsARResponse = {
  results: EndpointsData[]
}

export type EndpointMonthlyRow = {
  serviceName: string
  endpointName: string
  url?: string
  monthly: GroupMonthlyResult[]
}
