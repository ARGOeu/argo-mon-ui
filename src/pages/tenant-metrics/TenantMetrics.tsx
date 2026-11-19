import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Layers, TriangleAlert } from 'lucide-react'
import ErrorDisplay from '@/components/ErrorDisplay'
import LoadingSpinner from '@/components/LoadingSpinner'
import PageHeader from '@/components/PageHeader'
import SearchInput from '@/components/SearchInput'
import SelectDropdown from '@/components/SelectDropdown'
import MetricResultCard from './MetricResultCard'
import {
  METRIC_STATUSES,
  METRIC_STATUS_STYLES,
  countMetricsByStatus,
  getMetricStatus,
  isProblemStatus,
  sortLatestMetrics,
  type MetricStatus,
} from '@/utils/latestMetrics'
import { buildReportOptions } from '@/utils/reportVisibilityOptions'
import type { LatestMetricData } from '@/types/latestProblems'

const alwaysShownStatuses: MetricStatus[] = ['critical', 'warning', 'ok']

type StatusFilter = 'problems' | 'all' | MetricStatus

const metricKey = (metric: LatestMetricData) =>
  `${metric.endpoint_group}|${metric.service}|${metric.endpoint}|${metric.metric}|${metric.timestamp}`

const matchesFilter = (
  metric: LatestMetricData,
  filter: StatusFilter,
): boolean => {
  if (filter === 'all') {
    return true
  }
  const status = getMetricStatus(metric.status)
  return filter === 'problems' ? isProblemStatus(status) : status === filter
}

const matchesSearch = (metric: LatestMetricData, query: string): boolean =>
  [metric.metric, metric.endpoint, metric.service, metric.endpoint_group]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(query))

interface SummaryTileProps {
  label: string
  value: number
  valueClassName?: string
  icon: ReactNode
  children: ReactNode
}

const SummaryTile = ({
  label,
  value,
  valueClassName = 'text-foreground',
  icon,
  children,
}: SummaryTileProps) => (
  <div className="min-w-48 flex-1 rounded-lg border border-line bg-white px-4 py-3">
    <div className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
      {label}
      {icon}
    </div>
    <p
      className={`mt-1.5 text-[26px] font-bold leading-none tabular-nums ${valueClassName}`}
    >
      {value}
    </p>
    <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted">
      {children}
    </p>
  </div>
)

interface StatusCountProps {
  status: MetricStatus
  count: number
}

const StatusCount = ({ status, count }: StatusCountProps) => (
  <span className="inline-flex items-center gap-1">
    <span
      className={`size-1.5 rounded-full ${METRIC_STATUS_STYLES[status].dot}`}
    />
    {count} {METRIC_STATUS_STYLES[status].label}
  </span>
)

interface TenantMetricsProps {
  tenantName: string
  reports: Array<{ name: string; public?: boolean }> | undefined
  reportsLoading: boolean
  reportsError: Error | null
  selectedReport: string
  onReportChange: (name: string) => void
  getStatusHref: (metric: LatestMetricData) => string
  metrics: LatestMetricData[] | undefined
  metricsLoading: boolean
  metricsError: Error | null
}

