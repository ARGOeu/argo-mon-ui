import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useGetTenantReports } from '@/hooks/useTenants'
import {
  useGetStatusTimelineEndpoints,
  useGetStatusTimelineGroups,
  useGetStatusTimelineMetricDetails,
  useGetStatusTimelineMetrics,
  useGetStatusTimelineServiceTypes,
} from '@/hooks/useStatusTimeline'
import { useSelectedTenant } from '@/contexts/selected-tenant/useSelectedTenant'
import type { StatusNode, StatusPath } from '@/types/statusTimeline'
import {
  STATUS_RANGE_DAYS,
  type StatusRangeId,
  type TimeZoneMode,
} from '@/utils/statusTimeline'
import StatusView, { type PointSelection, type StatusRow } from './StatusView'
import { useStatusDeepLink } from '@/hooks/useStatusDeepLink'

// convert date to YYYY-MM-DD string - take into account the timezone
const toDateStr = (d: Date, tz: TimeZoneMode) => {
  if (tz === 'utc') return d.toISOString().split('T')[0]
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Shift a date string based on timezone
const shiftDate = (date: string, days: number, tz: TimeZoneMode) => {
  const [y, m, d] = date.split('-').map(Number)
  const dt =
    tz === 'utc' ? new Date(Date.UTC(y, m - 1, d)) : new Date(y, m - 1, d)
  if (tz === 'utc') dt.setUTCDate(dt.getUTCDate() + days)
  else dt.setDate(dt.getDate() + days)
  return toDateStr(dt, tz)
}

// Create a date boundary for backend calls based on the timezone mode
const dayBoundaryToIso = (
  date: string,
  tz: TimeZoneMode,
  edge: 'start' | 'end',
): string => {
  const [y, m, d] = date.split('-').map(Number)
  if (tz === 'utc') {
    return edge === 'start' ? `${date}T00:00:00.000Z` : `${date}T23:59:59.999Z`
  }
  const dt =
    edge === 'start'
      ? new Date(y, m - 1, d, 0, 0, 0, 0)
      : new Date(y, m - 1, d, 23, 59, 59, 999)
  return dt.toISOString()
}

// get 00:00 UTC of the same day
const floorToUtcMidnight = (iso: string): string => {
  const d = new Date(iso)
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString()
}

// get 00:00 UTC of the next day
const ceilToUtcMidnight = (iso: string): string => {
  const d = new Date(iso)
  const atMidnight = new Date(d)
  atMidnight.setUTCHours(0, 0, 0, 0)
  if (atMidnight.getTime() !== d.getTime()) {
    atMidnight.setUTCDate(atMidnight.getUTCDate() + 1)
  }
  return atMidnight.toISOString()
}

const PrivateStatusView = () => {
  const { id: tenantId } = useParams<{ id: string }>()
  const { tenant } = useSelectedTenant()
  const tenantName = tenant?.info?.name ?? ''

  const [, setSearchParams] = useSearchParams()

  // hook to handle deep link parsing and focusing on the target item
  const deepLink = useStatusDeepLink()
  const { resolveReport } = deepLink

  const [selectedReport, setSelectedReport] = useState('')
  const [range, setRange] = useState<StatusRangeId>('1d')
  const [tz, setTz] = useState<TimeZoneMode>('local')

  // Today date reference based on timezone mode
  const today = toDateStr(new Date(), tz)

  // Land on the day containing the deep-linked timestamp (if any) so the
  // fetched window actually covers the event, otherwise default to today.
  const [anchorDate, setAnchorDate] = useState(() => {
    const ts = deepLink.focusTarget?.timestamp
    if (!ts) return today
    const parsed = Date.parse(ts)
    if (Number.isNaN(parsed)) return today
    const date = toDateStr(new Date(parsed), tz)
    return date > today ? today : date
  })

  // when the user drills down to an item and opens a path, all other items are closed
  const [path, setPath] = useState<StatusPath>({})

  // this is the selected status result point at a specific timestamp where the user wants to see details about
  const [pointSelection, setPointSelection] = useState<PointSelection | null>(
    null,
  )

  const {
    data: reports,
    isLoading: reportsLoading,
    error: reportsError,
  } = useGetTenantReports(tenantId ?? '')

  useEffect(() => {
    setSelectedReport('')
  }, [tenantId])

  // if deep link is present use it as a source for resolving report and the path
  // otherwise use the default report
  useEffect(() => {
    if (!reports || reports.length === 0) return
    if (reports.some((r) => r.name === selectedReport)) return

    const resolved = resolveReport(reports)
    if (!resolved) return

    setSelectedReport(resolved.report ?? '')
    setPath(resolved.path)
  }, [reports, selectedReport, resolveReport])

  // keep today reference
  const todayRef = useRef(today)
  todayRef.current = today

  useEffect(() => {
    setAnchorDate((prev) =>
      prev >= todayRef.current ? todayRef.current : prev,
    )
  }, [tz])

  const selectedReportValid =
    reports?.some((r) => r.name === selectedReport) ?? false

  const stepDays = STATUS_RANGE_DAYS[range]
  const isCurrentWindow = anchorDate >= today

  const startDate = shiftDate(anchorDate, -(stepDays - 1), tz)
  const maxStartDate = shiftDate(today, -(stepDays - 1), tz)

  // This is the actual time window for which status timelines are displayd in page view
  const { startTime, endTime } = useMemo(
    () => ({
      startTime: dayBoundaryToIso(startDate, tz, 'start'),
      endTime: dayBoundaryToIso(anchorDate, tz, 'end'),
    }),
    [startDate, anchorDate, tz],
  )

  // The actuall request to the backend with a larger window in days due to the utc - localtime differences
  const { queryStartTime, queryEndTime } = useMemo(
    () => ({
      queryStartTime: floorToUtcMidnight(startTime),
      queryEndTime: ceilToUtcMidnight(endTime),
    }),
    [startTime, endTime],
  )

  // We always stop at today - there is no period after now
  const shiftWindow = (direction: -1 | 1) =>
    setAnchorDate((prev) => {
      const next = shiftDate(prev, direction * stepDays, tz)
      return next > today ? today : next
    })

  const handleEndDateChange = (date: string) => {
    if (!date) return
    setAnchorDate(date > today ? today : date)
  }

  const handleStartDateChange = (date: string) => {
    if (!date) return
    const end = shiftDate(date, stepDays - 1, tz)
    setAnchorDate(end > today ? today : end)
  }

  const ready = !!selectedReport && selectedReportValid

  // We always fetch the top level groups.
  // Each level below the group is fetched when the group is opened (drill down).
  // If we reopen a group that we have already visited results are fetched from cache
  const groups = useGetStatusTimelineGroups(
    tenantId ?? '',
    'private',
    selectedReport,
    queryStartTime,
    queryEndTime,
    ready,
  )

  const serviceTypes = useGetStatusTimelineServiceTypes(
    tenantId ?? '',
    'private',
    selectedReport,
    path.group,
    queryStartTime,
    queryEndTime,
    ready && !!path.group,
  )

  const endpoints = useGetStatusTimelineEndpoints(
    tenantId ?? '',
    'private',
    selectedReport,
    path.group,
    path.serviceType,
    queryStartTime,
    queryEndTime,
    ready && !!path.group && !!path.serviceType,
  )

  const metrics = useGetStatusTimelineMetrics(
    tenantId ?? '',
    'private',
    selectedReport,
    path.group,
    path.serviceType,
    path.endpoint,
    queryStartTime,
    queryEndTime,
    ready && !!path.group && !!path.serviceType && !!path.endpoint,
  )

  // get metric result details about the status metric point that the user has selected
  const pointDetails = useGetStatusTimelineMetricDetails(
    tenantId ?? '',
    'private',
    selectedReport,
    path.group,
    path.serviceType,
    path.endpoint,
    pointSelection?.metric,
    pointSelection?.timestamp,
    ready &&
      !!path.group &&
      !!path.serviceType &&
      !!path.endpoint &&
      !!pointSelection,
  )

  // checks if enough data are fetched so as to make focusing on the target point possible
  const focusReady = deepLink.getFocusReady({
    ready,
    path,
    groups,
    serviceTypes,
    endpoints,
    metrics,
  })

  const rows = useMemo<StatusRow[]>(() => {
    const out: StatusRow[] = []

    // create a placeholder line until loading is complete
    const childrenOf = (
      query: { isPending: boolean; error: Error | null; data?: StatusNode[] },
      depth: number,
      parentKey: string,
    ): StatusNode[] => {
      if (query.isPending) {
        out.push({
          kind: 'message',
          key: `${parentKey}\u0000loading`,
          depth,
          state: 'loading',
        })
        return []
      }
      if (query.error) {
        out.push({
          kind: 'message',
          key: `${parentKey}\u0000error`,
          depth,
          state: 'error',
          message: query.error.message,
        })
        return []
      }
      if (!query.data?.length) {
        out.push({
          kind: 'message',
          key: `${parentKey}\u0000empty`,
          depth,
          state: 'empty',
        })
        return []
      }
      return query.data
    }

    for (const group of groups.data ?? []) {
      const groupKey = group.name
      const groupOpen = path.group === group.name

      out.push({
        kind: 'node',
        key: groupKey,
        name: group.name,
        type: group.type,
        depth: 0,
        statuses: group.statuses,
        expandable: true,
        expanded: groupOpen,
      })
      if (!groupOpen) continue

      for (const serviceType of childrenOf(serviceTypes, 1, groupKey)) {
        const serviceTypeKey = `${groupKey}\u0000${serviceType.name}`
        const serviceTypeOpen = path.serviceType === serviceType.name

        out.push({
          kind: 'node',
          key: serviceTypeKey,
          name: serviceType.name,
          type: serviceType.type,
          depth: 1,
          statuses: serviceType.statuses,
          expandable: true,
          expanded: serviceTypeOpen,
        })
        if (!serviceTypeOpen) continue

        for (const endpoint of childrenOf(endpoints, 2, serviceTypeKey)) {
          const endpointKey = `${serviceTypeKey}\u0000${endpoint.name}`
          const endpointOpen = path.endpoint === endpoint.name

          out.push({
            kind: 'node',
            key: endpointKey,
            name: endpoint.name,
            type: endpoint.type,
            depth: 2,
            statuses: endpoint.statuses,
            expandable: true,
            expanded: endpointOpen,
          })
          if (!endpointOpen) continue

          for (const metric of childrenOf(metrics, 3, endpointKey)) {
            out.push({
              kind: 'node',
              key: `${endpointKey}\u0000${metric.name}`,
              name: metric.name,
              type: metric.type,
              depth: 3,
              statuses: metric.statuses,
              expandable: false,
              expanded: false,
            })
          }
        }
      }
    }

    return out
  }, [groups.data, serviceTypes, endpoints, metrics, path])

  const handleToggle = (depth: number, name: string) =>
    setPath((prev) => {
      if (depth === 0) {
        return prev.group === name ? {} : { group: name }
      }
      if (depth === 1) {
        return prev.serviceType === name
          ? { group: prev.group }
          : { group: prev.group, serviceType: name }
      }
      return prev.endpoint === name
        ? { group: prev.group, serviceType: prev.serviceType }
        : { ...prev, endpoint: name }
    })

  // this activates after the deep link is settled (handled)
  // after that the state is passed to react and each state change
  // as the user interacts with the view updates the url
  // so as to be possible to use it as a new deep link
  useEffect(() => {
    if (!ready || !deepLink.settled) return

    const next = new URLSearchParams()
    next.set('report', selectedReport)
    if (path.group) next.set('group', path.group)
    if (path.serviceType) next.set('serviceType', path.serviceType)
    if (path.endpoint) next.set('endpoint', path.endpoint)
    if (pointSelection) {
      next.set('metric', pointSelection.metric)
      next.set('ts', pointSelection.timestamp)
    }
    setSearchParams(next, { replace: true })
  }, [
    ready,
    deepLink.settled,
    selectedReport,
    path,
    pointSelection,
    setSearchParams,
  ])

  if (!tenantId) {
    return (
      <div className="page-container">
        <p className="text-sm text-muted">No tenant selected.</p>
      </div>
    )
  }

  return (
    <StatusView
      tenantName={tenantName}
      reports={reports}
      reportsLoading={reportsLoading}
      reportsError={reportsError ?? null}
      rows={rows}
      statusLoading={groups.isPending}
      statusError={groups.error ?? null}
      onToggle={handleToggle}
      selectedReport={selectedReport}
      onReportChange={setSelectedReport}
      range={range}
      onRangeChange={setRange}
      tz={tz}
      onTzChange={setTz}
      startDate={startDate}
      endDate={anchorDate}
      maxStartDate={maxStartDate}
      maxEndDate={today}
      isCurrentWindow={isCurrentWindow}
      onStartDateChange={handleStartDateChange}
      onEndDateChange={handleEndDateChange}
      onShiftWindow={shiftWindow}
      onJumpToNow={() => setAnchorDate(today)}
      startTime={startTime}
      endTime={endTime}
      onPointSelectionChange={setPointSelection}
      pointDetails={pointDetails.data}
      pointDetailsLoading={pointDetails.isPending}
      pointDetailsError={pointDetails.error ?? null}
      focusSelection={deepLink.focusTarget}
      focusReady={focusReady}
      onFocusSettled={deepLink.markFocusSettled}
    />
  )
}

export default PrivateStatusView
