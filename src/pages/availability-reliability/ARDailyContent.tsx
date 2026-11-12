import { ArrowDownTrayIcon, TableCellsIcon } from '@heroicons/react/16/solid'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import ActionMenu from '@/components/ActionMenu'
import DailyAvailabilityTable from './DailyAvailabilityTable'
import { isNotFoundError } from '@/utils/isNotFoundError'
import { formatMonthLabel } from './utils/dateRanges'
import {
  buildCSV,
  downloadCSV,
  sanitizeFilename,
  type CsvField,
} from '@/utils/csvExport'
import type { DailyResultRow } from '@/types/availabilityReliability'

const noticeContainerClass = 'text-center bg-surface-muted rounded-lg my-4'
const noticeTextClass = 'text-sm text-subtle italic py-6 px-12'

export interface ARDailyContentProps {
  entityLabel: 'Group' | 'Supergroup'
  name: string
  month: string
  rows: DailyResultRow[]
  isLoading: boolean
  error: Error | null
  backTo: string
}

const ARDailyContent = ({
  entityLabel,
  name,
  month,
  rows,
  isLoading,
  error,
  backTo,
}: ARDailyContentProps) => {
  // Supergroup results have no unknown or downtime values
  const showUnknownAndDowntime = entityLabel === 'Group'

  const handleExport = () => {
    const fields: CsvField<DailyResultRow>[] = [
      { label: 'Timestamp', value: 'date' },
      { label: 'Availability', value: 'availability' },
      { label: 'Reliability', value: 'reliability' },
      ...(showUnknownAndDowntime
        ? [
            { label: 'Unknown', value: 'unknown' },
            { label: 'Downtime', value: 'downtime' },
          ]
        : []),
    ]

    downloadCSV(
      `${sanitizeFilename(decodeURIComponent(name))}-${month}-AR-Daily.csv`,
      buildCSV(rows, fields),
    )
  }

  return (
    <div className="page-container">
      <PageHeader
        title={`${decodeURIComponent(name || '')} - ${month ? formatMonthLabel(month, 'long') : ''}`}
        subtitle="Daily availability and reliability breakdown"
        className="items-end pb-2 mb-1"
        navigateTo={{
          label: `Back to Monthly ${entityLabel} Results`,
          to: backTo,
        }}
      >
        <ActionMenu
          label="Export"
          icon={ArrowDownTrayIcon}
          disabled={!rows.length}
          items={[
            { label: 'CSV', icon: TableCellsIcon, onClick: handleExport },
          ]}
          menuClassName="w-32"
        />
      </PageHeader>

      {isLoading ? (
        <div className="loading-container">
          <LoadingSpinner size="md" />
        </div>
      ) : isNotFoundError(error) ? (
        <div className={noticeContainerClass}>
          <p className={noticeTextClass}>
            This {entityLabel.toLowerCase()} has no data for the selected date
          </p>
        </div>
      ) : error ? (
        <ErrorDisplay error={error} context="daily results" />
      ) : (
        <DailyAvailabilityTable
          rows={rows}
          showUnknownAndDowntime={showUnknownAndDowntime}
        />
      )}
    </div>
  )
}

export default ARDailyContent
