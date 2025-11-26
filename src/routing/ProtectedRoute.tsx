import type { JSX } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'

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

  if (!initialized) return null

  if (!authenticated) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  const hasRequiredRole = requiredRoles.some((role) =>
    profile?.roles?.includes(role),
  )

  if (!hasRequiredRole) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
