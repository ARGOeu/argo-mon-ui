import { ArrowUpRightIcon } from '@heroicons/react/16/solid'
import { toneForPercentage } from './availabilityBadge'
import type { GroupAvailabilityReliability } from '@/types/availabilityReliability'

const thBase =
  'px-4 py-2.5 text-xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap'
const badgeClass =
  'inline-flex items-center justify-self-center rounded-lg px-2.5 py-1 text-xs font-semibold'
const valueColumns = 'grid-cols-[3.5rem_3.5rem_0.25rem]'

const formatMonthLabel = (month: string): string => {
  const [year, mon] = month.split('-').map(Number)
  return new Date(year, mon - 1, 1).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

interface MonthlyAvailabilityTableProps {
  groups: GroupAvailabilityReliability[]
  months: string[]
}

const MonthlyAvailabilityTable = ({
  groups,
  months,
}: MonthlyAvailabilityTableProps) => {
  return (
    <div className="bg-white border border-line rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th rowSpan={2} className={`${thBase} text-left pb-2`}>
                Service
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
                  <td className="px-4 py-3 text-sm font-medium text-body whitespace-nowrap">
                    {group.name}
                  </td>
                  {months.map((month) => {
                    const monthly = group.monthly.find((m) => m.month === month)
                    if (!monthly) {
                      return <td key={month} className="px-4 py-3" />
                    }
                    return (
                      <td key={month} className="px-2 py-2">
                        <button
                          type="button"
                          onClick={() => {}}
                          data-tip={`View daily breakdown for ${formatMonthLabel(month)}`}
                          className={`tooltip group grid ${valueColumns} gap-2 items-center justify-center mx-auto rounded-md border border-transparent px-2 py-1 cursor-pointer bg-transparent transition-all hover:border-line-strong hover:bg-surface-muted`}
                        >
                          <span
                            className={`${badgeClass} ${toneForPercentage(monthly.availability)}`}
                          >
                            {monthly.availability}
                          </span>
                          <span
                            className={`${badgeClass} ${toneForPercentage(monthly.reliability)}`}
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
