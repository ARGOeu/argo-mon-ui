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
