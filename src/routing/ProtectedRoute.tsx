import { useEffect, useState } from 'react'
import type { JSX } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import LoadingSpinner from '@/components/LoadingSpinner'

type RoleProtectedProps = {
  children: JSX.Element
  requiredRoles: string[]
  redirectTo?: string
}

function ProtectedRoute({
  children,
  requiredRoles,
  redirectTo = '/',
}: RoleProtectedProps) {
  const { initialized, authenticated, profile } = useAuth()
  const location = useLocation()
  const [profileTimeout, setProfileTimeout] = useState(false)

  // Set a timeout for profile loading (5 seconds)
  useEffect(() => {
    if (authenticated && !profile && !profileTimeout) {
      const timer = setTimeout(() => {
        setProfileTimeout(true)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [authenticated, profile, profileTimeout])

  if (!initialized) return null

  if (!authenticated) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  if (!profile && !profileTimeout) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <LoadingSpinner />
      </div>
    )
  }

  const isSuperAdmin = profile?.roles?.includes('super_admin')

  const hasRequiredRole = (() => {
    if (isSuperAdmin) {
      return true
    }

    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    // Check if user has any of the required roles
    return requiredRoles.some((role) => profile?.roles?.includes(role))
  })()

  if (!hasRequiredRole) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
