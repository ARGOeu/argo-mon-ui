import { useMemo } from 'react'
import { useGetEndpointAR } from '@/hooks/useAvailabilityReliability'
import { useTenantName } from '@/hooks/useTenantName'
import { useParams } from 'react-router-dom'
import AREndpointsDailyContent from '@/pages/availability-reliability/AREndpointsDailyContent'
import { getMonthRange } from '@/pages/availability-reliability/utils/dateRanges'
import { isPlatformDomain } from '@/utils/domains'

const PublicAREndpointsDailyContainer = () => {
  const { tenantName } = useTenantName()
  const { groupName, reportName, serviceName, endpointName, month } =
    useParams<{
      groupName: string
      reportName: string
      serviceName: string
      endpointName: string
      month: string
    }>()

  const { startTime, endTime } = useMemo(
    () => (month ? getMonthRange(month) : { startTime: '', endTime: '' }),
    [month],
  )

  const {
    data: endpointData,
    isLoading,
    error,
  } = useGetEndpointAR(
    tenantName ?? '',
    decodeURIComponent(reportName || ''),
    decodeURIComponent(groupName || ''),
    decodeURIComponent(endpointName || ''),
    'daily',
    startTime,
    endTime,
    'public',
    !!endpointName && !!groupName && !!month,
  )

  const backTo = isPlatformDomain()
    ? `/public/tenants/${tenantName ?? ''}/ar-groups/${encodeURIComponent(groupName || '')}/report/${encodeURIComponent(reportName || '')}/endpoints`
    : `/ar-groups/${encodeURIComponent(groupName || '')}/report/${encodeURIComponent(reportName || '')}/endpoints`

  return (
    <AREndpointsDailyContent
      serviceName={serviceName || ''}
      endpointName={endpointName || ''}
      month={month || ''}
      endpointData={endpointData}
      isLoading={isLoading}
      error={error}
      backTo={backTo}
    />
  )
}

export default PublicAREndpointsDailyContainer
