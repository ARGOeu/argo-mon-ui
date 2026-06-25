// AuthProvider.tsx
import { AuthContext, type AuthContextType } from './context'
import { keycloak, initKeycloak } from './keycloak'
import { useEffect, useRef, useState } from 'react'
import { registerUser } from '@/api/users'
import { fetchUserProfile } from '@/api/profile'

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [initialized, setInitialized] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [token, setToken] = useState<string | undefined>(undefined)
  const [profile, setProfile] = useState<AuthContextType['profile']>(undefined)

  const startedRef = useRef(false)
  const refreshTimerRef = useRef<number | null>(null)
  const hasRegistered = useRef(false)

  const loadProfile = async (
    authToken: string,
  ): Promise<AuthContextType['profile']> => {
    try {
      const profileData = await fetchUserProfile(authToken)
      // Extract unique roles from groups array
      const roles = profileData.groups
        ? Array.from(new Set(profileData.groups.map((group) => group.role)))
        : []

      const newProfile = {
        id: profileData.id,
        username: profileData.username,
        email: profileData.email,
        name: profileData.name,
        surname: profileData.surname,
        groups: profileData.groups || [],
        roles: roles,
      }

      setProfile(newProfile)
      return newProfile
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      throw error
    }
  }

  // Fetch profile data when token becomes available
  useEffect(() => {
    if (token && authenticated) {
      loadProfile(token)
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

          // Register user once when authenticated
          if (!hasRegistered.current && keycloak.token) {
            hasRegistered.current = true
            try {
              await registerUser(keycloak.token)
              setRegistered(true)
            } catch (error) {
              console.error('User registration error:', error)
              // Set registered to true even if registration fails to not block the app
              setRegistered(true)
            }
          } else {
            setRegistered(true)
          }

          // Refresh token every 5 mins; keep at least 10 mins of validity.
          refreshTimerRef.current = window.setInterval(
            async () => {
              try {
                const refreshed = await keycloak.updateToken(10 * 60) // Refresh if token will expire in the next 10 mins
                if (refreshed) setToken(keycloak.token)
              } catch {
                setAuthenticated(false)
                setToken(undefined)
                keycloak.login({
                  redirectUri:
                    import.meta.env.VITE_REDIRECT_URI || window.location.origin,
                })
              }
            },
            5 * 60 * 1000,
          )
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

  const isSuperAdmin = !!profile?.roles?.includes('member')

  return (
    <AuthContext.Provider
      value={{
        initialized,
        authenticated,
        registered,
        token,
        profile,
        isSuperAdmin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
