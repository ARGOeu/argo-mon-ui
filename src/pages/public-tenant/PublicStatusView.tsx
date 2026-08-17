import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useGetPublicTenantReports } from '@/hooks/useTenants'
import {
  useGetStatusTimelineEndpoints,
  useGetStatusTimelineGroups,
  useGetStatusTimelineMetrics,
  useGetStatusTimelineServiceTypes,
} from '@/hooks/useStatusTimeline'
import type { StatusNode, StatusPath } from '@/types/statusTimeline'
import { STATUS_RANGE_DAYS, type StatusRangeId } from '@/utils/statusTimeline'
import StatusView, { type StatusRow } from '../status/StatusView'
import { useTenantName } from '@/hooks/useTenantName'

const toUtcDate = (d: Date) => d.toISOString().split('T')[0]

// Add days to a date string (YYYY-MM-DD format) always in UTC
const shiftDate = (date: string, days: number) => {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return toUtcDate(d)
}

const PublicStatusView = () => {
  const { tenantName } = useTenantName()
  const { hash } = useLocation()

  const today = toUtcDate(new Date())

  const [selectedReport, setSelectedReport] = useState('')
  const [range, setRange] = useState<StatusRangeId>('1d')

  // this is the reference date for the time-window we observe the timeline under. This is the date where the timeline ends in
  const [anchorDate, setAnchorDate] = useState(today)

  // when the user drills down to an item and opens a path, all other items are closed
  const [path, setPath] = useState<StatusPath>({})

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

  // Everything lives under a specific report
  useEffect(() => {
    setPath({})
  }, [tenantName, selectedReport])

  const selectedReportValid =
    reports?.some((r) => r.name === selectedReport) ?? false

  const stepDays = STATUS_RANGE_DAYS[range]
  const isCurrentWindow = anchorDate >= today

  // The start is derived from the reference (anchor date) which is actually the end date. We also know the stepDays (period)
  // and we use it to calculate the start date
  const startDate = shiftDate(anchorDate, -(stepDays - 1))
  const maxStartDate = shiftDate(today, -(stepDays - 1))

  const { startTime, endTime } = useMemo(
    () => ({
      startTime: `${startDate}T00:00:00Z`,
      endTime: `${anchorDate}T23:59:59Z`,
    }),
    [startDate, anchorDate],
  )

  // We always stop at today - there is no period after now
  const shiftWindow = (direction: -1 | 1) =>
    setAnchorDate((prev) => {
      const next = shiftDate(prev, direction * stepDays)
      return next > today ? today : next
    })

  const handleEndDateChange = (date: string) => {
    if (!date) return
    setAnchorDate(date > today ? today : date)
  }

  const handleStartDateChange = (date: string) => {
    if (!date) return
    // Pushing the start forward drags the end with it, up to today.
    const end = shiftDate(date, stepDays - 1)
    setAnchorDate(end > today ? today : end)
  }

  const ready = !!tenantName && !!selectedReport && selectedReportValid

  // We always fetch the top level groups.
  // Each level below the group is fetched when the group is opened (drill down).
  // If we reopen a group that we have already visited results are fetched from cache
  const groups = useGetStatusTimelineGroups(
    tenantName ?? '',
    'public',
    selectedReport,
    startTime,
    endTime,
    ready,
  )

  const serviceTypes = useGetStatusTimelineServiceTypes(
    tenantName ?? '',
    'public',
    selectedReport,
    path.group,
    startTime,
    endTime,
    ready && !!path.group,
  )

  const endpoints = useGetStatusTimelineEndpoints(
    tenantName ?? '',
    'public',
    selectedReport,
    path.group,
    path.serviceType,
    startTime,
    endTime,
    ready && !!path.group && !!path.serviceType,
  )

  const metrics = useGetStatusTimelineMetrics(
    tenantName ?? '',
    'public',
    selectedReport,
    path.group,
    path.serviceType,
    path.endpoint,
    startTime,
    endTime,
    ready && !!path.group && !!path.serviceType && !!path.endpoint,
  )

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

  if (!tenantName) {
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
    />
  )
}

export default PublicStatusView
