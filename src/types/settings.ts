export interface SettingData {
  label: string
  description: string
  config?: { [key: string]: unknown }
}

export interface Setting {
  id: string
  data: SettingData
  enabled: boolean
  updated_by?: string
  updated_on?: string
}

export interface SettingUpdateRequest {
  data: { config: { [key: string]: unknown } }
  enabled: boolean
}
