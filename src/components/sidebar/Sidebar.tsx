import { useEffect } from 'react'
import { useGetUserInvitations } from '@/hooks/useInvitations'
import { useGetPerformanceSettings } from '@/hooks/useSettings'
import { SUPER_ADMIN_ROLE } from '@/auth/roles'
import {
  RectangleStackIcon,
  UserGroupIcon,
  EnvelopeIcon,
  HomeIcon,
  ShieldCheckIcon,
  UsersIcon,
  DocumentChartBarIcon,
  TableCellsIcon,
  ServerStackIcon,
  CircleStackIcon,
  LockClosedIcon,
  Cog6ToothIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/16/solid'
import { ChartNetwork, Medal } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import TenantPicker from './TenantPicker'
import SidebarNavItem from './SidebarNavItem'
import SidebarHeader from './SidebarHeader'
import SidebarFooter from './SidebarFooter'
import type { Tenant } from '@/types/tenants'
import type { AuthContextType } from '@/auth/context'
import { Bars3Icon } from '@heroicons/react/24/outline'

interface TenantNavItem {
  path: string
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  requiredRoles?: string[]
  exactPathMatch?: boolean
}

const tenantNavItems: TenantNavItem[] = [
  {
    path: 'dashboard',
    label: 'Dashboard',
    icon: CircleStackIcon,
  },
  { path: 'details', label: 'Overview', icon: HomeIcon },
  {
    path: 'ar-groups',
    label: 'Availability & Reliability',
    icon: TableCellsIcon,
  },
  {
    path: 'status',
    label: 'Status',
    icon: Bars3Icon,
  },
  {
    path: 'topology',
    label: 'Topology',
    icon: ChartNetwork,
    requiredRoles: ['tenant_admin'],
  },
  { path: 'status-pages', label: 'Status Pages', icon: RectangleStackIcon },
  {
    path: 'incidents',
    label: 'Incidents',
    icon: ExclamationTriangleIcon,
  },
  {
    path: 'downtimes',
    label: 'Downtimes',
    icon: WrenchScrewdriverIcon,
    requiredRoles: ['tenant_admin'],
  },
  { path: 'reports', label: 'Reports', icon: DocumentChartBarIcon },
  {
    path: 'capabilities',
    label: 'Capabilities',
    icon: ShieldCheckIcon,
    requiredRoles: ['tenant_admin'],
  },
  {
    path: 'performance',
    label: 'Performance',
    icon: Medal,
    requiredRoles: [SUPER_ADMIN_ROLE],
  },
  {
    path: 'members',
    label: 'Members',
    icon: UsersIcon,
    requiredRoles: ['tenant_admin'],
  },
]

interface SidebarProps {
  isMobileMenuOpen: boolean
  onCloseMobileMenu: () => void
  authenticated: boolean
  isSuperAdmin: boolean
  userTenants: Tenant[]
  effectiveTenantId: string | null
  roleInSelectedTenant: string | null
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
  roleInSelectedTenant,
  profile,
  onLogout,
}: SidebarProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { data: performanceSetting } = useGetPerformanceSettings()

  const selectedTenant = userTenants.find(
    (tenant) => tenant.id === effectiveTenantId,
  )

  const isItemVisible = (item: TenantNavItem) => {
    if (
      item.path === 'performance' &&
      (!performanceSetting?.enabled || !selectedTenant?.performance)
    ) {
      return false
    }
    return (
      !item.requiredRoles ||
      isSuperAdmin ||
      (roleInSelectedTenant !== null &&
        item.requiredRoles.includes(roleInSelectedTenant))
    )
  }

  const visibleTenantNavItems = tenantNavItems.filter(isItemVisible)

  const firstTenantSubPath = visibleTenantNavItems[0]?.path ?? 'dashboard'

  useEffect(() => {
    if (!effectiveTenantId || userTenants.length === 0 || !profile) return
    if (
      pathname === '/' ||
      pathname.replace(/\/$/, '') === `/tenants/${effectiveTenantId}`
    ) {
      navigate(`/tenants/${effectiveTenantId}/${firstTenantSubPath}`, {
        replace: true,
      })
    }
  }, [
    pathname,
    effectiveTenantId,
    firstTenantSubPath,
    navigate,
    userTenants.length,
    profile,
  ])

  const { data: invitationsData } = useGetUserInvitations(
    authenticated,
    { size: 100 },
    { refetchInterval: 60000, staleTime: 0 },
  )
  const pendingCount =
    invitationsData?.content.filter((inv) => inv.status === 'PENDING').length ??
    0

  return (
    <aside
      className={`w-56 md:w-60 xl:w-68 2xl:w-72 bg-surface-muted border-r border-line flex flex-col fixed md:static inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
    >
      <SidebarHeader onCloseMobileMenu={onCloseMobileMenu} />

      {authenticated ? (
        <nav className="flex flex-col overflow-y-auto min-h-0 max-h-[calc(100vh-10rem)]">
          {/* Tenant section */}
          <div>
            <SidebarSectionLabel>Tenant</SidebarSectionLabel>

            <TenantPicker
              tenants={userTenants}
              activeTenantId={effectiveTenantId}
              onSelect={onCloseMobileMenu}
            />

            {effectiveTenantId && userTenants.length > 0 && (
              <div>
                {visibleTenantNavItems.map((item) => (
                  <SidebarNavItem
                    key={item.path}
                    to={`/tenants/${effectiveTenantId}/${item.path}`}
                    exactPathMatch={item.exactPathMatch}
                    onClick={onCloseMobileMenu}
                  >
                    <item.icon className="size-4" aria-hidden />
                    {item.label}
                  </SidebarNavItem>
                ))}
              </div>
            )}
          </div>

          {/* Account section */}
          <div>
            <SidebarSectionLabel>Account</SidebarSectionLabel>
            <SidebarNavItem to="/my-invitations" onClick={onCloseMobileMenu}>
              <EnvelopeIcon className="size-4" aria-hidden />
              <span className="relative">
                My Invitations
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-4.5 bg-red-500 text-white text-[0.7rem] font-semibold rounded-full min-w-4 h-4 flex items-center justify-center px-1">
                    {pendingCount > 99 ? '99+' : pendingCount}
                  </span>
                )}
              </span>
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
              <SidebarNavItem
                to="/endpoints-access"
                onClick={onCloseMobileMenu}
              >
                <LockClosedIcon className="size-4" aria-hidden />
                Endpoints Access
              </SidebarNavItem>
              <SidebarNavItem to="/settings" onClick={onCloseMobileMenu}>
                <Cog6ToothIcon className="size-4" aria-hidden />
                Settings
              </SidebarNavItem>
            </div>
          )}
        </nav>
      ) : (
        <div className="flex-1 flex items-start justify-center px-6 pt-20">
          <div className="text-center text-muted text-sm">
            <ServerStackIcon className="size-12 mx-auto mb-3 text-brand" />
            <p className="font-medium text-body mb-1">
              Status Pages Management
            </p>
            <p>Please login to access the application</p>
          </div>
        </div>
      )}

      {authenticated && (
        <div className="mt-auto">
          <SidebarFooter
            profile={profile}
            onCloseMobileMenu={onCloseMobileMenu}
            onLogout={onLogout}
          />
        </div>
      )}
    </aside>
  )
}

export default Sidebar
