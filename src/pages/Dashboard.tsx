import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Search,
  Server,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import { useGetResultsGroups, useGetStatusGroups } from '@/hooks/useData'
import { useGetTenantReports } from '@/hooks/useTenants'
import { useSelectedTenant } from '@/contexts/selected-tenant/useSelectedTenant'
import TenantAvatar from '@/components/sidebar/TenantAvatar'

type ServiceStatus = 'healthy' | 'degraded' | 'critical'

interface Service {
  name: string
  status: ServiceStatus
  daily: number[]
  dailyDates: string[]
}

type FilterId = 'all' | 'problem' | 'healthy'

const mapStatusValue = (value: string): ServiceStatus => {
  const v = value?.toUpperCase()
  if (v === 'CRITICAL' || v === 'DOWN') return 'critical'
  if (v === 'WARNING' || v === 'DEGRADED') return 'degraded'
  return 'healthy'
}

const worstStatus = (values: string[]): ServiceStatus => {
  const mapped = values.map(mapStatusValue)
  if (mapped.includes('critical')) return 'critical'
  if (mapped.includes('degraded')) return 'degraded'
  return 'healthy'
}

const formatShortDay = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { weekday: 'short' })

const formatShortDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })

const uptimeTone = (pct: number) => {
  if (pct >= 99.99) return 'bg-emerald-500'
  if (pct >= 99.5) return 'bg-lime-500'
  if (pct >= 98) return 'bg-amber-500'
  return 'bg-red-500'
}

const STATUS_STYLES: Record<
  ServiceStatus,
  { dot: string; pill: string; text: string; label: string }
> = {
  healthy: {
    dot: 'bg-emerald-500',
    pill: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    text: 'text-emerald-700',
    label: 'Healthy',
  },
  degraded: {
    dot: 'bg-amber-500',
    pill: 'bg-amber-50 text-amber-800 ring-amber-600/20',
    text: 'text-amber-700',
    label: 'Degraded',
  },
  critical: {
    dot: 'bg-red-500',
    pill: 'bg-red-50 text-red-700 ring-red-600/20',
    text: 'text-red-700',
    label: 'Critical',
  },
}

const BANNER_STYLES: Record<
  ServiceStatus,
  {
    bg: string
    border: string
    icon: LucideIcon
    headline: string
    detail: string
    meta: string
  }
> = {
  healthy: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-700',
    icon: CheckCircle2,
    headline: 'text-emerald-900',
    detail: 'text-emerald-800/80',
    meta: 'text-emerald-800/60',
  },
  degraded: {
    bg: 'bg-amber-50',
    border: 'border-amber-700',
    icon: AlertTriangle,
    headline: 'text-amber-900',
    detail: 'text-amber-900/80',
    meta: 'text-amber-900/60',
  },
  critical: {
    bg: 'bg-red-50',
    border: 'border-red-700',
    icon: AlertOctagon,
    headline: 'text-red-900',
    detail: 'text-red-900/80',
    meta: 'text-red-900/60',
  },
}

const avg = (arr: number[]) =>
  arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length

interface NowItemProps {
  icon: LucideIcon
  label: string
  last?: boolean
  children: React.ReactNode
}

function NowItem({ icon: Icon, label, last, children }: NowItemProps) {
  return (
    <div
      className={`flex-1 min-w-[120px] px-4 py-2 ${
        last ? '' : 'border-r border-neutral-200'
      }`}
    >
      <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
        <Icon className="h-3 w-3" strokeWidth={2} />
        <span>{label}</span>
      </div>
      <div className="mt-0.5 flex items-baseline gap-1.5 text-[15px] font-medium text-neutral-900 tabular-nums">
        {children}
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-400">
      {children}
    </p>
  )
}

interface WeekBarProps {
  value: number
  day: string
  fullDate: string
}

function WeekBar({ value, day, fullDate }: WeekBarProps) {
  const h = Math.max(8, ((value - 98) / 2) * 100)
  return (
    <div
      className="flex h-full w-full flex-col items-center gap-1.5"
      title={`${fullDate}: ${value.toFixed(2)}%`}
    >
      <span className="text-[10px] font-medium tabular-nums text-neutral-700">
        {value.toFixed(2)}
      </span>
      <div className="flex w-full flex-1 items-end">
        <div
          className={`w-full rounded-t-[3px] ${uptimeTone(value)}`}
          style={{ height: `${h}%` }}
        />
      </div>
      <span className="text-[10px] text-neutral-400">{day}</span>
    </div>
  )
}

