import type { JSX } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'

export default function AuthProtected({ children }: { children: JSX.Element }) {
  const { initialized, authenticated } = useAuth()
  const location = useLocation()

  if (!initialized) return null

  if (!authenticated) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return children
}
