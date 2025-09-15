import { createContext } from 'react'

export type AuthContextType = {
  initialized: boolean
  authenticated: boolean
  token?: string
  profile?: { sub?: string; username?: string; email?: string; name?: string }
  login: () => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType>({
  initialized: false,
  authenticated: false,
  login: () => {},
  logout: () => {},
})
