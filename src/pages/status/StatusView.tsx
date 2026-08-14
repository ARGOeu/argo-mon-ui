import { useMemo, useRef, useState, type MouseEvent } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Info, X } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import SearchInput from '@/components/SearchInput'
import SelectDropdown from '@/components/SelectDropdown'
import type { SelectOption } from '@/components/SelectDropdown'
import type { StatusEntry, StatusValue } from '@/types/statusTimeline'
import { stripIdSuffix } from '@/utils/cleanup'
import {
  buildSegments,
  buildStatusDivisions,
  fmtDuration,
  fmtUtcStamp,
  STATUS_RANGE_DAYS,
  STATUS_RANGES,
  STATUS_STYLES,
  type StatusRangeId,
  type StatusSegment,
} from '@/utils/statusTimeline'

const GRID = 'grid grid-cols-[120px_1fr] sm:grid-cols-[220px_1fr] gap-x-3'

const LEGEND_ORDER: StatusValue[] = [
  'OK',
  'WARNING',
  'CRITICAL',
  'DOWNTIME',
  'UNKNOWN',
  'MISSING',
]

/** Indexed by depth: 0 groups, 1 service types, 2 endpoints, 3 metrics. */
const LEVEL_LABEL = ['Group', 'Service type', 'Endpoint', 'Metric']

/** Each level steps in by this much inside the fixed-width name column. */
const INDENT = 14

// Foundational piece of the view - This represents one row with a single status timeline
export type StatusRow =
  | {
      kind: 'node'
      key: string
      name: string
      type?: string
      depth: number
      statuses: StatusEntry[]
      expandable: boolean
      expanded: boolean
    }
  | {
      kind: 'message'
      key: string
      depth: number
      state: 'loading' | 'error' | 'empty'
      message?: string
    }

const buildReportOptions = (
  reports: Array<{ name: string; public?: boolean }> | undefined,
): SelectOption[] =>
  (reports ?? []).map((r) => ({ value: r.name, label: r.name }))

// arrange tick labels correctly
const tickLabelStyle = (pct: number) => {
  if (pct < 3) return { left: 0, transform: 'none' }
  if (pct > 97) return { left: '100%', transform: 'translateX(-100%)' }
  return { left: `${pct}%`, transform: 'translateX(-50%)' }
}

type NodeRow = Extract<StatusRow, { kind: 'node' }>
type MessageRow = Extract<StatusRow, { kind: 'message' }>

type TimelineRow =
  | (NodeRow & {
      label: string
      segments: StatusSegment[]
      current: StatusSegment | undefined
    })
  | MessageRow

// Each timeline has a fixed row-height defined here
const ROW_HEIGHT = 44

// This is a status segment part of a timeline
const SegmentBar = ({ segment }: { segment: StatusSegment }) => (
  <div
    className={`absolute inset-y-0 ${STATUS_STYLES[segment.value].bar}`}
    style={{
      left: `${segment.leftPct}%`,
      width: `${segment.widthPct}%`,
      minWidth: '2px',
    }}
  />
)

// This is a tooltip that accompanies each status segment so that user can get more info when hovering over it
const SegmentTooltip = ({
  segment,
  pct,
  rowIndex,
}: {
  segment: StatusSegment
  pct: number
  rowIndex: number
}) => {
  const below = rowIndex === 0
  const tone = STATUS_STYLES[segment.value]

  return (
    <div
      className="pointer-events-none absolute z-30 whitespace-nowrap rounded-md bg-neutral-900 px-2.5 py-1.5 text-[11px] leading-snug text-white shadow-lg"
      style={{
        top: rowIndex * ROW_HEIGHT + (below ? ROW_HEIGHT - 4 : 4),
        transform: `translate(${
          pct < 12 ? '0' : pct > 88 ? '-100%' : '-50%'
        }, ${below ? '0' : '-100%'})`,
        left: `${pct < 12 ? 0 : pct > 88 ? 100 : pct}%`,
      }}
    >
      <div className="flex items-center gap-1.5 font-semibold">
        <span className={`h-2 w-2 rounded-[2px] ${tone.dot}`} />
        {tone.label}
      </div>
      <div className="mt-0.5 tabular-nums text-white/75">
        {fmtUtcStamp(segment.start)} → {fmtUtcStamp(segment.end)}
      </div>
      <div className="tabular-nums text-white/50">
        {fmtDuration(segment.end - segment.start)}
      </div>
    </div>
  )
}

const MESSAGE_TEXT: Record<MessageRow['state'], string> = {
  loading: 'Loading…',
  error: 'Could not load this level',
  empty: 'Nothing below this level',
}

