import { useState } from 'react'
import { BarChart3, Check, Copy, ExternalLink, ShieldCheck } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import type {
  MetricsResponse,
  MetricsQueryParams,
  MetricsEndpointMode,
} from '@/types/capability'
import MetricsTable from './MetricsTable'
import ResponseJsonPanel from './ResponseJsonPanel'
import YmdDateInput from './YmdDateInput'

const BASE_URL = import.meta.env.VITE_BACKEND_URI

const buildQueryString = (params: MetricsQueryParams): string => {
  const query = new URLSearchParams()
  if (params.startDate) query.append('start-date', params.startDate)
  if (params.endDate) query.append('end-date', params.endDate)
  if (params.granularity) query.append('granularity', params.granularity)
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

interface CapabilityContentProps {
  mode: MetricsEndpointMode
  onModeChange: (mode: MetricsEndpointMode) => void
  knownServices: string[]
  serviceId: string
  onServiceIdChange: (id: string) => void
  params: MetricsQueryParams
  onParamsChange: (params: MetricsQueryParams) => void
  data?: MetricsResponse
  isLoading: boolean
  error: Error | null
  endpointPath: string
}

const CapabilityContent = ({
  mode,
  onModeChange,
  knownServices,
  serviceId,
  onServiceIdChange,
  params,
  onParamsChange,
  data,
  isLoading,
  error,
  endpointPath,
}: CapabilityContentProps) => {
  const [requestFormat, setRequestFormat] = useState<'url' | 'curl'>('url')
  const [copied, setCopied] = useState(false)

  const queryString = buildQueryString(params)
  const fullUrl = `${BASE_URL}${endpointPath}${queryString}`
  const curlCommand = `curl "${fullUrl}"`
  const requestText = requestFormat === 'url' ? fullUrl : curlCommand

  const handleCopy = () => {
    navigator.clipboard?.writeText(requestText)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const updateParam = (key: keyof MetricsQueryParams, value: string) => {
    const next: Record<string, string> = { ...params }
    if (!value) {
      delete next[key]
    } else {
      next[key] = value
      if (key === 'startDate' && !next.endDate) {
        next.endDate = value
      } else if (key === 'endDate' && !next.startDate) {
        next.startDate = value
      }
    }
    onParamsChange(next as MetricsQueryParams)
  }

  const canRequestService = mode !== 'service' || !!serviceId

  return (
    <section className="rounded-lg border border-line bg-white px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-50">
            <BarChart3 className="size-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Metrics</h3>
            <p className="text-sm text-slate-500">
              Availability, reliability and uptime
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs  tracking-wide text-slate-500 hover:text-slate-700">
            Related Docs:
          </span>
          <a
            href={'https://argoeu.github.io/argo-monitoring/docs/monfed/'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex font-semibold items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700"
          >
            Guide
            <ExternalLink className="size-3" />
          </a>
          <a
            href={
              'https://argoeu.github.io/argo-monitoring/openapi/explore.html#/metrics'
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex  font-semibold items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700"
          >
            Specification
            <ExternalLink className="size-3" />
          </a>
        </div>
      </div>

      <p className="mt-2 max-w-2xl text-sm text-slate-600">
        Get Monitoring Metrics (Availability, Reliability, Uptime) for nodes'
        services
      </p>

      <div className="mt-4 inline-flex rounded-lg bg-slate-100 p-1">
        <button
          onClick={() => onModeChange('all')}
          className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
            mode === 'all'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          All services
        </button>
        <button
          onClick={() => onModeChange('service')}
          className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
            mode === 'service'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Specific service
        </button>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            API access
          </div>
          <div className="inline-flex rounded-md bg-slate-100 p-0.5">
            <button
              onClick={() => setRequestFormat('url')}
              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                requestFormat === 'url'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              URL
            </button>
            <button
              onClick={() => setRequestFormat('curl')}
              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                requestFormat === 'curl'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              curl
            </button>
          </div>
        </div>

        <div className="relative mt-1.5 overflow-x-auto rounded-lg bg-slate-900 px-3 py-2 font-mono text-sm text-emerald-400">
          <pre className="whitespace-pre-wrap break-all pr-8">
            {requestText}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute right-2 top-2 rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Copy request"
          >
            {copied ? (
              <Check className="size-4" />
            ) : (
              <Copy className="size-4" />
            )}
          </button>
        </div>

        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="size-3.5" />
          Public endpoint — no authentication required.
        </p>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200">
        <div className="hidden rounded-t-lg bg-slate-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:grid sm:grid-cols-[120px_160px_1fr] sm:gap-4">
          <span>Parameter</span>
          <span>Value</span>
          <span>Description</span>
        </div>

        {mode === 'service' && (
          <div className="grid grid-cols-1 gap-x-4 gap-y-1 border-t border-slate-100 px-3 py-1.5 sm:grid-cols-[120px_160px_1fr] sm:items-center sm:gap-y-0">
            <div className="font-mono text-xs font-semibold text-slate-700">
              service-id
            </div>
            <select
              value={serviceId}
              onChange={(e) => onServiceIdChange(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-sm text-slate-800"
            >
              {knownServices.length === 0 && (
                <option value="">Loading services…</option>
              )}
              {knownServices.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <p className="text-xs leading-relaxed text-slate-400">
              Fetch metrics for a specific service
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-x-4 gap-y-1 border-t border-slate-100 px-3 py-1.5 sm:grid-cols-[120px_160px_1fr] sm:items-center sm:gap-y-0">
          <div className="font-mono text-xs font-semibold text-slate-700">
            start-date
          </div>
          <YmdDateInput
            value={params.startDate ?? ''}
            onChange={(v) => updateParam('startDate', v)}
            max={params.endDate || undefined}
            className="w-full rounded-lg border border-slate-200 px-2.5 py-1 pr-8 text-sm text-slate-800"
          />
          <p className="text-xs leading-relaxed text-slate-400">
            (Optional) Specify a period's start-date using YYYY-MM-DD format
            Combine with end-date. Omit both for the default range.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-4 gap-y-1 border-t border-slate-100 px-3 py-1.5 sm:grid-cols-[120px_160px_1fr] sm:items-center sm:gap-y-0">
          <div className="font-mono text-xs font-semibold text-slate-700">
            end-date
          </div>
          <YmdDateInput
            value={params.endDate ?? ''}
            onChange={(v) => updateParam('endDate', v)}
            min={params.startDate || undefined}
            className="w-full rounded-lg border border-slate-200 px-2.5 py-1 pr-8 text-sm text-slate-800"
          />
          <p className="text-xs leading-relaxed text-slate-400">
            (Optional) Specify a period's end-date using YYYY-MM-DD format
            Combine with start-date. Omit both for the default range.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-4 gap-y-1 border-t border-slate-100 px-3 py-1.5 sm:grid-cols-[120px_160px_1fr] sm:items-center sm:gap-y-0">
          <div className="font-mono text-xs font-semibold text-slate-700">
            granularity
          </div>
          <select
            value={params.granularity ?? 'daily'}
            onChange={(e) => updateParam('granularity', e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-sm text-slate-800"
          >
            <option value="daily">daily</option>
            <option value="monthly">monthly</option>
          </select>
          <p className="text-xs leading-relaxed text-slate-400">
            (Optional) Aggregation of results: daily or monthly. Defaults to
            daily.
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Results
        </div>
        <div className="mt-1.5">
          {!canRequestService ? (
            <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-400">
              Select a service above to run this request.
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : error ? (
            <ErrorDisplay error={error} context="metrics" />
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]">
              <MetricsTable data={data} />
              <ResponseJsonPanel data={data} />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default CapabilityContent
