export type Contact = {
  name: string
  email: string
  type?: string
}

export type TenantInfo = {
  name: string
  email: string
  description: string
  website?: string
  image?: string
  created_at?: string
  updated_at?: string
}

export type Tenant = {
  id?: string
  info: TenantInfo
  contacts?: Contact[]
  updated_by?: string
}

export type TenantList = {
  content: Tenant[]
  size_of_page: number
  number_of_page: number
  total_elements: number
  total_pages: number
}
