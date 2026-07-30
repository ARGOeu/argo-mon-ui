import { useState } from 'react'
import { useTenantName } from '@/hooks/useTenantName'
import { useGetPerformanceSettings } from '@/hooks/useSettings'
import {
  useGetPublicTenantReports,
  useGetPublicTenantInfo,
} from '@/hooks/useTenants'
import { Outlet } from 'react-router-dom'
import {
  CircleStackIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  TableCellsIcon,
} from '@heroicons/react/16/solid'
import MobileMenuToggle from '@/components/sidebar/MobileMenuToggle'
import SidebarHeader from '@/components/sidebar/SidebarHeader'
import SidebarNavItem from '@/components/sidebar/SidebarNavItem'
import TenantAvatar from '@/components/sidebar/TenantAvatar'
import NotFound from '@/pages/NotFound'
import { isPlatformDomain } from '@/utils/domains'

const PublicTenantLayout = () => {
  const { tenantName, loading: tenantLoading } = useTenantName()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { data: performanceSetting } = useGetPerformanceSettings()
  const { isLoading: reportsLoading, error: reportsError } =
    useGetPublicTenantReports(tenantName ?? '', undefined, !!tenantName)
  const { data: tenantInfo } = useGetPublicTenantInfo(
    tenantName ?? '',
    !!tenantName,
  )

  if (tenantLoading || (!!tenantName && reportsLoading)) {
    return (
      <div className="h-screen flex items-center justify-center text-subtle">
        Loading…
      </div>
    )
  }

  if (!tenantName || reportsError) {
    return <NotFound />
  }

  const dashboardPath = isPlatformDomain()
    ? `/public/tenants/${tenantName}/dashboard`
    : '/dashboard'

  const availabilityReliabilityPath = isPlatformDomain()
    ? `/public/tenants/${tenantName}/ar-groups`
    : '/ar-groups'

  const capabilitiesPath = isPlatformDomain()
    ? `/public/tenants/${tenantName}/capabilities`
    : '/capabilities'

  const performancePath = isPlatformDomain()
    ? `/public/tenants/${tenantName}/performance`
    : '/performance'

  return (
    <div className="h-screen flex overflow-hidden">
      <MobileMenuToggle
        isOpen={isMobileMenuOpen}
        onOpen={() => setIsMobileMenuOpen(true)}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <aside
        className={`w-56 md:w-60 xl:w-68 2xl:w-72 bg-surface-muted border-r border-line flex flex-col fixed md:static inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen
            ? 'translate-x-0'
            : '-translate-x-full md:translate-x-0'
        }`}
      >
        <SidebarHeader onCloseMobileMenu={() => setIsMobileMenuOpen(false)} />

        <nav className="flex flex-col overflow-y-auto min-h-0">
          <p className="px-4 pt-4 pb-1 text-[0.65rem] font-semibold tracking-widest uppercase text-subtle select-none">
            Tenant
          </p>
          <div className="mx-2 flex items-center gap-2.5 p-2 rounded-lg">
            <TenantAvatar name={tenantName} image={tenantInfo?.logo} />
            <span className="text-sm font-semibold text-foreground truncate flex-1 min-w-0">
              {tenantName}
            </span>
          </div>
          <SidebarNavItem
            to={dashboardPath}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <CircleStackIcon className="size-4" aria-hidden />
            Dashboard
          </SidebarNavItem>
          <SidebarNavItem
            to={availabilityReliabilityPath}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <TableCellsIcon className="size-4" aria-hidden />
            Availability & Reliability
          </SidebarNavItem>
          <SidebarNavItem
            to={capabilitiesPath}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <ShieldCheckIcon className="size-4" aria-hidden />
            Capabilities
          </SidebarNavItem>
          {performanceSetting?.enabled && (
            <SidebarNavItem
              to={performancePath}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <ChartBarIcon className="size-4" aria-hidden />
              Performance
            </SidebarNavItem>
          )}
        </nav>
      </aside>

      <main className="flex-1 bg-white overflow-auto">
        <div className="container mx-2 md:mx-auto py-2 px-4 md:px-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default PublicTenantLayout
