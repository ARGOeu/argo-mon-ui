import { useCallback, useEffect, useMemo } from 'react'
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { useGetPublicTenantReports } from '@/hooks/useTenants'
import {
  useGetResultsGroupDetails,
  useGetResultsGroupEndpoints,
} from '@/hooks/useData'
import {
  useGetStatusTimelineGroup,
  useGetStatusTimelineGroupEndpoints,
} from '@/hooks/useStatusTimeline'
import { useGetTenantDowntimes } from '@/hooks/useDowntimes'
import { useTenantName } from '@/hooks/useTenantName'
import GroupDashboard from '@/pages/dashboard/GroupDashboard'

const toUtcDate = (d: Date) => d.toISOString().split('T')[0]

const PublicGroupDashboard = () => {
  const { tenantName } = useTenantName()
  const { groupName = '' } = useParams<{
    groupName: string
  }>()

  const { hash, pathname, search } = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const focusEndpoint = searchParams.get('endpoint') ?? undefined

  const { data: reports } = useGetPublicTenantReports(tenantName ?? '')

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

  /*
   * Results / availability data:
   * last 7 days through today.
   */
  const { startTime, endTime } = useMemo(() => {
    const now = new Date(`${today}T00:00:00Z`)
    const start = new Date(now)

    start.setUTCDate(start.getUTCDate() - 7)

    return {
      startTime: `${toUtcDate(start)}T00:00:00Z`,
      endTime: `${today}T23:59:59Z`,
    }
  }, [today])

  /*
   * Status data:
   * today only.
   *
   * These values are intentionally stable so they do not
   * change on every render and create new React Query keys.
   */
  const statusStartTime = `${today}T00:00:00Z`
  const statusEndTime = `${today}T23:59:59Z`

  const enabled = !!selectedReport && !!groupName && !!tenantName

  const {
    data: detailsData,
    isLoading: detailsLoading,
    error: detailsError,
  } = useGetResultsGroupDetails(
    tenantName ?? '',
    'public',
    selectedReport,
    groupName,
    startTime,
    endTime,
    'daily',
    enabled,
  )

  const {
    data: endpointsData,
    isLoading: endpointsLoading,
    error: endpointsError,
  } = useGetResultsGroupEndpoints(
    tenantName ?? '',
    'public',
    selectedReport,
    groupName,
    startTime,
    endTime,
    'daily',
    enabled,
  )

  /*
   * Actual group status from the status backend.
   */
  const {
    data: statusData,
    isLoading: statusLoading,
    error: statusError,
  } = useGetStatusTimelineGroup(
    tenantName ?? '',
    'public',
    selectedReport,
    groupName,
    statusStartTime,
    statusEndTime,
    enabled,
  )

  /*
   * Actual status timelines for every endpoint in the group.
   */
  const {
    data: statusEndpointsData,
    isLoading: statusEndpointsLoading,
    error: statusEndpointsError,
  } = useGetStatusTimelineGroupEndpoints(
    tenantName ?? '',
    'public',
    selectedReport,
    groupName,
    statusStartTime,
    statusEndTime,
    enabled,
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

  const backToDashboard = () =>
    navigate(
      `/public/tenants/${encodeURIComponent(tenantName ?? '')}/dashboard` +
        (selectedReport ? `#${encodeURIComponent(selectedReport)}` : ''),
    )

  return (
    <GroupDashboard
      tenantName={tenantName ?? ''}
      selectedReport={selectedReport}
      groupName={groupName}
      detailsData={detailsData}
      detailsLoading={detailsLoading}
      detailsError={detailsError ?? null}
      endpointsData={endpointsData}
      endpointsLoading={endpointsLoading}
      endpointsError={endpointsError ?? null}
      statusData={statusData}
      statusLoading={statusLoading}
      statusError={statusError ?? null}
      statusEndpointsData={statusEndpointsData}
      statusEndpointsLoading={statusEndpointsLoading}
      statusEndpointsError={statusEndpointsError ?? null}
      focusEndpoint={focusEndpoint}
      downtimesData={downtimes}
      downtimesLoading={downtimesLoading}
      downtimesError={downtimesError ?? null}
      onBack={backToDashboard}
    />
  )
}

export default PublicGroupDashboard
