import type { MetricsResponse } from '@/types/capability'
import { getMetricTier, METRIC_TIER_BADGE_CLASSES } from '@/utils/capability'

interface MetricsTableProps {
  data?: MetricsResponse
}

const MetricBadge = ({ value }: { value?: number }) => (
  <span
    className={`inline-flex min-w-14 justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${METRIC_TIER_BADGE_CLASSES[getMetricTier(value)]}`}
  >
    {value === undefined ? '—' : `${value}%`}
  </span>
)

const MetricsTable = ({ data }: MetricsTableProps) => {
  const rows = (data?.data ?? []).flatMap((entry) =>
    entry.results.length > 0
      ? entry.results.map((result) => ({
          serviceName: entry.name,
          ...result,
        }))
      : [
          {
            serviceName: entry.name,
            date: '—',
            availability: undefined,
            reliability: undefined,
            uptime: undefined,
          },
        ],
  )

  if (rows.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 p-8 text-sm text-slate-400">
        No results for this request.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs font-medium text-slate-500">
          <tr>
            <th className="px-3 py-2">Service</th>
            <th className="px-3 py-2">Date</th>
            <th className="px-3 py-2">Availability</th>
            <th className="px-3 py-2">Reliability</th>
            <th className="px-3 py-2">Uptime</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, i) => (
            <tr key={`${row.serviceName}-${row.date}-${i}`}>
              <td className="px-3 py-2 font-medium text-slate-800">
                {row.serviceName}
              </td>
              <td className="px-3 py-2 text-slate-600">{row.date}</td>
              <td className="px-3 py-2">
                <MetricBadge value={row.availability} />
              </td>
              <td className="px-3 py-2">
                <MetricBadge value={row.reliability} />
              </td>
              <td className="px-3 py-2">
                <MetricBadge value={row.uptime ? row.uptime * 100 : 0} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default MetricsTable
