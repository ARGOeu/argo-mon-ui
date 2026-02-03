import { createContext } from 'react'

export type AuthContextType = {
  initialized: boolean
  authenticated: boolean
  registered: boolean
  token?: string
  profile?: {
    id?: string
    username?: string
    email?: string
    name?: string
    surname?: string
    roles?: string[]
    groups?: Array<{
      name: string
      role: string
    }>
  }
  login: (redirectUri?: string) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType>({
  initialized: false,
  authenticated: false,
  registered: false,
  login: () => {},
  logout: () => {},
})
