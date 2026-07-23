import { useMemo } from 'react'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import DailyAvailabilityTable from './DailyAvailabilityTable'
import { isNotFoundError } from '@/utils/isNotFoundError'
import { formatMonthLabel } from './utils/dateRanges'
import type { GroupsAvailabilityReliabilityResponse } from '@/types/availabilityReliability'

const noticeContainerClass = 'text-center bg-surface-muted rounded-lg my-4'
const noticeTextClass = 'text-sm text-subtle italic py-6 px-12'

export interface ARDailyContentProps {
  groupName: string
  month: string
  rawData: GroupsAvailabilityReliabilityResponse | undefined
  isLoading: boolean
  error: Error | null
  backTo: string
}

const ARDailyContent = ({
  groupName,
  month,
  rawData,
  isLoading,
  error,
  backTo,
}: ARDailyContentProps) => {
  const rows = useMemo(() => {
    if (!rawData) {
      return []
    }
    return rawData.results.flatMap((projectGroup) =>
      projectGroup.groups.flatMap((group) =>
        group.results.map((result) => ({
          date: result.timestamp,
          availability: parseFloat(result.availability),
          reliability: parseFloat(result.reliability),
          unknown: parseFloat(result.unknown),
          downtime: parseFloat(result.downtime),
        })),
      ),
    )
  }, [rawData])

  return (
    <div className="page-container">
      <PageHeader
        title={`${decodeURIComponent(groupName || '')} - ${month ? formatMonthLabel(month, 'long') : ''}`}
        subtitle="Daily availability and reliability breakdown"
        className="pb-2 mb-1"
        navigateTo={{
          label: 'Back to Monthly Group Results',
          to: backTo,
        }}
      />

      {isLoading ? (
        <div className="loading-container">
          <LoadingSpinner size="md" />
        </div>
      ) : isNotFoundError(error) ? (
        <div className={noticeContainerClass}>
          <p className={noticeTextClass}>
            This group has no data for the selected date
          </p>
        </div>
      ) : error ? (
        <ErrorDisplay error={error} context="daily results" />
      ) : (
        <DailyAvailabilityTable rows={rows} />
      )}
    </div>
  )
}

export default ARDailyContent
