import { createContext } from 'react'

export type AuthContextType = {
  initialized: boolean
  authenticated: boolean
  token?: string
  profile?: {
    sub?: string
    username?: string
    email?: string
    name?: string
    given_name?: string
    family_name?: string
    entitlements: string[]
    roles: string[]
  }
  login: () => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType>({
  initialized: false,
  authenticated: false,
  login: () => {},
  logout: () => {},
})