const MessageRowContent = ({ row }: { row: MessageRow }) => (
  <div
    className="flex cursor-default items-center gap-2 text-xs text-neutral-400"
    style={{ paddingLeft: row.depth * INDENT + 20 }}
  >
    {row.state === 'loading' && <LoadingSpinner size="sm" />}
    <span className={row.state === 'error' ? 'text-red-600' : undefined}>
      {row.state === 'error' && row.message
        ? row.message
        : MESSAGE_TEXT[row.state]}
    </span>
  </div>
)

// Date picker where user can define from - to timestamps and change the view
const EditableStamp = ({
  label,
  value,
  max,
  onChange,
  title,
  ariaLabel,
}: {
  label: string
  value: string
  max: string
  onChange: (date: string) => void
  title: string
  ariaLabel: string
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const openPicker = () => {
    const input = inputRef.current
    if (!input) return
    // Where showPicker() isn't supported, focusing at least allows typing.
    if (typeof input.showPicker === 'function') {
      input.showPicker()
      return
    }
    input.focus()
  }

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={openPicker}
        className="inline-flex cursor-pointer items-center gap-1 rounded font-medium text-neutral-700 underline decoration-dotted underline-offset-2 transition-colors hover:text-neutral-900"
        title={title}
        aria-label={ariaLabel}
      >
        {label}
        <CalendarDays className="h-3 w-3" />
      </button>
      <input
        ref={inputRef}
        type="date"
        value={value}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
        tabIndex={-1}
        aria-hidden
      />
    </span>
  )
}

export interface StatusViewProps {
  tenantName: string
  reports: Array<{ name: string; public?: boolean }> | undefined
  reportsLoading: boolean
  reportsError: Error | null
  /** Groups, plus the children of whatever is open, already flattened. */
  rows: StatusRow[]
  statusLoading: boolean
  statusError: Error | null
  /** Opening a row closes whatever else was open at that depth. */
  onToggle: (depth: number, name: string) => void
  selectedReport: string
  onReportChange: (name: string) => void
  range: StatusRangeId
  onRangeChange: (range: StatusRangeId) => void
  /** Both ends of the window as YYYY-MM-DD; the length between them is fixed. */
  startDate: string
  endDate: string
  /** How far each picker may go — the start's cap leaves room for the length. */
  maxStartDate: string
  maxEndDate: string
  isCurrentWindow: boolean
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  onShiftWindow: (direction: -1 | 1) => void
  onJumpToNow: () => void
  startTime: string
  endTime: string
  nowTime?: string
}

