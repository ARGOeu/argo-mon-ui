import { useMemo } from 'react'
import { useGetGroupAvailabilityReliability } from '@/hooks/useAvailabilityReliability'
import { useParams } from 'react-router-dom'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import DailyAvailabilityTable from './DailyAvailabilityTable'

const formatMonthLabel = (month: string): string => {
  const [year, mon] = month.split('-').map(Number)
  return new Date(year, mon - 1, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })
}

const toW3CTimestamp = (date: Date): string =>
  date.toISOString().replace(/\.\d{3}Z$/, 'Z')

const getMonthRange = (
  month: string,
): { startTime: string; endTime: string } => {
  const [year, mon] = month.split('-').map(Number)
  const start = new Date(Date.UTC(year, mon - 1, 1))
  const end = new Date(Date.UTC(year, mon, 0, 23, 59, 59))
  return { startTime: toW3CTimestamp(start), endTime: toW3CTimestamp(end) }
}

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
        title={`${decodeURIComponent(groupName || '')} - ${month ? formatMonthLabel(month) : ''}`}
        className="pb-2 mb-1"
        titleClassName="text-2xl"
        navigateTo={{
          label: 'Back to Monthly Group Results',
          to: `/tenants/${tenantId}/ar-groups/report/${encodeURIComponent(reportName || '')}`,
        }}
      />

      {isLoading ? (
        <div className="loading-container">
          <LoadingSpinner size="md" />
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
