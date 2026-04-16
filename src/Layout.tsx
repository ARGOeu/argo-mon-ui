import { useState, useEffect, useMemo } from 'react'
import { Outlet, useLocation, useMatch } from 'react-router'
import { useGetUserTenants } from '@/hooks/useTenants'
import { useAuth } from './auth/useAuth'
import LoginPrompt from './components/LoginPrompt'
import Sidebar from '@/components/sidebar/Sidebar'
import MobileMenuToggle from '@/components/sidebar/MobileMenuToggle'

const LAST_TENANT_KEY = 'lastActiveTenantId'

function Layout() {
  const { authenticated, profile, login, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  const isSuperAdmin = !!profile?.roles?.includes('super_admin')

  // check to see if we are on tenant details route
  const tDetsRoute = useMatch('/tenants/:id/details')

  // Per-user storage key
  const storageKey = profile?.id ? `${LAST_TENANT_KEY}_${profile.id}` : null

  const [lastActiveTenantId, setLastActiveTenantId] = useState<string | null>(
    null,
  )

  const openMobileMenu = () => setIsMobileMenuOpen(true)
  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  // Detect active tenant ID from current URL path
  const tenantMatch = location.pathname.match(/\/tenants\/([^/]+)/)
  const rawTenantId = tenantMatch?.[1] ?? null
  const activeTenantId =
    rawTenantId && !['create', 'edit'].includes(rawTenantId)
      ? rawTenantId
      : null

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

  const { data: tenantsData } = useGetUserTenants(
    1,
    50,
    undefined,
    authenticated,
  )
  const userTenants = useMemo(() => tenantsData?.content ?? [], [tenantsData])

  // Validate stored ID on load, fall back to first tenant if missing or invalid
  useEffect(() => {
    if (!storageKey || userTenants.length === 0) return

    setLastActiveTenantId((current) => {
      if (current && userTenants.some((t) => t.id === current)) return current
      return userTenants[0]?.id ?? null
    })
  }, [userTenants, storageKey])

  const effectiveTenantId = activeTenantId ?? lastActiveTenantId ?? null

  const activeTenantInfo = effectiveTenantId
    ? userTenants.find((t) => t.id === effectiveTenantId)
    : null
  const activeTenantName = activeTenantInfo?.info?.name ?? ''

  const isAdminOfTenant =
    isSuperAdmin ||
    !!profile?.groups?.find(
      (group) => group.name === activeTenantName && group.role === 'admin',
    )

  return (
    <div className="h-screen flex overflow-hidden">
      <MobileMenuToggle
        isOpen={isMobileMenuOpen}
        onOpen={openMobileMenu}
        onClose={closeMobileMenu}
      />

      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={closeMobileMenu}
        authenticated={authenticated}
        isSuperAdmin={isSuperAdmin}
        userTenants={userTenants}
        effectiveTenantId={effectiveTenantId}
        isAdminOfTenant={isAdminOfTenant}
        profile={profile}
        onLogout={logout}
      />

      {/* Page content */}
      <main className="flex-1 bg-white overflow-auto">
        <div
          className={`${tDetsRoute ? '' : 'container mx-2 md:mx-auto py-2 px-4 md:px-6'}`}
        >
          {!authenticated ? (
            <LoginPrompt
              title="Authentication Required"
              description="Please login to access the status pages management"
              onLogin={login}
            />
          ) : (
            <Outlet />
          )}
        </div>
      </main>
    </div>
  )
}

export default Layout
