import { availabilityTone, downtimeTone } from './utils/availabilityBadge'
import type { GroupDailyResult } from '@/types/availabilityReliability'

const thBase =
  'px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap'
const badgeClass =
  'inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold'
const tdBase = 'px-4 py-2 text-center'

interface DailyAvailabilityTableProps {
  rows: GroupDailyResult[]
}

const DailyAvailabilityTable = ({ rows }: DailyAvailabilityTableProps) => {
  return (
    <div className="bg-white border border-line rounded-lg shadow-sm overflow-hidden mb-8">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="border-b border-line">
              <th className={`${thBase} w-1/5 text-left`}>Timestamp</th>
              <th className={`${thBase} w-1/5 text-center`}>Availability</th>
              <th className={`${thBase} w-1/5 text-center`}>Reliability</th>
              <th className={`${thBase} w-1/5 text-center`}>Unknown</th>
              <th className={`${thBase} w-1/5 text-center`}>Downtime</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center text-subtle italic py-8 px-4 text-sm"
                >
                  No daily results found
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.date}>
                  <td className="px-4 py-2 text-sm text-body whitespace-nowrap">
                    {row.date}
                  </td>
                  <td className={tdBase}>
                    <span
                      className={`${badgeClass} ${availabilityTone(row.availability)}`}
                    >
                      {row.availability}
                    </span>
                  </td>
                  <td className={tdBase}>
                    <span
                      className={`${badgeClass} ${availabilityTone(row.reliability)}`}
                    >
                      {row.reliability}
                    </span>
                  </td>
                  <td className={tdBase}>
                    <span
                      className={`${badgeClass} ${downtimeTone(row.unknown)}`}
                    >
                      {row.unknown}
                    </span>
                  </td>
                  <td className={tdBase}>
                    <span
                      className={`${badgeClass} ${downtimeTone(row.downtime)}`}
                    >
                      {row.downtime}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DailyAvailabilityTable
