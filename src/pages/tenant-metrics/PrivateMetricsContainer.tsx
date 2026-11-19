import { useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useGetTenantReports } from '@/hooks/useTenants'
import { useGetLatestMetricData } from '@/hooks/useData'
import { useSelectedTenant } from '@/contexts/selected-tenant/useSelectedTenant'
import { buildStatusTimelineHref } from '@/utils/latestProblems'
import TenantMetrics from './TenantMetrics'

const PrivateMetricsContainer = () => {
  const { id: tenantId } = useParams<{ id: string }>()
  const { tenant } = useSelectedTenant()
  const [searchParams, setSearchParams] = useSearchParams()

  const {
    data: reports,
    isLoading: reportsLoading,
    error: reportsError,
  } = useGetTenantReports(tenantId ?? '')

  const selectedReport = reports?.find(
    (report) => report.name === searchParams.get('report'),
  )

  // Select the first report when the URL has no report
  useEffect(() => {
    if (reports?.length && !selectedReport) {
      setSearchParams({ report: reports[0].name }, { replace: true })
    }
  }, [reports, selectedReport, setSearchParams])

  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
  } = useGetLatestMetricData(
    tenantId ?? '',
    'private',
    selectedReport?.id ?? '',
  )

  if (!tenantId) {
    return (
      <div className="page-container">
        <p className="text-sm text-muted">No tenant selected.</p>
      </div>
    )
  }

  return (
    <TenantMetrics
      tenantName={tenant?.info?.name ?? ''}
      reports={reports}
      reportsLoading={reportsLoading}
      reportsError={reportsError}
      selectedReport={selectedReport?.name ?? ''}
      onReportChange={(name) =>
        setSearchParams({ report: name }, { replace: true })
      }
      getStatusHref={(check) =>
        buildStatusTimelineHref(
          `/tenants/${tenantId}/status`,
          selectedReport?.name ?? '',
          check,
        )
      }
      metrics={metrics}
      metricsLoading={metricsLoading}
      metricsError={metricsError}
    />
  )
}

export default PrivateMetricsContainer
