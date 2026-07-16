import { useMemo } from 'react'
import { useGetGroupAvailabilityReliability } from '@/hooks/useAvailabilityReliability'
import { useParams } from 'react-router-dom'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import DailyAvailabilityTable from './DailyAvailabilityTable'
import { getMonthRange, formatMonthLabel } from './utils/dateRanges'

const noticeContainerClass = 'text-center bg-surface-muted rounded-lg my-4'
const noticeTextClass = 'text-sm text-subtle italic py-6 px-12'

const AvailabilityReliabilityDaily = () => {
  const { id, groupName, reportName, month } = useParams<{
    id: string
    groupName: string
    reportName: string
    month: string
  }>()
  const tenantId = id || ''

  const { startTime, endTime } = useMemo(
    () => (month ? getMonthRange(month) : { startTime: '', endTime: '' }),
    [month],
  )

  const {
    data: rawData,
    isLoading,
    error,
  } = useGetGroupAvailabilityReliability(
    tenantId,
    reportName || '',
    groupName || '',
    'daily',
    startTime,
    endTime,
    !!month,
  )

  const isNotFoundError =
    (error as (Error & { status?: number }) | null)?.status === 404

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
          to: `/tenants/${tenantId}/ar-groups/report/${encodeURIComponent(reportName || '')}`,
        }}
      />

      {isLoading ? (
        <div className="loading-container">
          <LoadingSpinner size="md" />
        </div>
      ) : isNotFoundError ? (
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

export default AvailabilityReliabilityDaily
