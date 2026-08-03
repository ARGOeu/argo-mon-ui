import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useGetPublicTenantReports } from '@/hooks/useTenants'
import { useGetResultsGroups, useGetStatusGroups } from '@/hooks/useData'
import { useTenantName } from '@/hooks/useTenantName'
import Dashboard from '@/pages/dashboard/Dashboard'
import { useGetResultsEndpoints } from '@/hooks/results'

const toUtcDate = (d: Date) => d.toISOString().split('T')[0]

const PublicDashboardContainer = () => {
  const { tenantName } = useTenantName()
  const { hash } = useLocation()
  const [selectedReport, setSelectedReport] = useState('')

  const {
    data: reports,
    isLoading: reportsLoading,
    error: reportsError,
  } = useGetPublicTenantReports(tenantName ?? '')

  const today = toUtcDate(new Date())

  const { startTime, endTime } = useMemo(() => {
    const now = new Date(`${today}T00:00:00Z`)
    const start = new Date(now)
    start.setUTCDate(start.getUTCDate() - 7)
    return {
      startTime: `${toUtcDate(start)}T00:00:00Z`,
      endTime: `${today}T23:59:59Z`,
    }
  }, [today])

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
  } = useGetResultsGroups(
    tenantName ?? '',
    'public',
    selectedReport,
    undefined,
    '1w',
    !!selectedReport,
  )

  const {
    data: endpointsData,
    isLoading: endpointsLoading,
    error: endpointsError,
  } = useGetResultsEndpoints(
    tenantName ?? '',
    'public',
    selectedReport,
    startTime,
    endTime,
    'daily',
    !!selectedReport,
  )

  const {
    data: statusData,
    isLoading: statusLoading,
    error: statusError,
  } = useGetStatusGroups(
    tenantName ?? '',
    'public',
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
      endpointsData={endpointsData}
      endpointsLoading={endpointsLoading}
      endpointsError={endpointsError ?? null}
      selectedReport={selectedReport}
      onReportChange={setSelectedReport}
    />
  )
}

export default PublicDashboardContainer
