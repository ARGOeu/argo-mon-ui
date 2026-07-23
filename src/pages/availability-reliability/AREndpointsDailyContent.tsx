import { useMemo } from 'react'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import DailyAvailabilityTable from './DailyAvailabilityTable'
import { isNotFoundError } from '@/utils/isNotFoundError'
import { formatMonthLabel } from './utils/dateRanges'
import type { EndpointsARResponse } from '@/types/availabilityReliability'

const noticeContainerClass = 'text-center bg-surface-muted rounded-lg my-4'
const noticeTextClass = 'text-sm text-subtle italic py-6 px-12'

export interface AREndpointsDailyContentProps {
  serviceName: string
  endpointName: string
  month: string
  endpointData: EndpointsARResponse | undefined
  isLoading: boolean
  error: Error | null
  backTo: string
}

const AREndpointsDailyContent = ({
  serviceName,
  endpointName,
  month,
  endpointData,
  isLoading,
  error,
  backTo,
}: AREndpointsDailyContentProps) => {
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

export default AREndpointsDailyContent
