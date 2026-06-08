import { useState } from 'react'
import { Outlet, useMatch } from 'react-router'
import { useAuth } from './auth/useAuth'
import { useSelectedTenant } from '@/contexts/selected-tenant'
import { SelectedTenantProvider } from '@/contexts/selected-tenant'
import LoginPrompt from './components/LoginPrompt'
import ErrorDisplay from '@/components/ErrorDisplay'
import Sidebar from '@/components/sidebar/Sidebar'
import MobileMenuToggle from '@/components/sidebar/MobileMenuToggle'

function LayoutContent() {
  const { authenticated, isSuperAdmin, profile, logout } = useAuth()
  const { effectiveTenantId, tenants, isTenantAdmin, tenant } =
    useSelectedTenant()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const tenantScopeMatch = useMatch('/tenants/:tenantKey/*')
  const isTenantScopedRoute =
    !!tenant &&
    (tenantScopeMatch?.params.tenantKey === tenant.id ||
      tenantScopeMatch?.params.tenantKey === tenant.info.name)

  const tenantDetailsMatch = useMatch('/tenants/:tenantKey/details')
  const isActiveTenantDetailsRoute =
    !!tenant &&
    (tenantDetailsMatch?.params.tenantKey === tenant.id ||
      tenantDetailsMatch?.params.tenantKey === tenant.info.name)

  return (
    <div className="h-screen flex overflow-hidden">
      <MobileMenuToggle
        isOpen={isMobileMenuOpen}
        onOpen={() => setIsMobileMenuOpen(true)}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        authenticated={authenticated}
        isSuperAdmin={isSuperAdmin}
        userTenants={tenants}
        effectiveTenantId={effectiveTenantId}
        isAdminOfTenant={isTenantAdmin}
        profile={profile}
        onLogout={logout}
      />

      <main className="flex-1 bg-white overflow-auto">
        <div
          className={`${isActiveTenantDetailsRoute && !tenant?.error ? '' : 'container mx-2 md:mx-auto py-2 px-4 md:px-6'}`}
        >
          {isTenantScopedRoute && tenant?.error ? (
            <div className="py-6 px-16 md:px-24">
              <ErrorDisplay error={new Error(tenant.error)} context="tenant" />
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </main>
    </div>
  )
}

function Layout() {
  const { authenticated, login } = useAuth()

  if (!authenticated) {
    return (
      <div className="h-screen flex overflow-hidden">
        <Sidebar
          isMobileMenuOpen={false}
          onCloseMobileMenu={() => {}}
          authenticated={false}
          isSuperAdmin={false}
          userTenants={[]}
          effectiveTenantId={null}
          isAdminOfTenant={false}
          profile={undefined}
          onLogout={() => {}}
        />
        <main className="flex-1 bg-white overflow-auto">
          <div className="container mx-2 md:mx-auto p-4 md:px-6">
            <LoginPrompt
              title="Authentication Required"
              description="Please login to access the status pages management"
              onLogin={login}
            />
          </div>
        </main>
      </div>
    )
  }

  return (
    <SelectedTenantProvider>
      <LayoutContent />
    </SelectedTenantProvider>
  )
}

export default Layout
