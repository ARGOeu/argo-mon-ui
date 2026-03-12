import { useState, useEffect } from 'react'
import { Outlet, useLocation, useMatch } from 'react-router'
import { useGetUserTenants } from '@/hooks/useTenants'
import { useAuth } from './auth/useAuth'
import LoginPrompt from './components/LoginPrompt'
import Sidebar from '@/components/sidebar/Sidebar'
import MobileMenuToggle from '@/components/sidebar/MobileMenuToggle'

function Layout() {
  const { authenticated, profile, login, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  const isSuperAdmin = !!profile?.roles?.includes('super_admin')

  // check to see if we are on tenant details route
  const tDetsRoute = useMatch('/tenants/:id/details')

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
  const userTenants = tenantsData?.content ?? []

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
          className={`${tDetsRoute ? '' : 'container mx-2 md:mx-auto p-4 md:px-6'}`}
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
