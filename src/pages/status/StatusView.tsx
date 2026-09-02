import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from 'react'
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
  fmtStamp,
  localOffsetLabel,
  STATUS_RANGE_DAYS,
  STATUS_RANGES,
  STATUS_STYLES,
  type StatusRangeId,
  type StatusSegment,
  type TimeZoneMode,
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

const LEVEL_LABEL = ['Group', 'Service type', 'Endpoint', 'Metric']

const INDENT = 14

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

const ROW_HEIGHT = 44

const MIN_ZOOM_SPAN_MS = 5 * 60 * 1000

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

const SegmentTooltip = ({
  segment,
  pct,
  rowIndex,
  tz,
}: {
  segment: StatusSegment
  pct: number
  rowIndex: number
  tz: TimeZoneMode
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
        {fmtStamp(segment.start, tz)} → {fmtStamp(segment.end, tz)}
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

const HorizontalScrollbar = ({
  baseStart,
  baseEnd,
  windowStart,
  windowEnd,
  onPan,
}: {
  baseStart: number
  baseEnd: number
  windowStart: number
  windowEnd: number
  onPan: (start: number, end: number) => void
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<{
    startX: number
    startWindow: { start: number; end: number }
  } | null>(null)

  const baseSpan = baseEnd - baseStart
  const span = windowEnd - windowStart
  const leftPct = ((windowStart - baseStart) / baseSpan) * 100
  const widthPct = (span / baseSpan) * 100

  const handleThumbPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = {
      startX: e.clientX,
      startWindow: { start: windowStart, end: windowEnd },
    }
  }

  const handleThumbPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag) return
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return

    const dx = e.clientX - drag.startX
    const spanMs = drag.startWindow.end - drag.startWindow.start
    const shiftMs = (dx / rect.width) * baseSpan

    let newStart = drag.startWindow.start + shiftMs
    let newEnd = drag.startWindow.end + shiftMs
    if (newStart < baseStart) {
      newStart = baseStart
      newEnd = newStart + spanMs
    }
    if (newEnd > baseEnd) {
      newEnd = baseEnd
      newStart = newEnd - spanMs
    }
    onPan(newStart, newEnd)
  }

  const handleThumbPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    dragRef.current = null
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  const handleTrackClick = (e: MouseEvent<HTMLDivElement>) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return
    const clickTime =
      baseStart + ((e.clientX - rect.left) / rect.width) * baseSpan

    let newStart = clickTime - span / 2
    let newEnd = newStart + span
    if (newStart < baseStart) {
      newStart = baseStart
      newEnd = newStart + span
    }
    if (newEnd > baseEnd) {
      newEnd = baseEnd
      newStart = newEnd - span
    }
    onPan(newStart, newEnd)
  }

  return (
    <div
      ref={trackRef}
      onClick={handleTrackClick}
      className="relative h-2.5 cursor-pointer rounded-full bg-neutral-100"
      role="scrollbar"
      aria-orientation="horizontal"
      aria-controls="status-timeline-track"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(leftPct)}
      title="Drag to pan"
    >
      <div
        onPointerDown={handleThumbPointerDown}
        onPointerMove={handleThumbPointerMove}
        onPointerUp={handleThumbPointerUp}
        onPointerCancel={handleThumbPointerUp}
        className="absolute inset-y-0 cursor-grab touch-none rounded-full bg-neutral-400 transition-colors hover:bg-neutral-500 active:cursor-grabbing"
        style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 4)}%` }}
      />
    </div>
  )
}

export interface StatusViewProps {
  tenantName: string
  reports: Array<{ name: string; public?: boolean }> | undefined
  reportsLoading: boolean
  reportsError: Error | null
  rows: StatusRow[]
  statusLoading: boolean
  statusError: Error | null
  onToggle: (depth: number, name: string) => void
  selectedReport: string
  onReportChange: (name: string) => void
  range: StatusRangeId
  onRangeChange: (range: StatusRangeId) => void
  tz: TimeZoneMode
  onTzChange: (tz: TimeZoneMode) => void
  startDate: string
  endDate: string
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
  tz,
  onTzChange,
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

  const [scrubEl, setScrubEl] = useState<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)

  const [mountNow] = useState(() => Date.now())

  const stepDays = STATUS_RANGE_DAYS[range]
  const stepLabel = `${stepDays} day${stepDays > 1 ? 's' : ''}`

  const baseStart = Date.parse(startTime)
  const baseEnd = Date.parse(endTime)
  const baseSpan = baseEnd - baseStart

  const [zoom, setZoom] = useState<{ start: number; end: number } | null>(null)

  useEffect(() => {
    setZoom(null)
  }, [startTime, endTime])

  const windowStart = zoom?.start ?? baseStart
  const windowEnd = zoom?.end ?? baseEnd
  const span = windowEnd - windowStart

  const nowMs = nowTime ? Date.parse(nowTime) : mountNow
  const dataEnd = Number.isFinite(nowMs)
    ? Math.min(nowMs, windowEnd)
    : windowEnd
  const nowPct =
    Number.isFinite(nowMs) && nowMs > windowStart && nowMs < windowEnd
      ? ((nowMs - windowStart) / span) * 100
      : null

  const pinnedPct =
    pinnedTime !== null && pinnedTime >= windowStart && pinnedTime <= windowEnd
      ? ((pinnedTime - windowStart) / span) * 100
      : null

  const ticks = useMemo(
    () => buildStatusDivisions(windowStart, windowEnd, tz),
    [windowStart, windowEnd, tz],
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
        label: row.depth === 2 ? stripIdSuffix(row.name) : row.name,
        segments,
        current: segments[segments.length - 1],
      }
    })
  }, [statusRows, windowStart, windowEnd, dataEnd])

  const hasVisibleStatusData = rows.some(
    (row) =>
      row.kind === 'node' && row.segments.some((s) => s.value !== 'MISSING'),
  )

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

  const pctFromClientX = (clientX: number): number | null => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return null
    const x = clientX - rect.left
    if (x < 0 || x > rect.width) return null
    return (x / rect.width) * 100
  }

  const pctFromEvent = (e: MouseEvent<HTMLDivElement>): number | null =>
    pctFromClientX(e.clientX)

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

  const zoomStateRef = useRef({
    windowStart,
    windowEnd,
    span,
    baseStart,
    baseEnd,
    baseSpan,
  })
  zoomStateRef.current = {
    windowStart,
    windowEnd,
    span,
    baseStart,
    baseEnd,
    baseSpan,
  }

  // keep window inside the available data range
  const clampPan = (
    start: number,
    end: number,
    spanMs: number,
    bs: number,
    be: number,
  ) => {
    let s = start
    let e = end
    if (s < bs) {
      s = bs
      e = s + spanMs
    }
    if (e > be) {
      e = be
      s = e - spanMs
    }
    return { start: s, end: e }
  }

  // set zoom window in state
  const applyWindow = (
    start: number,
    end: number,
    spanMs: number,
    bSpan: number,
  ) => {
    if (spanMs >= bSpan - 1000) {
      setZoom(null)
    } else {
      setZoom({ start, end })
    }
  }

  // Attach the mouse wheel listener for zooming
  useEffect(() => {
    const el = scrubEl
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      const pct = pctFromClientX(e.clientX)
      if (pct === null) return

      if (!e.ctrlKey && !e.metaKey) return

      e.preventDefault()

      const {
        windowStart: ws,
        span: sp,
        baseStart: bs,
        baseEnd: be,
        baseSpan: bSpan,
      } = zoomStateRef.current

      const anchorTime = ws + (sp * pct) / 100
      const zoomFactor = Math.exp(-e.deltaY * 0.0015)
      let newSpan = sp / zoomFactor
      newSpan = Math.min(Math.max(newSpan, MIN_ZOOM_SPAN_MS), bSpan)

      let newStart = anchorTime - (anchorTime - ws) * (newSpan / sp)
      let newEnd = newStart + newSpan

      const clamped = clampPan(newStart, newEnd, newSpan, bs, be)
      newStart = clamped.start
      newEnd = clamped.end

      applyWindow(newStart, newEnd, newSpan, bSpan)
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [scrubEl])

  const hoverTime =
    hoverPct === null ? null : windowStart + (span * hoverPct) / 100

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

  const noData =
    !zoom &&
    !isLoading &&
    !error &&
    (rows.length === 0 || !hasVisibleStatusData)

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
                  label={fmtStamp(windowStart, tz)}
                  value={startDate}
                  max={maxStartDate}
                  onChange={onStartDateChange}
                  title={`Pick the first day of the window (${
                    tz === 'utc' ? 'UTC' : localOffsetLabel()
                  })`}
                  ariaLabel={`Window starts ${startDate}. Pick another date.`}
                />
                <span aria-hidden>→</span>
                <EditableStamp
                  label={fmtStamp(windowEnd, tz)}
                  value={endDate}
                  max={maxEndDate}
                  onChange={onEndDateChange}
                  title={`Pick the last day of the window (${
                    tz === 'utc' ? 'UTC' : localOffsetLabel()
                  })`}
                  ariaLabel={`Window ends ${endDate}. Pick another date.`}
                />
                <span className="text-neutral-400">
                  · {tz === 'utc' ? 'UTC' : localOffsetLabel()}
                </span>
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

              <div
                className="flex gap-0.5 rounded border border-neutral-200 p-0.5"
                role="group"
                aria-label="Timezone display"
              >
                {(['utc', 'local'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onTzChange(t)}
                    className={`cursor-pointer rounded px-1.5 py-0.5 text-[11px] font-medium uppercase tabular-nums transition-colors ${
                      tz === t
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
                    }`}
                    title={
                      t === 'utc'
                        ? 'Show and pick dates in UTC'
                        : `Show and pick dates in your local timezone (${localOffsetLabel()})`
                    }
                    aria-pressed={tz === t}
                  >
                    {t === 'utc' ? 'UTC' : 'Local'}
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

          <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
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
            <div>
              {zoom && (
                <button
                  type="button"
                  onClick={() => setZoom(null)}
                  className="ml-1 cursor-pointer bg-amber-300 rounded me-2 border border-amber-500 px-2 py-0.5 text-[11px] text-neutral-600 transition-colors hover:bg-amber-100 hover:text-neutral-900"
                  title="Reset zoom"
                >
                  Reset zoom
                </button>
              )}
              {!noData && (
                <span className="text-[11px] text-neutral-400">
                  Ctrl/Cmd + scroll to zoom
                </span>
              )}
            </div>
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
              ref={setScrubEl}
              className="relative cursor-crosshair"
              onMouseMove={handleScrub}
              onMouseLeave={clearHover}
              onClick={handlePin}
              title="Ctrl/Cmd+scroll to zoom"
            >
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
                        {fmtStamp(pinnedTime, tz)}
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
                        {fmtStamp(hoverTime, tz)}
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
                {zoom && (
                  <div className={`${GRID} pt-1.5`}>
                    <div />
                    <HorizontalScrollbar
                      baseStart={baseStart}
                      baseEnd={baseEnd}
                      windowStart={windowStart}
                      windowEnd={windowEnd}
                      onPan={(start, end) => setZoom({ start, end })}
                    />
                  </div>
                )}
              </div>

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
                          tz={tz}
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
