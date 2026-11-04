import { ArrowUpRightIcon } from '@heroicons/react/16/solid'
import { availabilityTone } from './utils/availabilityBadge'
import { formatMonthLabel } from './utils/dateRanges'
import type { GroupAvailabilityReliability } from '@/types/availabilityReliability'

const thBase =
  'px-4 py-2.5 text-xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap'
const badgeClass =
  'inline-flex items-center justify-self-center rounded-lg px-2.5 py-1 text-xs font-semibold'
const valueColumns = 'grid-cols-[3.5rem_3.5rem_0.25rem]'

interface MonthlyAvailabilityTableProps {
  groups: GroupAvailabilityReliability[]
  months: string[]
  onDrillDown: (groupName: string, month: string) => void
  onViewEndpoints: (groupName: string) => void
}

const MonthlyAvailabilityTable = ({
  groups,
  months,
  onDrillDown,
  onViewEndpoints,
}: MonthlyAvailabilityTableProps) => {
  const lastMonth = months.at(-1)

  return (
    <div className="bg-white border border-line rounded-lg shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th rowSpan={2} className={`${thBase} text-left pb-2`}>
                Group
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
            {groups.length === 0 ? (
              <tr>
                <td
                  colSpan={1 + months.length}
                  className="text-center text-subtle italic py-8 px-4 text-sm"
                >
                  No groups found
                </td>
              </tr>
            ) : (
              groups.map((group) => (
                <tr key={group.name}>
                  <td className="px-4 py-3 text-sm font-medium">
                    <button
                      type="button"
                      onClick={() => onViewEndpoints(group.name)}
                      data-tip="View endpoint results for this group"
                      title={group.name}
                      className="tooltip tooltip-right block max-w-[240px] truncate cursor-pointer text-body hover:text-brand hover:underline"
                    >
                      {group.name}
                    </button>
                  </td>
                  {months.map((month) => {
                    const monthly = group.monthly.find((m) => m.month === month)
                    if (!monthly) {
                      return <td key={month} className="px-4 py-3" />
                    }
                    return (
                      <td key={month} className="px-2 py-1">
                        <button
                          type="button"
                          onClick={() => onDrillDown(group.name, month)}
                          data-tip={`View daily breakdown for ${formatMonthLabel(month)}`}
                          className={`tooltip ${month === lastMonth ? 'tooltip-left' : ''} group grid ${valueColumns} gap-2 items-center justify-center mx-auto rounded-md border border-transparent px-2 py-1 cursor-pointer bg-transparent transition-all hover:border-line-strong hover:bg-surface-muted`}
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default MonthlyAvailabilityTable
