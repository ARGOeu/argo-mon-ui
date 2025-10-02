import type { StatusGroupType, StatusItemType } from '@/types/common'

export type Page = {
  id?: number
  name: string
  slug: string
  report: string
  api?: string
  secret?: string
  created_at?: string
  updated_at?: string
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

export type PageTheming = {
  status: PageThemingStatus
  color?: string
  logo?: string
  columns?: string
}

export type PageGroup = {
  name: string
  alias: string
  list: StatusItemType[]
}
