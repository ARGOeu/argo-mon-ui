import { useEffect, useState, useMemo } from 'react'
import { useGetTenantReports } from '@/hooks/useTenants'
import { useGetResultsGroups, useGetStatusGroups } from '@/hooks/useData'
import { useSelectedTenant } from '@/contexts/selected-tenant/useSelectedTenant'
import { useParams } from 'react-router-dom'
import Dashboard from './Dashboard'

const PrivateDashboardContainer = () => {
  const { id: tenantId } = useParams<{ id: string }>()
  const { tenant } = useSelectedTenant()
  const tenantName = tenant?.info?.name ?? ''

  const [selectedReport, setSelectedReport] = useState('')

  const {
    data: privateReports,
    isLoading: privateReportsLoading,
    error: privateReportsError,
  } = useGetTenantReports(tenantId ?? '', undefined, false)

  const {
    data: publicReports,
    isLoading: publicReportsLoading,
    error: publicReportsError,
  } = useGetTenantReports(tenantId ?? '', undefined, true)

  const reports = useMemo(() => {
    const merged = [
      ...(privateReports ?? []).map((r) => ({ ...r, isPublic: false })),
      ...(publicReports ?? []).map((r) => ({ ...r, isPublic: true })),
    ]
    const visitedReportIds = new Set<string>()
    return merged.filter((report) => {
      if (visitedReportIds.has(report.id)) return false
      visitedReportIds.add(report.id)
      return true
    })
  }, [privateReports, publicReports])

  const reportsLoading = privateReportsLoading || publicReportsLoading
  const reportsError = privateReportsError || publicReportsError

  useEffect(() => {
    if (!reports || reports.length === 0) return
    if (!reports.some((r) => r.name === selectedReport)) {
      setSelectedReport(reports[0].name)
    }
  }, [reports, selectedReport])

  const {
    data: resultsData,
    isLoading: resultsLoading,
    error: resultsError,
  } = useGetResultsGroups(
    tenantId ?? '',
    selectedReport,
    undefined,
    '1w',
    !!selectedReport,
  )

  const {
    data: statusData,
    isLoading: statusLoading,
    error: statusError,
  } = useGetStatusGroups(
    tenantId ?? '',
    selectedReport,
    undefined,
    !!selectedReport,
  )

  if (!tenantId) {
    return (
      <div className="page-container">
        <p className="text-sm text-muted">No tenant selected.</p>
      </div>
    )
  }

  return (
    <Dashboard
      tenantName={tenantName}
      tenantId={tenantId}
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
  )
}

export default PrivateDashboardContainer
