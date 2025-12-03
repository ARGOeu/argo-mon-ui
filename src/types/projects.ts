export type ProjectItem = {
  id: string
  name: string
  start_date: string
  end_date: string
}

export type Project = {
  id?: string
  name: string
  start_date: string
  end_date: string
  sustainability_end_date: string
  data_retention_policy: string
  created_at?: string
  updated_at?: string
}

export type ProjectList = {
  content: Project[]
  size_of_page: number
  number_of_page: number
  total_elements: number
  total_pages: number
}
