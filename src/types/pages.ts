import type { StatusGroupType } from '@/types/common'

export type Page = {
  content: PageContent[]
  size_of_page: number
  number_of_page: number
  total_elements: number
  total_pages: number
  links: string[]
}

export type PageContent = {
  id?: string
  name: string
  slug: string
  tenant_id: string
  report: string
  created_at?: string
  updated_at?: string
  config?: PageConfig
}

export type UserPageContent = PageContent & {
  tenant_name: string
  tenant_id: string
}

export type UserPages = {
  content: UserPageContent[]
  size_of_page: number
  number_of_page: number
  total_elements: number
  total_pages: number
}

export type PageCreateRequest = {
  name: string
  slug: string
  'report-id': string
  config?: PageConfig
}

export type PageConfig = {
  groups?: StatusGroupType[]
  title?: string
  description?: string
  theming?: PageTheming
}

export type PageThemingStatus = {
  icon: string
  text: string
}

export type ThemeOption =
  | 'theme_1_with_logo'
  | 'theme_1_no_logo'
  | 'theme_2_with_logo'
  | 'theme_2_no_logo'

export type PageTheming = {
  option?: ThemeOption
  status: PageThemingStatus
  color?: string
  logo?: string
  columns?: string
}
