import { useMemo } from 'react'
import { useGetEndpointAR } from '@/hooks/useAvailabilityReliability'
import { useParams } from 'react-router-dom'
import AREndpointsDailyContent from './AREndpointsDailyContent'
import { getMonthRange } from './utils/dateRanges'
import { useGetUserTenantById } from '@/hooks/useTenants'

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

  const { data: tenantData, isLoading: isTenantDataLoading } =
    useGetUserTenantById(tenantId)

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
      tenantName={tenantData?.info.name ?? ''}
      tenantLogoUrl={tenantData?.info.image || undefined}
      reportName={reportName || ''}
      serviceName={serviceName || ''}
      endpointName={endpointName || ''}
      month={month || ''}
      endpointData={endpointData}
      isLoading={isLoading || isTenantDataLoading}
      error={error}
      backTo={`/tenants/${tenantId}/ar-groups/${encodeURIComponent(groupName || '')}/report/${encodeURIComponent(reportName || '')}/endpoints`}
    />
  )
}

export default PrivateAREndpointsDailyContainer