function MiniBars({ daily, dates }: { daily: number[]; dates: string[] }) {
  return (
    <div
      className="grid gap-[2px]"
      style={{
        gridTemplateColumns: `repeat(${Math.max(daily.length, 1)}, minmax(0, 1fr))`,
      }}
    >
      {daily.map((p, i) => (
        <div
          key={i}
          title={`${dates[i] ? formatShortDate(dates[i]) : ''}: ${p.toFixed(2)}%`}
          className={`h-[18px] rounded-[2px] ${uptimeTone(p)}`}
        />
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { tenant } = useSelectedTenant()
  const tenantName = tenant?.info?.name ?? ''
  const tenantImg = tenant?.info?.image ?? ''

  const { id: tenantId } = useParams<{ id: string }>()
  const [filter, setFilter] = useState<FilterId>('all')
  const [search, setSearch] = useState('')
  const [selectedReport, setSelectedReport] = useState('')
  const [copied, setCopied] = useState(false)

  const {
    data: reports,
    isLoading: reportsLoading,
    error: reportsError,
  } = useGetTenantReports(tenantId ?? '')

  // Pick the first report once it loads; reset if the current one disappears.
  useEffect(() => {
    if (!reports || reports.length === 0) return
    const stillValid = reports.some((r) => r.name === selectedReport)
    if (!stillValid) setSelectedReport(reports[0].name)
  }, [reports, selectedReport])

  const {
    data: resultsData,
    isLoading: resultsLoading,
    error: resultsError,
  } = useGetResultsGroups(
    tenantId ?? '',
    selectedReport,
    undefined,
    '1w',
    !!selectedReport,
  )

  const {
    data: statusData,
    isLoading: statusLoading,
    error: statusError,
  } = useGetStatusGroups(
    tenantId ?? '',
    selectedReport,
    undefined,
    !!selectedReport,
  )

  const services = useMemo<Service[]>(() => {
    if (!resultsData?.data) return []

    const statusByName = new Map<string, string[]>()
    statusData?.data?.forEach((g) => {
      statusByName.set(
        g.name,
        g.results.map((r) => r.value),
      )
    })

    return resultsData.data.map((g) => {
      const sorted = [...g.results].sort((a, b) => a.date.localeCompare(b.date))
      return {
        name: g.name,
        status: worstStatus(statusByName.get(g.name) ?? []),
        daily: sorted.map((r) => Number(r.availability)),
        dailyDates: sorted.map((r) => r.date),
      }
    })
  }, [resultsData, statusData])

  const counts = useMemo<Record<ServiceStatus, number>>(() => {
    const c = { healthy: 0, degraded: 0, critical: 0 }
    services.forEach((s) => c[s.status]++)
    return c
  }, [services])

  const { tenantDaily, tenantDailyDates } = useMemo(() => {
    if (services.length === 0)
      return { tenantDaily: [], tenantDailyDates: [] as string[] }
    const dates = services[0].dailyDates
    const dailyAvgs = dates.map((_, i) =>
      avg(services.map((s) => s.daily[i]).filter(Number.isFinite)),
    )
    return { tenantDaily: dailyAvgs, tenantDailyDates: dates }
  }, [services])

  const filtered = useMemo(
    () =>
      services.filter((s) => {
        if (search && !s.name.toLowerCase().includes(search.toLowerCase()))
          return false
        if (filter === 'healthy') return s.status === 'healthy'
        if (filter === 'problem') return s.status !== 'healthy'
        return true
      }),
    [filter, search, services],
  )

  const weekAvg = useMemo(() => avg(tenantDaily).toFixed(2), [tenantDaily])
  const todayAvail =
    tenantDaily.length === 0
      ? '—'
      : tenantDaily[tenantDaily.length - 1].toFixed(2)

  const overall = useMemo<{
    state: ServiceStatus
    headline: string
    detail: string
  }>(() => {
    const crit = services.filter((s) => s.status === 'critical')
    const deg = services.filter((s) => s.status === 'degraded')

    if (crit.length > 0) {
      const names = crit
        .slice(0, 2)
        .map((s) => s.name)
        .join(', ')
      return {
        state: 'critical',
        headline:
          crit.length === 1
            ? '1 service is down'
            : `${crit.length} services are critical`,
        detail: `Affected: ${names}${crit.length > 2 ? ` +${crit.length - 2} more` : ''}`,
      }
    }
    if (deg.length > 0) {
      const names = deg
        .slice(0, 2)
        .map((s) => s.name)
        .join(', ')
      return {
        state: 'degraded',
        headline:
          deg.length === 1
            ? '1 service is degraded'
            : `${deg.length} services are degraded`,
        detail: `${names}${deg.length > 2 ? ` +${deg.length - 2} more` : ''} reporting elevated errors or latency`,
      }
    }
    return {
      state: 'healthy',
      headline: 'All systems operational',
      detail: `${services.length} services healthy · ${weekAvg}% uptime this week`,
    }
  }, [services, weekAvg])

  const b = BANNER_STYLES[overall.state]
  const BannerIcon = b.icon
  const isLoading = reportsLoading || resultsLoading || statusLoading
  const error = reportsError || resultsError || statusError
  const hasMultipleReports = (reports?.length ?? 0) > 1

  if (!tenantId) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-neutral-500">
        No tenant selected.
      </div>
    )
  }
  if (isLoading && !resultsData) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-neutral-500">
        Loading tenant status…
      </div>
    )
  }
  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Failed to load tenant data: {error.message}
        </div>
      </div>
    )
  }

  const filterTabs: { id: FilterId; label: string; count: number | null }[] = [
    { id: 'all', label: 'All', count: services.length },
    { id: 'problem', label: 'Has problems', count: null },
    { id: 'healthy', label: 'Healthy', count: null },
  ]

  return (
    <div className="mx-auto max-w-5xl px-2 py-2 font-sans text-neutral-900 antialiased">
      <header className="mb-6 overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <div className="flex flex-wrap items-center gap-4 px-5 py-3">
          <TenantAvatar name={tenantName} image={tenantImg} />

          <div className="min-w-0 flex-1">
            <h1 className="text-[18px] font-semibold leading-tight tracking-tight text-neutral-900">
              {tenantName || 'Tenant'}
            </h1>
            <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-neutral-500">
              <span className="truncate font-mono" title={tenantId}>
                {tenantId}
              </span>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard?.writeText(tenantId)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 1500)
                }}
                className={`flex-shrink-0 rounded p-1 transition-colors ${
                  copied
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'
                }`}
                aria-label={copied ? 'Copied' : 'Copy tenant ID'}
                title={copied ? 'Copied!' : 'Copy tenant ID'}
              >
                {copied ? (
                  <Check className="h-3 w-3" strokeWidth={2.5} />
                ) : (
                  <Copy className="h-3 w-3" strokeWidth={2} />
                )}
              </button>
            </div>
          </div>

          {hasMultipleReports && (
            <div className="flex flex-shrink-0 items-center gap-3">
              <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-500">
                Report
              </span>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="max-w-[180px] truncate rounded-md border border-neutral-200 bg-white py-1.5 pl-2.5 pr-7 text-xs font-medium text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
              >
                {reports?.map((r) => (
                  <option key={r.name} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div
          className={`flex flex-wrap items-center gap-3 border-t px-5 py-3 ${b.border} ${b.bg}`}
        >
          <BannerIcon
            className={`h-5 w-5 flex-shrink-0 ${b.headline}`}
            strokeWidth={2}
          />
          <div className="min-w-0 flex-1">
            <span className={`text-[14px] font-semibold ${b.headline}`}>
              {overall.headline}
            </span>
            <span className={`mx-2 ${b.meta}`}>·</span>
            <span className={`text-[13px] ${b.detail}`}>{overall.detail}</span>
          </div>
        </div>
      </header>

      <div className="mb-6 flex flex-wrap items-center rounded-md border border-neutral-200 bg-white px-1 py-2">
        <NowItem icon={Activity} label="Tenant status">
          <span
            className={`h-2 w-2 rounded-full ${STATUS_STYLES[overall.state].dot}`}
          />
          <span className={STATUS_STYLES[overall.state].text}>
            {STATUS_STYLES[overall.state].label}
          </span>
        </NowItem>
        <NowItem icon={Server} label="Services">
          <span>{services.length}</span>
          <span className="text-[11px] font-normal text-neutral-500">
            <span className="text-emerald-600">{counts.healthy}</span>·
            <span className="text-amber-600">{counts.degraded}</span>·
            <span className="text-red-600">{counts.critical}</span>
          </span>
        </NowItem>
        <NowItem icon={ShieldCheck} label="Availability today" last>
          <span>{todayAvail}</span>
          <span className="text-[11px] font-normal text-neutral-500">%</span>
        </NowItem>
      </div>

      <SectionLabel>This week</SectionLabel>
      <section className="mb-6 rounded-xl border border-neutral-200 bg-white px-5 py-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-medium">Tenant-wide availability</h2>
          <span className="text-xs text-neutral-500">
            last {tenantDaily.length} day{tenantDaily.length === 1 ? '' : 's'} ·
            all services averaged
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_180px] md:items-center">
          <div
            className="grid h-[110px] items-end gap-1.5"
            style={{
              gridTemplateColumns: `repeat(${Math.max(tenantDaily.length, 1)}, minmax(0, 1fr))`,
            }}
          >
            {tenantDaily.map((v, i) => (
              <WeekBar
                key={tenantDailyDates[i] ?? i}
                value={v}
                day={formatShortDay(tenantDailyDates[i])}
                fullDate={formatShortDate(tenantDailyDates[i])}
              />
            ))}
          </div>

          <div className="md:text-right">
            <p className="text-xs text-neutral-500">
              {tenantDaily.length}-day average
            </p>
            <p className="mt-0.5 text-[32px] font-medium leading-none tabular-nums">
              {weekAvg}
              <span className="text-base text-neutral-400">%</span>
            </p>
            <p className="mt-2 text-[11px] text-neutral-400">
              SLA target: 99.5%
            </p>
          </div>
        </div>
      </section>

      <SectionLabel>All services</SectionLabel>
      <section className="rounded-xl border border-neutral-200 bg-white px-5 py-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[15px] font-medium">Service breakdown</h2>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services…"
              className="h-8 w-56 rounded-md border border-neutral-200 bg-white pl-8 pr-3 text-sm text-neutral-700 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="mb-3 flex gap-1 border-b border-neutral-200">
          {filterTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(t.id)}
              className={`-mb-px border-b-2 px-2.5 py-1.5 text-xs transition-colors ${
                filter === t.id
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {t.label}
              {t.count !== null && (
                <span className="ml-1 text-neutral-400">{t.count}</span>
              )}
            </button>
          ))}
        </div>

        <table className="w-full table-fixed text-sm">
          <thead>
            <tr className="text-[11px] font-medium uppercase tracking-[0.04em] text-neutral-400">
              <th className="w-[30%] border-b border-neutral-200 px-1.5 py-2 text-left">
                Service
              </th>
              <th className="w-[18%] border-b border-neutral-200 px-1.5 py-2 text-left">
                Status
              </th>
              <th className="w-[18%] border-b border-neutral-200 px-1.5 py-2 text-left">
                Avail (Week)
              </th>
              <th className="w-[34%] border-b border-neutral-200 px-1.5 py-2 text-left">
                Per Day
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-1.5 py-6 text-center text-neutral-400"
                >
                  No services match
                </td>
              </tr>
            )}
            {filtered.map((svc) => {
              const st = STATUS_STYLES[svc.status]
              return (
                <tr key={svc.name}>
                  <td className="border-b border-neutral-100 px-1.5 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${st.dot}`} />
                      <span className="truncate font-medium text-neutral-800">
                        {svc.name}
                      </span>
                    </div>
                  </td>
                  <td className="border-b border-neutral-100 px-1.5 py-2.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${st.pill}`}
                    >
                      {st.label}
                    </span>
                  </td>
                  <td className="border-b border-neutral-100 px-1.5 py-2.5 tabular-nums text-neutral-700">
                    {avg(svc.daily).toFixed(2)}%
                  </td>
                  <td className="border-b border-neutral-100 px-1.5 py-2.5">
                    <MiniBars daily={svc.daily} dates={svc.dailyDates} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
    </div>
  )
}
