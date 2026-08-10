import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useGetTenantReports } from '@/hooks/useTenants'
import { useGetStatusTimelineGroups } from '@/hooks/useStatusTimeline'
import { useSelectedTenant } from '@/contexts/selected-tenant/useSelectedTenant'
import type { StatusRangeId } from '@/utils/statusTimeline'
import StatusView from './StatusView'

const toUtcDate = (d: Date) => d.toISOString().split('T')[0]

const RANGE_DAYS_BACK: Record<StatusRangeId, number> = {
  today: 0,
  '3d': 2,
  '7d': 6,
}

const PrivateStatusView = () => {
  const { id: tenantId } = useParams<{ id: string }>()
  const { tenant } = useSelectedTenant()
  const tenantName = tenant?.info?.name ?? ''

  const [selectedReport, setSelectedReport] = useState('')
  const [range, setRange] = useState<StatusRangeId>('today')

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
    tenantId ?? '',
    'private',
    selectedReport,
    startTime,
    endTime,
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

export default PrivateStatusView
