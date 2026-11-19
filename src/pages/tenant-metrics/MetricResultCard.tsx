import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, ChevronDown, ChevronRight, Clock } from 'lucide-react'
import Badge from '@/components/Badge'
import CopyButton from '@/components/CopyButton'
import { stripIdSuffix } from '@/utils/cleanup'
import { formatDateTime } from '@/utils/formatDateTime'
import {
  METRIC_STATUS_STYLES,
  cleanMetricOutput,
  getMetricStatus,
  type MetricStatus,
} from '@/utils/latestMetrics'
import { formatRelativeTime } from '@/utils/latestProblems'
import type { LatestMetricData } from '@/types/latestProblems'

const MESSAGE_TEXT_CLASSES: Record<MetricStatus, string> = {
  critical: 'text-red-700',
  warning: 'text-amber-700',
  unknown: 'text-body',
  missing: 'text-body',
  ok: 'text-body',
}

interface MetricResultCardProps {
  metric: LatestMetricData
  statusHref: string
  now: number
}

const MetricResultCard = ({
  metric,
  statusHref,
  now,
}: MetricResultCardProps) => {
  const [showOutput, setShowOutput] = useState(false)
  const outputId = useId()

  const status = getMetricStatus(metric.status)
  const style = METRIC_STATUS_STYLES[status]
  const output = cleanMetricOutput(metric.message)
  const hasOutput = output !== '' && output !== metric.summary

  return (
    <li
      className={`rounded-lg border border-l-4 border-line bg-white px-4 py-3 ${style.accent}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1.5">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <Badge size="xs" className={`ring-1 ring-inset ${style.pill}`}>
            {style.label}
          </Badge>
          <span className="rounded bg-brand-subtle px-1.5 py-0.5 text-xs font-medium text-brand">
            {metric.service}
          </span>
          <span
            aria-hidden="true"
            className="hidden size-0.75 shrink-0 rounded-full bg-subtle sm:block"
          />
          <span className="min-w-0 break-all text-sm text-body">
            {stripIdSuffix(metric.endpoint)}
          </span>
          <span className="text-sm text-muted">({metric.endpoint_group})</span>
        </div>
        <time
          dateTime={metric.timestamp}
          title={formatDateTime(metric.timestamp, {
            seconds: true,
            utcSuffix: true,
          })}
          className="inline-flex items-center gap-1 whitespace-nowrap text-xs tabular-nums text-muted"
        >
          <Clock className="size-3.5" strokeWidth={2} aria-hidden="true" />
          {formatRelativeTime(metric.timestamp, now)}
        </time>
      </div>

      <p className="mt-1.5 font-mono text-sm font-semibold text-foreground">
        <Link
          to={statusHref}
          title="Open this metric on the status timeline"
          className="group/metric inline-flex max-w-full items-start gap-1 rounded no-underline transition-colors hover:text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          <span className="break-all">{metric.metric}</span>
          <ArrowUpRight
            className="mt-1 size-3.5 shrink-0 text-subtle transition-colors group-hover/metric:text-brand"
            strokeWidth={2}
          />
        </Link>
      </p>

      {metric.summary && (
        <div className="mt-2 flex items-start gap-2 rounded-md border border-line bg-surface-muted py-1.5 pl-3 pr-1.5">
          <p
            className={`min-w-0 flex-1 break-words py-0.5 font-mono text-xs leading-5 ${MESSAGE_TEXT_CLASSES[status]}`}
          >
            {metric.summary}
          </p>
          <CopyButton value={metric.summary} label="Copy message" />
        </div>
      )}

      {hasOutput && (
        <>
          <button
            type="button"
            onClick={() => setShowOutput((prev) => !prev)}
            aria-expanded={showOutput}
            aria-controls={outputId}
            className="mt-1.5 inline-flex cursor-pointer items-center gap-0.5 rounded text-xs text-muted hover:text-foreground"
          >
            {showOutput ? (
              <ChevronDown className="size-3" strokeWidth={2} />
            ) : (
              <ChevronRight className="size-3" strokeWidth={2} />
            )}
            {showOutput ? 'Hide output' : 'Show output'}
          </button>
          {showOutput && (
            <pre
              id={outputId}
              className="mt-1 max-h-56 overflow-auto whitespace-pre-wrap break-words rounded-md bg-surface-muted p-2 font-mono text-xs leading-relaxed text-body"
            >
              {output}
            </pre>
          )}
        </>
      )}
    </li>
  )
}

export default MetricResultCard
