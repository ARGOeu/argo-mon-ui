import type { JSX } from 'react'
import { Navigate, useLocation, useParams } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { useGetTenantById } from '@/hooks/useTenants'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import type { UserGroup } from '@/types/profile'

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

  const { data: tenantData, isLoading: tenantLoading } = useGetTenantById(
    tenantId || '',
    checkTenantAccess && !!tenantId && authenticated,
  )

  if (!initialized) return null

  if (!authenticated) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  if (checkTenantAccess && tenantId && tenantLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <ArrowPathIcon
          style={{ width: '2.5rem', height: '2.5rem', color: '#1d4ed8' }}
          className="animate-spin"
        />
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
