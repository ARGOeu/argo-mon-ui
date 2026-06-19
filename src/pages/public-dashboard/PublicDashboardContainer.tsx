import { useEffect, useState } from 'react'
import { useGetPublicTenantReports } from '@/hooks/useTenants'
import {
  useGetPublicResultsGroups,
  useGetPublicStatusGroups,
} from '@/hooks/useData'
import { useLocation } from 'react-router-dom'
import { BuildingOffice2Icon, CircleStackIcon } from '@heroicons/react/16/solid'
import Dashboard from '@/pages/dashboard/Dashboard'
import MobileMenuToggle from '@/components/sidebar/MobileMenuToggle'
import SidebarHeader from '@/components/sidebar/SidebarHeader'
import SidebarNavItem from '@/components/sidebar/SidebarNavItem'
import TenantAvatar from '@/components/sidebar/TenantAvatar'
import NotFound from '../NotFound'
import { isPlatformDomain } from '@/utils/domains'
import { useTenantName } from '@/hooks/useTenantName'

const PublicDashboardContainer = () => {
  const { tenantName, loading: tenantLoading } = useTenantName()
  const { hash } = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState('')

  const {
    data: reports,
    isLoading: reportsLoading,
    error: reportsError,
  } = useGetPublicTenantReports(tenantName ?? '')

  useEffect(() => {
    if (!reports || reports.length === 0) return
    const hashReport = hash ? decodeURIComponent(hash.slice(1)) : ''
    const target =
      hashReport && reports.some((r) => r.name === hashReport)
        ? hashReport
        : reports[0].name
    setSelectedReport(target)
  }, [reports, hash])

  const {
    data: resultsData,
    isLoading: resultsLoading,
    error: resultsError,
  } = useGetPublicResultsGroups(
    tenantName ?? '',
    selectedReport,
    undefined,
    '1w',
    !!selectedReport,
  )

  const {
    data: statusData,
    isLoading: statusLoading,
    error: statusError,
  } = useGetPublicStatusGroups(
    tenantName ?? '',
    selectedReport,
    undefined,
    !!selectedReport,
  )

  if (tenantLoading) {
    return (
      <div className="h-screen flex items-center justify-center text-subtle">
        Loading…
      </div>
    )
  }

  if (!tenantName) {
    return <NotFound />
  }

  const dashboardPath = isPlatformDomain()
    ? `/public/tenants/${tenantName}/dashboard`
    : '/dashboard'

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
            {tenantName ? (
              <TenantAvatar name={tenantName} />
            ) : (
              <BuildingOffice2Icon className="size-8 text-muted flex-shrink-0" />
            )}
            <span className="text-sm font-semibold text-foreground truncate flex-1 min-w-0">
              {tenantName || 'Public Dashboard'}
            </span>
          </div>

          <SidebarNavItem
            to={dashboardPath}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <CircleStackIcon className="size-4" aria-hidden />
            Dashboard
          </SidebarNavItem>
        </nav>
      </aside>

      <main className="flex-1 bg-white overflow-auto">
        <div className="container mx-2 md:mx-auto py-2 px-4 md:px-6">
          <Dashboard
            tenantName={tenantName}
            reports={reports}
            reportsLoading={reportsLoading}
            reportsError={reportsError ?? null}
            resultsData={resultsData}
            resultsLoading={resultsLoading}
            resultsError={resultsError ?? null}
            statusData={statusData}
            statusLoading={statusLoading}
            statusError={statusError ?? null}
            selectedReport={selectedReport}
            onReportChange={setSelectedReport}
          />
        </div>
      </main>
    </div>
  )
}

export default PublicDashboardContainer
