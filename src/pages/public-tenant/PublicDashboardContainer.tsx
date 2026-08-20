import { useCallback, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useGetPublicTenantReports } from '@/hooks/useTenants'
import { useGetResultsGroups, useGetStatusGroups } from '@/hooks/useData'
import { useTenantName } from '@/hooks/useTenantName'
import Dashboard from '@/pages/dashboard/Dashboard'
import { useGetResultsEndpoints } from '@/hooks/results'
import { useGetTenantDowntimes } from '@/hooks/useDowntimes'
import { useGetStatusTimelineAllEndpoints } from '@/hooks/useStatusTimeline'

const toUtcDate = (d: Date) => d.toISOString().split('T')[0]

const PublicDashboardContainer = () => {
  const { tenantName } = useTenantName()
  const { hash, pathname, search } = useLocation()
  const navigate = useNavigate()

  const {
    data: reports,
    isLoading: reportsLoading,
    error: reportsError,
  } = useGetPublicTenantReports(tenantName ?? '')

  const hashReport = hash ? decodeURIComponent(hash.slice(1)) : ''

  const selectedReport = reports?.some((r) => r.name === hashReport)
    ? hashReport
    : ''

  const setSelectedReport = useCallback(
    (name: string) => {
      navigate(`${pathname}${search}#${encodeURIComponent(name)}`, {
        replace: true,
      })
    },
    [navigate, pathname, search],
  )

  useEffect(() => {
    if (!reports || reports.length === 0) return
    if (reports.some((r) => r.name === hashReport)) return

    setSelectedReport(reports[0].name)
  }, [reports, hashReport, setSelectedReport])

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

  const endpointStatusStartTime = `${today}T00:00:00Z`
  const endpointStatusEndTime = `${today}T23:59:59Z`

  const {
    data: endpointStatusData,
    isLoading: endpointStatusLoading,
    error: endpointStatusError,
  } = useGetStatusTimelineAllEndpoints(
    tenantName ?? '',
    'public',
    selectedReport,
    endpointStatusStartTime,
    endpointStatusEndTime,
    !!selectedReport,
  )

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
    data: downtimesData,
    isLoading: downtimesLoading,
    error: downtimesError,
  } = useGetTenantDowntimes(tenantName ?? '', 'public', {
    size: 100,
    date: today,
    enabled: true,
  })

  const downtimes = downtimesData?.pages.flatMap((page) => page.content) ?? []

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

  const openGroup = (groupName: string, endpointName?: string) => {
    const query = endpointName
      ? `?endpoint=${encodeURIComponent(endpointName)}`
      : ''

    navigate(
      `/public/tenants/${encodeURIComponent(tenantName ?? '')}` +
        `/dashboard/groups/${encodeURIComponent(groupName)}${query}` +
        `#${encodeURIComponent(selectedReport)}`,
    )
  }

  return (
    <Dashboard
      tenantName={tenantName ?? ''}
      reports={reports}
      reportsLoading={reportsLoading}
      reportsError={reportsError ?? null}
      downtimesData={downtimes}
      downtimesLoading={downtimesLoading}
      downtimesError={downtimesError}
      resultsData={resultsData}
      resultsLoading={resultsLoading}
      resultsError={resultsError ?? null}
      statusData={statusData}
      statusLoading={statusLoading}
      statusError={statusError ?? null}
      endpointsData={endpointsData}
      endpointsLoading={endpointsLoading}
      endpointsError={endpointsError ?? null}
      endpointStatusData={endpointStatusData}
      endpointStatusLoading={endpointStatusLoading}
      endpointStatusError={endpointStatusError ?? null}
      selectedReport={selectedReport}
      onReportChange={setSelectedReport}
      onGroupSelect={(name) => openGroup(name)}
      onEndpointSelect={(group, endpoint) => openGroup(group, endpoint)}
    />
  )
}

export default PublicDashboardContainer
