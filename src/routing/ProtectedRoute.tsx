import { useEffect, useState } from 'react'
import type { JSX } from 'react'
import { Navigate, useLocation, useParams } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { useGetTenantById } from '@/hooks/useTenants'
import type { UserGroup } from '@/types/profile'
import LoadingSpinner from '@/components/LoadingSpinner'

type RoleProtectedProps = {
  children: JSX.Element
  requiredRoles: string[]
  redirectTo?: string
  checkTenantAccess?: boolean
}

function ProtectedRoute({
  children,
  requiredRoles,
  redirectTo = '/',
  checkTenantAccess = false,
}: RoleProtectedProps) {
  const { initialized, authenticated, profile } = useAuth()
  const location = useLocation()
  const { id: tenantId } = useParams<{ id: string }>() || {}
  const [profileTimeout, setProfileTimeout] = useState(false)

  const { data: tenantData, isLoading: tenantLoading } = useGetTenantById(
    tenantId || '',
    checkTenantAccess && !!tenantId && authenticated,
  )

  // Set a timeout for profile loading (10 seconds)
  useEffect(() => {
    if (authenticated && !profile && !profileTimeout) {
      const timer = setTimeout(() => {
        setProfileTimeout(true)
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [authenticated, profile, profileTimeout])

  if (!initialized) return null

  if (!authenticated) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  if (
    (checkTenantAccess && tenantId && tenantLoading) ||
    (!profile && profileTimeout)
  ) {
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

  const hasTenantAccess = (tenantName: string) => {
    if (!tenantName || !profile?.groups) return false

    const group = profile?.groups?.find(
      (g: UserGroup) => g?.name === tenantName,
    )
    return group?.role === 'admin' || group?.role === 'viewer'
  }

  let hasRequiredRole = false

  if (isSuperAdmin) {
    hasRequiredRole = true
  } else if (checkTenantAccess && tenantData) {
    // For tenant-specific routes, check if user is admin or member of this specific tenant
    hasRequiredRole = hasTenantAccess(tenantData.info.name)
  } else if (!checkTenantAccess) {
    // For non-tenant routes, check if user has any of the required roles
    hasRequiredRole = requiredRoles.some((role) =>
      profile?.roles?.includes(role),
    )
  }

  if (!hasRequiredRole) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
