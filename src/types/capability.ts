export type MetricsGranularity = 'daily' | 'monthly'

export type MetricsEndpointMode = 'all' | 'service'

export interface MetricResult {
  date: string // YYYY-MM-DD
  availability?: number
  reliability?: number
  uptime?: number
}

export interface MetricsEntry {
  name: string
  results: MetricResult[]
}

export interface MetricsResponse {
  data: MetricsEntry[]
}

export interface MetricsQueryParams {
  startDate?: string // YYYY-MM-DD
  endDate?: string // YYYY-MM-DD
  granularity?: MetricsGranularity // daily or monthly
}
