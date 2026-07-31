import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useGetTenantReports } from '@/hooks/useTenants'
import { useGetResultsGroups, useGetStatusGroups } from '@/hooks/useData'
import { useGetTenantDowntimes } from '@/hooks/useDowntimes'
import { useSelectedTenant } from '@/contexts/selected-tenant/useSelectedTenant'
import Dashboard from './Dashboard'
import { useGetResultsEndpoints } from '@/hooks/results'

const toUtcDate = (d: Date) => d.toISOString().split('T')[0]

const PrivateDashboardContainer = () => {
  const { id: tenantId } = useParams<{ id: string }>()
  const { tenant } = useSelectedTenant()
  const tenantName = tenant?.info?.name ?? ''

  const [selectedReport, setSelectedReport] = useState('')

  const {
    data: reports,
    isLoading: reportsLoading,
    error: reportsError,
  } = useGetTenantReports(tenantId ?? '')

  useEffect(() => {
    setSelectedReport('')
  }, [tenantId])

  useEffect(() => {
    if (!reports || reports.length === 0) return
    if (!reports.some((r) => r.name === selectedReport)) {
      setSelectedReport(reports[0].name)
    }
  }, [reports, selectedReport])

  const selectedReportValid =
    reports?.some((r) => r.name === selectedReport) ?? false

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

  const {
    data: resultsData,
    isLoading: resultsLoading,
    error: resultsError,
  } = useGetResultsGroups(
    tenantId ?? '',
    'private',
    selectedReport,
    undefined,
    '1w',
    !!selectedReport && selectedReportValid,
  )

  const {
    data: endpointsData,
    isLoading: endpointsLoading,
    error: endpointsError,
  } = useGetResultsEndpoints(
    tenantId ?? '',
    'private',
    selectedReport,
    startTime,
    endTime,
    'daily',
    !!selectedReport && selectedReportValid,
  )

  const {
    data: downtimesData,
    isLoading: downtimesLoading,
    error: downtimesError,
  } = useGetTenantDowntimes(tenantId ?? '', {
    size: 100,
    date: today,
    enabled: true,
  })

  const downtimes = downtimesData?.pages.flatMap((page) => page.content) ?? []

  const {
    data: statusData,
    isLoading: statusLoading,
    error: statusError,
  } = useGetStatusGroups(
    tenantId ?? '',
    'private',
    selectedReport,
    undefined,
    !!selectedReport && selectedReportValid,
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
      downtimesData={downtimes}
      downtimesLoading={downtimesLoading}
      downtimesError={downtimesError}
      reportsLoading={reportsLoading}
      reportsError={reportsError ?? null}
      resultsData={resultsData}
      resultsLoading={resultsLoading}
      resultsError={resultsError ?? null}
      endpointsData={endpointsData}
      endpointsLoading={endpointsLoading}
      endpointsError={endpointsError ?? null}
      statusData={statusData}
      statusLoading={statusLoading}
      statusError={statusError ?? null}
      selectedReport={selectedReport}
      onReportChange={setSelectedReport}
    />
  )
}

export default PrivateDashboardContainer
