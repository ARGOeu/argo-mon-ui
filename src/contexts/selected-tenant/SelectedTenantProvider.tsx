import { useState, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router'
import { useAuth } from '@/auth/useAuth'
import { useGetAllTenants } from '@/hooks/useTenants'
import { SelectedTenantContext } from './SelectedTenantContext'

const LAST_TENANT_KEY = 'lastActiveTenantId'
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface SelectedTenantProviderProps {
  children: ReactNode
}

const SelectedTenantProvider = ({ children }: SelectedTenantProviderProps) => {
  const { profile, authenticated } = useAuth()
  const location = useLocation()

  // Per-user storage key
  const storageKey = profile?.id ? `${LAST_TENANT_KEY}_${profile.id}` : null

  const [lastActiveTenantId, setLastActiveTenantId] = useState<string | null>(
    null,
  )

  const {
    data: tenantsData,
    isLoading: isTenantLoading,
    error: tenantError,
    fetchNextPage,
    hasNextPage,
  } = useGetAllTenants(authenticated)

  useEffect(() => {
    if (hasNextPage) {
      fetchNextPage()
    }
  }, [tenantsData, hasNextPage, fetchNextPage])

  const tenants = useMemo(
    () => tenantsData?.pages.flatMap((page) => page.content) ?? [],
    [tenantsData],
  )

  // Detect active tenant ID from current URL path
  const tenantMatch = location.pathname.match(/\/tenants\/([^/]+)/)
  const rawTenantId = tenantMatch?.[1] ?? null
  const activeTenantId =
    rawTenantId && UUID_REGEX.test(rawTenantId) ? rawTenantId : null

  // Load persisted tenant when storage key is available
  useEffect(() => {
    if (!storageKey) return
    setLastActiveTenantId(localStorage.getItem(storageKey))
  }, [storageKey])

  // Sync lastActiveTenantId to localStorage whenever it changes
  useEffect(() => {
    if (!storageKey || !lastActiveTenantId) return
    localStorage.setItem(storageKey, lastActiveTenantId)
  }, [lastActiveTenantId, storageKey])

  // Persist the last tenant the user navigated into
  useEffect(() => {
    if (activeTenantId) {
      setLastActiveTenantId(activeTenantId)
    }
  }, [activeTenantId])

  // Validate stored ID on load, fall back to first tenant if missing or invalid
  useEffect(() => {
    if (!storageKey || tenants.length === 0) return
    setLastActiveTenantId((current) => {
      if (current && tenants.some((t) => t.id === current)) return current
      return tenants[0]?.id ?? null
    })
  }, [tenants, storageKey])

  const effectiveTenantId = activeTenantId ?? lastActiveTenantId ?? null

  const selectedTenant = useMemo(
    () => tenants.find((t) => t.id === effectiveTenantId),
    [tenants, effectiveTenantId],
  )

  const isTenantAdmin = useMemo(
    () =>
      !!profile?.groups?.find(
        (group) =>
          group.name === selectedTenant?.info.name && group.role === 'admin',
      ),
    [profile, selectedTenant],
  )

  return (
    <SelectedTenantContext.Provider
      value={{
        tenant: selectedTenant,
        isTenantLoading,
        tenantError,
        isTenantAdmin,
        effectiveTenantId,
        tenants,
      }}
    >
      {children}
    </SelectedTenantContext.Provider>
  )
}

export default SelectedTenantProvider