const StatusView = ({
  tenantName,
  reports,
  reportsLoading,
  reportsError,
  rows: statusRows,
  statusLoading,
  statusError,
  onToggle,
  selectedReport,
  onReportChange,
  range,
  onRangeChange,
  startDate,
  endDate,
  maxStartDate,
  maxEndDate,
  isCurrentWindow,
  onStartDateChange,
  onEndDateChange,
  onShiftWindow,
  onJumpToNow,
  startTime,
  endTime,
  nowTime,
}: StatusViewProps) => {
  const [search, setSearch] = useState('')
  const [hoverPct, setHoverPct] = useState<number | null>(null)
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  const [pinnedTime, setPinnedTime] = useState<number | null>(null)

  const trackRef = useRef<HTMLDivElement | null>(null)

  const [mountNow] = useState(() => Date.now())

  // One arrow press moves the window by its own length.
  const stepDays = STATUS_RANGE_DAYS[range]
  const stepLabel = `${stepDays} day${stepDays > 1 ? 's' : ''}`

  const windowStart = Date.parse(startTime)
  const windowEnd = Date.parse(endTime)
  const span = windowEnd - windowStart

  const nowMs = nowTime ? Date.parse(nowTime) : mountNow
  const dataEnd = Number.isFinite(nowMs)
    ? Math.min(nowMs, windowEnd)
    : windowEnd
  const nowPct =
    Number.isFinite(nowMs) && nowMs > windowStart && nowMs < windowEnd
      ? ((nowMs - windowStart) / span) * 100
      : null

  // when a user pins a marker keep its position
  const pinnedPct =
    pinnedTime !== null && pinnedTime >= windowStart && pinnedTime <= windowEnd
      ? ((pinnedTime - windowStart) / span) * 100
      : null

  const ticks = useMemo(
    () => buildStatusDivisions(windowStart, windowEnd),
    [windowStart, windowEnd],
  )

  const rows = useMemo<TimelineRow[]>(() => {
    return statusRows.map((row) => {
      if (row.kind !== 'node') return row
      const segments = buildSegments(
        row.statuses,
        windowStart,
        windowEnd,
        dataEnd,
      )
      return {
        ...row,
        // if endpoint please remove suffixes from name
        label: row.depth === 2 ? stripIdSuffix(row.name) : row.name,
        segments,
        current: segments[segments.length - 1],
      }
    })
  }, [statusRows, windowStart, windowEnd, dataEnd])

  // keep the matched items from the filter
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows

    const keep = new Array<boolean>(rows.length).fill(false)
    const ancestors: number[] = []
    let matchDepth: number | null = null

    rows.forEach((row, i) => {
      if (matchDepth !== null && row.depth <= matchDepth) matchDepth = null

      if (matchDepth !== null) {
        keep[i] = true
        if (row.kind === 'node') ancestors[row.depth] = i
        return
      }

      if (row.kind === 'message') {
        keep[i] = row.depth > 0 && keep[ancestors[row.depth - 1]]
        return
      }

      ancestors[row.depth] = i
      if (row.label.toLowerCase().includes(q)) {
        keep[i] = true
        for (let d = 0; d < row.depth; d++) keep[ancestors[d]] = true
        matchDepth = row.depth
      }
    })

    return rows.filter((_, i) => keep[i])
  }, [rows, search])

  const pctFromEvent = (e: MouseEvent<HTMLDivElement>): number | null => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return null
    const x = e.clientX - rect.left
    if (x < 0 || x > rect.width) return null
    return (x / rect.width) * 100
  }

  const handleScrub = (e: MouseEvent<HTMLDivElement>) => {
    setHoverPct(pctFromEvent(e))
  }

  const handlePin = (e: MouseEvent<HTMLDivElement>) => {
    const pct = pctFromEvent(e)
    if (pct === null) return

    if (pinnedPct !== null && Math.abs(pinnedPct - pct) < 0.5) {
      setPinnedTime(null)
      return
    }
    setPinnedTime(windowStart + (span * pct) / 100)
  }

  const hoverTime =
    hoverPct === null ? null : windowStart + (span * hoverPct) / 100

  // if the marker is visible
  const delta =
    hoverTime === null || pinnedTime === null || pinnedPct === null
      ? null
      : hoverTime - pinnedTime

  const hoveredTimeline = hoveredRow === null ? undefined : filtered[hoveredRow]

  const activeSegment =
    hoverTime === null ||
    hoverTime > dataEnd ||
    hoveredTimeline === undefined ||
    hoveredTimeline.kind !== 'node'
      ? undefined
      : hoveredTimeline.segments.find(
          (s) => hoverTime >= s.start && hoverTime <= s.end,
        )

  const clearHover = () => {
    setHoverPct(null)
    setHoveredRow(null)
  }

  const isLoading = reportsLoading || statusLoading
  const error = reportsError || statusError
  const errorContext = reportsError ? 'tenant reports' : 'status timeline'
  const hasMultipleReports = (reports?.length ?? 0) > 1
  const noData = !isLoading && !error && rows.length === 0

  return (
    <div className="page-container">
      <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Status"
          subtitle={
            tenantName ? (
              <span>
                Status timelines for tenant <strong>{tenantName}</strong>
              </span>
            ) : undefined
          }
          className="items-start"
        />
        {hasMultipleReports && (
          <div className="flex items-center gap-2 sm:shrink-0">
            <span className="text-[15px] font-semibold text-body">
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

      {isLoading && rows.length === 0 ? (
        <div className="loading-container">
          <LoadingSpinner size="md" />
        </div>
      ) : error ? (
        <div className="my-12">
          <ErrorDisplay error={error} context={errorContext} />
        </div>
      ) : (
        <section className="rounded-xl border border-neutral-200 bg-white px-5 py-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <p className="flex flex-wrap items-center gap-1 text-[11px] tabular-nums text-neutral-500">
                <EditableStamp
                  label={fmtUtcStamp(windowStart)}
                  value={startDate}
                  max={maxStartDate}
                  onChange={onStartDateChange}
                  title="Pick the first day of the window"
                  ariaLabel={`Window starts ${startDate}. Pick another date.`}
                />
                <span aria-hidden>→</span>
                <EditableStamp
                  label={fmtUtcStamp(windowEnd)}
                  value={endDate}
                  max={maxEndDate}
                  onChange={onEndDateChange}
                  title="Pick the last day of the window"
                  ariaLabel={`Window ends ${endDate}. Pick another date.`}
                />
                <span className="text-neutral-400">· UTC</span>
              </p>

              <div className="flex gap-0.5">
                {STATUS_RANGES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => onRangeChange(r)}
                    className={`cursor-pointer rounded px-1.5 py-0.5 text-[11px] tabular-nums transition-colors ${
                      range === r
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
                    }`}
                    title={
                      isCurrentWindow ? `Last ${r}` : `${r} ending ${endDate}`
                    }
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => onShiftWindow(-1)}
                  className="cursor-pointer rounded p-1 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                  aria-label={`Back ${stepLabel}`}
                  title={`Back ${stepLabel}`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onShiftWindow(1)}
                  disabled={isCurrentWindow}
                  className="cursor-pointer rounded p-1 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:pointer-events-none disabled:opacity-30"
                  aria-label={`Forward ${stepLabel}`}
                  title={`Forward ${stepLabel}`}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                {!isCurrentWindow && (
                  <button
                    type="button"
                    onClick={onJumpToNow}
                    className="ml-1 cursor-pointer rounded border border-neutral-200 px-2 py-0.5 text-[11px] text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                    title="Back to the window ending today"
                  >
                    Now
                  </button>
                )}
              </div>
            </div>
            <SearchInput
              value={search}
              onChange={setSearch}
              onClear={() => setSearch('')}
              placeholder="Search groups…"
              maxWidth="max-w-[200px]"
              className="mb-0"
            />
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1">
            {LEGEND_ORDER.map((tone) => (
              <span
                key={tone}
                className="inline-flex items-center gap-1.5 text-[11px] text-neutral-500"
              >
                <span
                  className={`h-2.5 w-2.5 rounded-[2px] ${STATUS_STYLES[tone].dot}`}
                />
                {STATUS_STYLES[tone].label}
              </span>
            ))}
          </div>

          {noData ? (
            <div className="flex flex-col items-center justify-center px-12 py-10 text-center">
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-brand-subtle">
                <Info className="h-6 w-6 text-brand" />
              </div>
              <h3 className="mb-1 text-lg font-medium text-neutral-900">
                No status data for this window
              </h3>
              <p className="max-w-sm text-sm text-neutral-500">
                The "{selectedReport || 'selected'}" report has no data between
                the selected start and end time.
              </p>
            </div>
          ) : (
            <div
              className="relative cursor-crosshair"
              onMouseMove={handleScrub}
              onMouseLeave={clearHover}
              onClick={handlePin}
            >
              {/* Stick x-time-axis ruler on the top of the window */}
              <div className="sticky top-0 z-20 -mx-5 border-b border-neutral-200 bg-white px-5 pb-1 pt-2">
                <div className={GRID}>
                  <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-neutral-400">
                    Group
                  </span>
                  <div className="relative h-9">
                    {ticks.map((t) => (
                      <div key={t.time}>
                        <span
                          className={`absolute top-0 whitespace-nowrap text-[10px] tabular-nums ${
                            t.major
                              ? 'font-medium text-neutral-600'
                              : 'text-neutral-400'
                          }`}
                          style={tickLabelStyle(t.pct)}
                        >
                          {t.label}
                        </span>
                        <span
                          className={`absolute bottom-0 w-px ${
                            t.major
                              ? 'h-2.5 bg-neutral-400'
                              : 'h-1.5 bg-neutral-300'
                          }`}
                          style={{ left: `${t.pct}%` }}
                        />
                      </div>
                    ))}
                    {nowPct !== null && (
                      <span
                        className="absolute bottom-3 z-10 whitespace-nowrap rounded border border-neutral-900 bg-white px-1 text-[9px] font-semibold uppercase tracking-wide text-neutral-900"
                        style={tickLabelStyle(nowPct)}
                      >
                        now
                      </span>
                    )}
                    {pinnedTime !== null && pinnedPct !== null && (
                      <span
                        className="absolute top-4 z-20 inline-flex items-center gap-1 whitespace-nowrap rounded bg-sky-600 py-0.5 pl-1.5 pr-1 text-[10px] tabular-nums text-white"
                        style={tickLabelStyle(pinnedPct)}
                      >
                        {fmtUtcStamp(pinnedTime)}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setPinnedTime(null)
                          }}
                          className="cursor-pointer rounded-sm p-px transition-colors hover:bg-white/30"
                          aria-label="Clear marker"
                          title="Clear marker"
                        >
                          <X className="h-2.5 w-2.5" strokeWidth={3} />
                        </button>
                      </span>
                    )}
                    {hoverTime !== null && (
                      <span
                        className="pointer-events-none absolute top-4 z-10 whitespace-nowrap rounded bg-neutral-900 px-1.5 py-0.5 text-[10px] tabular-nums text-white"
                        style={tickLabelStyle(hoverPct ?? 0)}
                      >
                        {fmtUtcStamp(hoverTime)}
                        {delta !== null && Math.abs(delta) > 0 && (
                          <span className="ml-1.5 text-sky-300">
                            {delta < 0 ? '−' : '+'}
                            {fmtDuration(Math.abs(delta))}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Rows */}
              <div className="relative">
                {filtered.length === 0 && (
                  <p className="py-6 text-center text-neutral-400">
                    No groups match
                  </p>
                )}
                {filtered.map((row, index) => (
                  <div
                    key={row.key}
                    className={`${GRID} items-center border-b border-neutral-100 ${
                      row.depth > 0 ? 'bg-neutral-50/60' : ''
                    }`}
                    style={{ height: ROW_HEIGHT }}
                    onMouseEnter={() => setHoveredRow(index)}
                  >
                    {row.kind === 'message' ? (
                      <>
                        <MessageRowContent row={row} />
                        <div />
                      </>
                    ) : (
                      <>
                        {row.expandable ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              onToggle(row.depth, row.name)
                            }}
                            style={{ paddingLeft: row.depth * INDENT }}
                            className="group flex h-full min-w-0 cursor-pointer items-center gap-1.5 text-left"
                            aria-expanded={row.expanded}
                            aria-label={
                              row.expanded
                                ? `Collapse ${row.label}`
                                : `Expand ${row.label}`
                            }
                            title={`${LEVEL_LABEL[row.depth]}: ${row.label}${
                              row.type ? ` (${row.type})` : ''
                            }`}
                          >
                            <ChevronRight
                              className={`h-3.5 w-3.5 flex-shrink-0 text-neutral-400 transition-transform group-hover:text-neutral-700 ${
                                row.expanded ? 'rotate-90' : ''
                              }`}
                            />
                            <span
                              className={`h-2 w-2 flex-shrink-0 rounded-full ${
                                STATUS_STYLES[row.current?.value ?? 'MISSING']
                                  .dot
                              }`}
                            />
                            <span
                              className={`truncate transition-colors group-hover:text-brand ${
                                row.depth === 0
                                  ? 'text-sm font-medium text-neutral-800'
                                  : 'text-[13px] text-neutral-600'
                              }`}
                            >
                              {row.label}
                            </span>
                          </button>
                        ) : (
                          <div
                            className="flex min-w-0 cursor-default items-center gap-1.5"
                            style={{ paddingLeft: row.depth * INDENT }}
                          >
                            <span className="w-[14px] flex-shrink-0" />
                            <span
                              className={`h-2 w-2 flex-shrink-0 rounded-full ${
                                STATUS_STYLES[row.current?.value ?? 'MISSING']
                                  .dot
                              }`}
                            />
                            <span
                              className={`truncate ${
                                row.depth === 0
                                  ? 'text-sm font-medium text-neutral-800'
                                  : 'text-[13px] text-neutral-600'
                              }`}
                              title={`${LEVEL_LABEL[row.depth]}: ${row.label}${
                                row.type ? ` (${row.type})` : ''
                              }`}
                            >
                              {row.label}
                            </span>
                          </div>
                        )}

                        <div className="relative h-7 overflow-hidden rounded-[3px] bg-neutral-100 ring-1 ring-inset ring-neutral-200">
                          {ticks.map((t) => (
                            <div
                              key={t.time}
                              className="absolute inset-y-0 z-10 w-px bg-white/40"
                              style={{ left: `${t.pct}%` }}
                            />
                          ))}
                          {row.segments.map((s) => (
                            <SegmentBar key={s.key} segment={s} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}

                <div className={`${GRID} pointer-events-none absolute inset-0`}>
                  <div />
                  <div ref={trackRef} className="relative">
                    {nowPct !== null && (
                      <div
                        className="absolute inset-y-0 right-0 border-l border-neutral-900 bg-white/70 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(23,23,23,0.07)_4px,rgba(23,23,23,0.07)_8px)]"
                        style={{ left: `${nowPct}%` }}
                      />
                    )}
                    {pinnedPct !== null && (
                      <div
                        className="absolute inset-y-0 w-px bg-sky-600"
                        style={{ left: `${pinnedPct}%` }}
                      />
                    )}
                    {hoverPct !== null && (
                      <div
                        className="absolute inset-y-0 w-px bg-neutral-900/40"
                        style={{ left: `${hoverPct}%` }}
                      />
                    )}
                    {activeSegment &&
                      hoverPct !== null &&
                      hoveredRow !== null && (
                        <SegmentTooltip
                          segment={activeSegment}
                          pct={hoverPct}
                          rowIndex={hoveredRow}
                        />
                      )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

export default StatusView
