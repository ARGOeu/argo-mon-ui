import { useMemo } from 'react'
import { useGetEndpointAvailabilityReliability } from '@/hooks/useAvailabilityReliability'
import { useParams } from 'react-router-dom'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import DailyAvailabilityTable from './DailyAvailabilityTable'
import { getMonthRange, formatMonthLabel } from './utils/dateRanges'

const noticeContainerClass = 'text-center bg-surface-muted rounded-lg my-4'
const noticeTextClass = 'text-sm text-subtle italic py-6 px-12'

const AvailabilityReliabilityEndpointsDaily = () => {
  const { id, groupName, reportName, serviceName, endpointName, month } =
    useParams<{
      id: string
      groupName: string
      reportName: string
      serviceName: string
      endpointName: string
      month: string
    }>()
  const tenantId = id || ''

  const { startTime, endTime } = useMemo(
    () => (month ? getMonthRange(month) : { startTime: '', endTime: '' }),
    [month],
  )

  const {
    data: endpointData,
    isLoading,
    error,
  } = useGetEndpointAvailabilityReliability(
    tenantId,
    reportName || '',
    decodeURIComponent(endpointName || ''),
    'daily',
    startTime,
    endTime,
    !!endpointName && !!month,
  )

  const isNotFoundError =
    (error as (Error & { status?: number }) | null)?.status === 404

  const rows = useMemo(() => {
    if (!endpointData) {
      return []
    }
    return endpointData.results.flatMap((group) =>
      group['service-types'].flatMap((serviceType) =>
        serviceType.endpoints.flatMap((endpoint) =>
          endpoint.results.map((result) => ({
            date: result.timestamp,
            availability: parseFloat(result.availability),
            reliability: parseFloat(result.reliability),
            unknown: parseFloat(result.unknown),
            downtime: parseFloat(result.downtime),
          })),
        ),
      ),
    )
  }, [endpointData])

  return (
    <div className="page-container">
      <PageHeader
        title={`${decodeURIComponent(serviceName || '')} - ${month ? formatMonthLabel(month, 'long') : ''}`}
        subtitle={
          <>
            Service <strong>{decodeURIComponent(serviceName || '')}</strong>,
            Endpoint <strong>{decodeURIComponent(endpointName || '')}</strong>
          </>
        }
        className="pb-2 mb-1"
        navigateTo={{
          label: 'Back to Monthly Endpoints Results',
          to: `/tenants/${tenantId}/ar-groups/${encodeURIComponent(groupName || '')}/report/${encodeURIComponent(reportName || '')}/endpoints`,
        }}
      />

      {isLoading ? (
        <div className="loading-container">
          <LoadingSpinner size="md" />
        </div>
      ) : isNotFoundError ? (
        <div className={noticeContainerClass}>
          <p className={noticeTextClass}>
            This endpoint has no data for the selected date
          </p>
        </div>
      ) : error ? (
        <ErrorDisplay error={error} context="daily endpoint results" />
      ) : (
        <DailyAvailabilityTable rows={rows} />
      )}
    </div>
  )
}

export default AvailabilityReliabilityEndpointsDaily
