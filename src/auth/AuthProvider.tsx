// AuthProvider.tsx
import { AuthContext, type AuthContextType } from './context'
import { keycloak, initKeycloak } from './keycloak'
import { useEffect, useRef, useState } from 'react'
import { fetchUserProfile } from '@/api/profile'

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [initialized, setInitialized] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [token, setToken] = useState<string | undefined>(undefined)
  const [profile, setProfile] = useState<AuthContextType['profile']>(undefined)

  const startedRef = useRef(false)
  const refreshTimerRef = useRef<number | null>(null)

  // Fetch profile data when token becomes available
  useEffect(() => {
    if (token && authenticated) {
      fetchUserProfile(token)
        .then((profileData) => {
          // Extract unique roles from groups array
          const roles = profileData.groups
            ? Array.from(new Set(profileData.groups.map((group) => group.role)))
            : []

          setProfile({
            id: profileData.id,
            username: profileData.username,
            email: profileData.email,
            name: profileData.name,
            surname: profileData.surname,
            groups: profileData.groups || [],
            roles: roles,
          })
        })
        .catch((error) => {
          console.error('Failed to fetch user profile:', error)
        })
    }
  }, [token, authenticated])

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    //const redirectBase = import.meta.env.VITE_REDIRECT_URI || window.location.origin;

    initKeycloak({
      onLoad: 'check-sso',
      scope: import.meta.env.VITE_KEYCLOAK_SCOPE,
      pkceMethod: 'S256',
      //silentCheckSsoRedirectUri: `${new URL(redirectBase).origin}/silent-check-sso.html`,
      checkLoginIframe: false,
    })
      .then(async (auth) => {
        setAuthenticated(auth)

        if (auth) {
          setToken(keycloak.token)
        }

        setInitialized(true)
      })
      .catch((e) => {
        console.error('Keycloak init failed', e)
        setInitialized(true) // let the app render a logged-out state
      })

    // Proper cleanup
    return () => {
      if (refreshTimerRef.current !== null) {
        window.clearInterval(refreshTimerRef.current)
        refreshTimerRef.current = null
      }
    }
  }, [])

  const login = (redirectUri?: string) =>
    keycloak.login({
      redirectUri:
        redirectUri ||
        import.meta.env.VITE_REDIRECT_URI ||
        window.location.origin,
    })

  const logout = () =>
    keycloak.logout({
      redirectUri: import.meta.env.VITE_REDIRECT_URI || window.location.origin,
    })

  return (
    <AuthContext.Provider
      value={{ initialized, authenticated, token, profile, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
