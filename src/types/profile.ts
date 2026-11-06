export interface UserGroup {
  name: string
  role: string
  attributes?: Record<string, string[]>
}

export interface UserProfile {
  id: string
  username: string
  email: string
  name: string
  surname: string
  uid: string
  roles: string[]
  groups?: UserGroup[] | null
}
