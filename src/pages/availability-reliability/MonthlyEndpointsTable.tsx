import { ArrowUpRightIcon } from '@heroicons/react/16/solid'
import { availabilityTone } from './utils/availabilityBadge'
import { formatMonthLabel } from './utils/dateRanges'
import type { EndpointMonthlyRow } from '@/types/availabilityReliability'

const thBase =
  'px-4 py-2.5 text-xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap'
const badgeClass =
  'inline-flex items-center justify-self-center rounded-lg px-2.5 py-1 text-xs font-semibold'
const valueColumns = 'grid-cols-[3.5rem_3.5rem_0.25rem]'

interface MonthlyEndpointsTableProps {
  rows: EndpointMonthlyRow[]
  months: string[]
  onDrillDown: (
    serviceName: string,
    endpointName: string,
    month: string,
  ) => void
}

const MonthlyEndpointsTable = ({
  rows,
  months,
  onDrillDown,
}: MonthlyEndpointsTableProps) => {
  if (rows.length === 0) {
    return (
      <div className="bg-white border border-line rounded-lg shadow-sm">
        <div className="text-center text-subtle italic py-8 px-4 text-sm">
          No endpoints found
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-line rounded-lg shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th rowSpan={2} className={`${thBase} text-left pb-2`}>
                Endpoint
              </th>
              {months.map((month) => (
                <th key={month} className={`${thBase} text-center`}>
                  {formatMonthLabel(month)}
                </th>
              ))}
            </tr>
            <tr className="border-b border-line">
              {months.map((month) => (
                <th
                  key={month}
                  className="px-4 pb-2 text-xs font-semibold text-subtle"
                >
                  <div className={`grid gap-2 justify-center ${valueColumns}`}>
                    <span className="text-center">Av</span>
                    <span className="text-center">Re</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr key={`${row.serviceName}-${row.endpointName}`}>
                <td className="px-4 py-3 text-sm">
                  {row.url ? (
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={row.url}
                      className="block max-w-[200px] truncate font-medium text-brand hover:underline sm:max-w-[280px] md:max-w-[360px] lg:max-w-[420px] xl:max-w-[500px] lg:overflow-visible lg:whitespace-normal"
                    >
                      {row.url}
                    </a>
                  ) : (
                    <span
                      className="block max-w-[200px] truncate font-medium text-body sm:max-w-[280px] md:max-w-[360px] lg:max-w-[420px] xl:max-w-[500px] lg:overflow-visible lg:whitespace-normal"
                      title={row.endpointName}
                    >
                      {row.endpointName}
                    </span>
                  )}
                  <span
                    className="block max-w-[200px] truncate text-xs text-muted sm:max-w-[280px] md:max-w-[360px] lg:max-w-[420px] xl:max-w-[500px] lg:overflow-visible lg:whitespace-normal mt-1"
                    title={row.serviceName}
                  >
                    {row.serviceName}
                  </span>
                </td>
                {months.map((month) => {
                  const monthly = row.monthly.find((m) => m.month === month)
                  if (!monthly) {
                    return <td key={month} className="px-4 py-3" />
                  }
                  return (
                    <td key={month} className="px-2 py-1">
                      <button
                        type="button"
                        onClick={() =>
                          onDrillDown(row.serviceName, row.endpointName, month)
                        }
                        data-tip={`View daily breakdown for ${formatMonthLabel(month)}`}
                        className={`tooltip group grid ${valueColumns} gap-2 items-center justify-center mx-auto rounded-md border border-transparent px-2 py-1 cursor-pointer bg-transparent transition-all hover:border-line-strong hover:bg-surface-muted`}
                      >
                        <span
                          className={`${badgeClass} ${availabilityTone(monthly.availability)}`}
                        >
                          {monthly.availability}
                        </span>
                        <span
                          className={`${badgeClass} ${availabilityTone(monthly.reliability)}`}
                        >
                          {monthly.reliability}
                        </span>
                        <ArrowUpRightIcon className="size-4 text-subtle justify-self-center transition-colors group-hover:text-brand" />
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default MonthlyEndpointsTable