const TenantMetrics = ({
  tenantName,
  reports,
  reportsLoading,
  reportsError,
  selectedReport,
  onReportChange,
  getStatusHref,
  metrics,
  metricsLoading,
  metricsError,
}: TenantMetricsProps) => {
  const [filter, setFilter] = useState<StatusFilter>('problems')
  const [search, setSearch] = useState('')
  const [now, setNow] = useState(() => Date.now())

  // Refresh the time every 30 seconds so the relative times stay correct
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  const allMetrics = useMemo(() => sortLatestMetrics(metrics ?? []), [metrics])
  const total = allMetrics.length
  const counts = countMetricsByStatus(allMetrics)
  const problemCount = counts.critical + counts.warning

  const query = search.trim().toLowerCase()
  const filtered = allMetrics.filter(
    (metric) =>
      matchesFilter(metric, filter) && (!query || matchesSearch(metric, query)),
  )

  // Problems and All metrics show mixed statuses, so they sort by severity too
  const sortLabel =
    filter === 'problems' || filter === 'all'
      ? 'severity & timestamp'
      : 'timestamp'

  const chips: { id: StatusFilter; label: string; count: number }[] = [
    { id: 'problems', label: 'Problems', count: problemCount },
    ...METRIC_STATUSES.filter(
      (status) => alwaysShownStatuses.includes(status) || counts[status] > 0,
    ).map((status) => ({
      id: status,
      label: METRIC_STATUS_STYLES[status].label,
      count: counts[status],
    })),
    { id: 'all', label: 'All Metrics', count: total },
  ]

  const hasMultipleReports = (reports?.length ?? 0) > 1
  const hasNoReports = reports?.length === 0
  const isWaitingForReport = !!reports?.length && !selectedReport
  const isLoading = reportsLoading || isWaitingForReport || metricsLoading
  const error = reportsError ?? metricsError

  const renderEmptyState = () => {
    if (total === 0) {
      return (
        <p className="py-10 text-center text-sm text-muted">
          No metric results for this report yet
        </p>
      )
    }

    if (filter === 'problems' && !query) {
      return (
        <div className="flex flex-col items-center gap-1 py-8 text-center">
          <p className="text-sm text-foreground">No problems found</p>
          <p className="text-xs text-muted">
            No metric has a critical or warning result
          </p>
        </div>
      )
    }

    return (
      <p className="py-8 text-center text-sm text-foreground">
        No metrics match the current filters
      </p>
    )
  }

  return (
    <div className="page-container mb-8">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Metrics Monitoring Dashboard"
          subtitle={
            <>
              Latest check results for each metric of{' '}
              <strong>{tenantName}</strong>
              {reports?.length === 1 && selectedReport && (
                <>
                  {' · '}
                  <strong>{selectedReport}</strong> report
                </>
              )}
            </>
          }
          className="items-start"
        />
        {hasMultipleReports && (
          <div className="flex items-center gap-2 sm:shrink-0">
            <span className="whitespace-nowrap text-[15px] font-semibold text-body">
              Select a report:
            </span>
            <SelectDropdown
              value={selectedReport}
              onChange={onReportChange}
              options={buildReportOptions(reports)}
              className="w-[220px]"
            />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="loading-container">
          <LoadingSpinner size="md" />
        </div>
      ) : error ? (
        <ErrorDisplay
          error={error}
          context={reportsError ? 'tenant reports' : 'latest metric results'}
        />
      ) : hasNoReports ? (
        <p className="rounded-lg bg-surface-muted px-8 py-5 text-center text-base italic text-muted">
          This tenant has no reports yet.
        </p>
      ) : (
        <>
          <div className="mb-4 flex max-w-xl flex-wrap gap-8">
            <SummaryTile
              label="Active Metrics"
              value={problemCount}
              valueClassName={
                problemCount > 0 ? 'text-red-600' : 'text-foreground'
              }
              icon={
                <TriangleAlert
                  className="size-4 text-red-500"
                  aria-hidden="true"
                />
              }
            >
              <StatusCount status="critical" count={counts.critical} />
              <StatusCount status="warning" count={counts.warning} />
            </SummaryTile>
            <SummaryTile
              label="Metrics evaluated"
              value={total}
              icon={<Layers className="size-4 text-brand" aria-hidden="true" />}
            >
              <StatusCount status="ok" count={counts.ok} />
            </SummaryTile>
          </div>

          <div className="mb-1.5 rounded-lg border border-line bg-white p-3">
            <div className="flex flex-col xl:flex-row xl:items-center xl:gap-8">
              <SearchInput
                value={search}
                onChange={setSearch}
                onClear={() => setSearch('')}
                placeholder="Search metric, endpoint or group"
                maxWidth="max-w-md"
                className="mb-4 xl:mb-0 xl:w-96 xl:shrink-0"
              />
              <div
                className="flex flex-wrap gap-1.5"
                role="group"
                aria-label="Filter by status"
              >
                {chips.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setFilter(chip.id)}
                    aria-pressed={filter === chip.id}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
                      filter === chip.id
                        ? 'border-foreground bg-foreground text-white'
                        : 'border-line-strong bg-white text-body hover:border-muted'
                    }`}
                  >
                    {chip.label}
                    <span
                      className={
                        filter === chip.id ? 'text-subtle' : 'text-muted'
                      }
                    >
                      {chip.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm text-muted">
            <span>
              Showing {filtered.length}{' '}
              {filtered.length === 1 ? 'metric' : 'metrics'}
            </span>
            <span>Sorted by: {sortLabel}</span>
          </div>

          {filtered.length === 0 ? (
            renderEmptyState()
          ) : (
            <ul className="space-y-4">
              {filtered.map((metric) => (
                <MetricResultCard
                  key={metricKey(metric)}
                  metric={metric}
                  statusHref={getStatusHref(metric)}
                  now={now}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}

export default TenantMetrics
