import { useMemo } from 'react'
import { useGetEndpointAR } from '@/hooks/useAvailabilityReliability'
import { useParams } from 'react-router-dom'
import AREndpointsDailyContent from './AREndpointsDailyContent'
import { getMonthRange } from './utils/dateRanges'

const PrivateAREndpointsDailyContainer = () => {
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
  } = useGetEndpointAR(
    tenantId,
    decodeURIComponent(reportName || ''),
    decodeURIComponent(groupName || ''),
    decodeURIComponent(endpointName || ''),
    'daily',
    startTime,
    endTime,
    'private',
    !!endpointName && !!groupName && !!month,
  )

  return (
    <AREndpointsDailyContent
      serviceName={serviceName || ''}
      endpointName={endpointName || ''}
      month={month || ''}
      endpointData={endpointData}
      isLoading={isLoading}
      error={error}
      backTo={`/tenants/${tenantId}/ar-groups/${encodeURIComponent(groupName || '')}/report/${encodeURIComponent(reportName || '')}/endpoints`}
    />
  )
}

export default PrivateAREndpointsDailyContainer
