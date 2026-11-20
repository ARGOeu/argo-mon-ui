import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, ChevronDown, ChevronRight, Clock } from 'lucide-react'
import Badge from '@/components/Badge'
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

const SUMMARY_TEXT_CLASSES: Record<MetricStatus, string> = {
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
  // The summary is the first line of the output, the message follows it
  const hasMessage = output !== '' && output !== metric.summary
  const hasOutput = !!metric.summary || hasMessage

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
            <div
              id={outputId}
              className="mt-1 max-h-56 overflow-auto rounded-md bg-surface-muted p-2"
            >
              {metric.summary && (
                <p
                  className={`break-words font-mono text-xs leading-relaxed ${SUMMARY_TEXT_CLASSES[status]}`}
                >
                  {metric.summary}
                </p>
              )}
              {metric.summary && hasMessage && (
                <hr className="my-2 border-line-strong" />
              )}
              {hasMessage && (
                <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-body">
                  {output}
                </pre>
              )}
            </div>
          )}
        </>
      )}
    </li>
  )
}

export default MetricResultCard
