export interface UserGroup {
  name: string
  role: string
}

export interface UserProfile {
  sub: string
  username: string
  email: string
  roles: string[]
  groups?: UserGroup[] | null
}
