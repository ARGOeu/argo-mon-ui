import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useGetPublicTenantReports } from '@/hooks/useTenants'
import {
  useGetPublicResultsGroups,
  useGetPublicStatusGroups,
} from '@/hooks/useData'
import { useTenantName } from '@/hooks/useTenantName'
import Dashboard from '@/pages/dashboard/Dashboard'

const PublicDashboardContainer = () => {
  const { tenantName } = useTenantName()
  const { hash } = useLocation()
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

  return (
    <Dashboard
      tenantName={tenantName ?? ''}
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

export default PublicDashboardContainer
