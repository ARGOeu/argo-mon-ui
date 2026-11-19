import { useSearchParams } from 'react-router-dom'
import { useGetPublicTenantReports } from '@/hooks/useTenants'
import { useGetLatestMetricData } from '@/hooks/useData'
import { useTenantName } from '@/hooks/useTenantName'
import TenantMetrics from '@/pages/tenant-metrics/TenantMetrics'
import { isPlatformDomain } from '@/utils/domains'
import { buildStatusTimelineHref } from '@/utils/latestProblems'
import { useSelectedPublicReport } from './hooks/useSelectedPublicReport'

const PublicMetricsContainer = () => {
  const { tenantName } = useTenantName()
  const [searchParams, setSearchParams] = useSearchParams()

  const {
    data: reports,
    isLoading: reportsLoading,
    error: reportsError,
  } = useGetPublicTenantReports(tenantName ?? '')

  const setReportParam = (report: string) => {
    setSearchParams({ report }, { replace: true })
  }

  const selectedReport = useSelectedPublicReport(
    reports,
    searchParams.get('report'),
    setReportParam,
  )

  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
  } = useGetLatestMetricData(tenantName ?? '', 'public', selectedReport)

  return (
    <TenantMetrics
      tenantName={tenantName ?? ''}
      reports={reports}
      reportsLoading={reportsLoading}
      reportsError={reportsError}
      selectedReport={selectedReport}
      onReportChange={setReportParam}
      getStatusHref={(check) =>
        buildStatusTimelineHref(
          isPlatformDomain()
            ? `/public/tenants/${encodeURIComponent(tenantName ?? '')}/status`
            : '/status',
          selectedReport,
          check,
        )
      }
      metrics={metrics}
      metricsLoading={metricsLoading}
      metricsError={metricsError}
    />
  )
}

export default PublicMetricsContainer
