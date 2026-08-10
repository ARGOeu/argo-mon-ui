import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useGetPublicTenantReports } from '@/hooks/useTenants'
import { useGetStatusTimelineGroups } from '@/hooks/useStatusTimeline'
import type { StatusRangeId } from '@/utils/statusTimeline'
import StatusView from '../status/StatusView'
import { useTenantName } from '@/hooks/useTenantName'

const toUtcDate = (d: Date) => d.toISOString().split('T')[0]

const RANGE_DAYS_BACK: Record<StatusRangeId, number> = {
  today: 0,
  '3d': 2,
  '7d': 6,
}

const PublicStatusView = () => {
  const { tenantName } = useTenantName()
  const { hash } = useLocation()

  const [selectedReport, setSelectedReport] = useState('')
  const [range, setRange] = useState<StatusRangeId>('today')
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

  const today = toUtcDate(new Date())

  const { startTime, endTime } = useMemo(() => {
    const start = new Date(`${today}T00:00:00Z`)
    start.setUTCDate(start.getUTCDate() - RANGE_DAYS_BACK[range])
    return {
      startTime: `${toUtcDate(start)}T00:00:00Z`,
      endTime: `${today}T23:59:59Z`,
    }
  }, [today, range])

  const {
    data: statusData,
    isLoading: statusLoading,
    error: statusError,
  } = useGetStatusTimelineGroups(
    tenantName ?? '',
    'public',
    selectedReport,
    startTime,
    endTime,
    !!selectedReport,
  )

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
      statusData={statusData}
      statusLoading={statusLoading}
      statusError={statusError ?? null}
      selectedReport={selectedReport}
      onReportChange={setSelectedReport}
      range={range}
      onRangeChange={setRange}
      startTime={startTime}
      endTime={endTime}
    />
  )
}

export default PublicStatusView
