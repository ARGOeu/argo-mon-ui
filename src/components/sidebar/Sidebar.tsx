import {
  RectangleStackIcon,
  UserGroupIcon,
  EnvelopeIcon,
  HomeIcon,
  ShieldCheckIcon,
  UsersIcon,
  DocumentChartBarIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/16/solid'
import type { Tenant } from '@/types/tenants'
import type { AuthContextType } from '@/auth/context'
import TenantPicker from './TenantPicker'
import SidebarNavItem from './SidebarNavItem'
import SidebarHeader from './SidebarHeader'
import SidebarFooter from './SidebarFooter'

interface SidebarProps {
  isMobileMenuOpen: boolean
  onCloseMobileMenu: () => void
  authenticated: boolean
  isSuperAdmin: boolean
  userTenants: Tenant[]
  effectiveTenantId: string | null
  isAdminOfTenant: boolean
  profile: AuthContextType['profile']
  onLogout: () => void
}

function SidebarSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 pt-4 pb-1 text-[0.65rem] font-semibold tracking-widest uppercase text-subtle select-none">
      {children}
    </p>
  )
}

function Sidebar({
  isMobileMenuOpen,
  onCloseMobileMenu,
  authenticated,
  isSuperAdmin,
  userTenants,
  effectiveTenantId,
  isAdminOfTenant,
  profile,
  onLogout,
}: SidebarProps) {
  return (
    <aside
      className={`w-56 md:w-60 xl:w-68 2xl:w-72 bg-surface-muted border-r border-line flex flex-col overflow-y-auto overflow-x-hidden fixed md:static inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
    >
      <SidebarHeader onCloseMobileMenu={onCloseMobileMenu} />

      {authenticated ? (
        <nav className="flex-1 flex flex-col">
          {/* Tenant section */}
          <div>
            <SidebarSectionLabel>Tenant</SidebarSectionLabel>

            <TenantPicker
              tenants={userTenants}
              activeTenantId={effectiveTenantId}
              onSelect={onCloseMobileMenu}
            />

            {/* Tenant sub-navigation (only when inside a tenant context) */}
            {effectiveTenantId && (
              <div>
                <SidebarNavItem
                  to={`/tenants/${effectiveTenantId}/details`}
                  end
                  onClick={onCloseMobileMenu}
                >
                  <HomeIcon className="size-4" aria-hidden />
                  Overview
                </SidebarNavItem>
                <SidebarNavItem
                  to="/status-pages/view"
                  onClick={onCloseMobileMenu}
                >
                  <RectangleStackIcon className="size-4" aria-hidden />
                  Status Pages
                </SidebarNavItem>
                <SidebarNavItem
                  to={`/tenants/${effectiveTenantId}/reports`}
                  onClick={onCloseMobileMenu}
                >
                  <DocumentChartBarIcon className="size-4" aria-hidden />
                  Reports
                </SidebarNavItem>
                <SidebarNavItem
                  to={`/tenants/${effectiveTenantId}/capabilities`}
                  onClick={onCloseMobileMenu}
                >
                  <ShieldCheckIcon className="size-4" aria-hidden />
                  Capabilities
                </SidebarNavItem>
                {isAdminOfTenant && (
                  <SidebarNavItem
                    to={`/tenants/${effectiveTenantId}/members`}
                    onClick={onCloseMobileMenu}
                  >
                    <UsersIcon className="size-4" aria-hidden />
                    Members
                  </SidebarNavItem>
                )}
              </div>
            )}
          </div>

          {/* Account section */}
          <div>
            <SidebarSectionLabel>Account</SidebarSectionLabel>
            <SidebarNavItem to="/my-invitations" onClick={onCloseMobileMenu}>
              <EnvelopeIcon className="size-4" aria-hidden />
              My Invitations
            </SidebarNavItem>
          </div>

          {/* Admin section */}
          {isSuperAdmin && (
            <div>
              <SidebarSectionLabel>Admin</SidebarSectionLabel>
              <SidebarNavItem to="/administration" onClick={onCloseMobileMenu}>
                <UserGroupIcon className="size-4" aria-hidden />
                Administration
              </SidebarNavItem>
            </div>
          )}
        </nav>
      ) : (
        <div className="flex-1 flex items-start justify-center px-6 pt-20">
          <div className="text-center text-muted text-sm">
            <BuildingOffice2Icon className="size-12 mx-auto mb-3 text-brand" />
            <p className="font-medium text-body mb-1">
              Status Pages Management
            </p>
            <p>Please login to access the application</p>
          </div>
        </div>
      )}

      {authenticated && (
        <SidebarFooter
          profile={profile}
          onCloseMobileMenu={onCloseMobileMenu}
          onLogout={onLogout}
        />
      )}
    </aside>
  )
}

export default Sidebar
