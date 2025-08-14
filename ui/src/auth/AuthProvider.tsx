import { AuthContext, type AuthContextType } from './context'
import { keycloak } from './keycloak'
import { useEffect, useState } from 'react'

type KeycloakUserInfo = {
  preferred_username: string
  email: string
  name: string
}

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [initialized, setInitialized] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [token, setToken] = useState<string | undefined>(undefined)
  const [profile, setProfile] = useState<AuthContextType['profile']>(undefined)

  useEffect(() => {
    ;(async () => {
      try {
        const redirectURI =
          import.meta.env.VITE_REDIRECT_URI || window.location.origin
        const auth = await keycloak.init({
          onLoad: 'check-sso',
          pkceMethod: 'S256',
          silentCheckSsoRedirectUri: `${new URL(redirectURI).origin}/silent-check-sso.html`,
          checkLoginIframe: false,
        })
        setAuthenticated(auth)
        if (auth) {
          setToken(keycloak.token)
          const userInfo = await keycloak.loadUserInfo()
          setProfile({
            username: (userInfo as KeycloakUserInfo).preferred_username,
            name: (userInfo as KeycloakUserInfo).name,
            email: (userInfo as KeycloakUserInfo).email,
          })
        }

        // check to refresh token every 30'
        const refreshInterval = window.setInterval(async () => {
          try {
            const refreshed = await keycloak.updateToken(60)
            if (refreshed) setToken(keycloak.token)
          } catch {
            setAuthenticated(false)
            setToken(undefined)
          }
        }, 30000)

        setInitialized(true)
        return () => window.clearInterval(refreshInterval)
      } catch (e) {
        console.log('ERROR Keycloak init', e)
        setInitialized(true)
      }
    })()
  }, [])

  const login = () =>
    keycloak.login({
      redirectUri: import.meta.env.VITE_REDIRECT_URI || window.location.origin,
    })
  const logout = () =>
    keycloak.logout({
      redirectUri: import.meta.env.VITE_REDIRECT_URL || window.location.origin,
    })

  return (
    <AuthContext.Provider
      value={{ initialized, authenticated, token, profile, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
