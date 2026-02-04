export interface UserGroup {
  name: string
  role: string
}

export interface UserProfile {
  id: string
  username: string
  email: string
  name: string
  surname: string
  roles: string[]
  groups?: UserGroup[] | null
}
