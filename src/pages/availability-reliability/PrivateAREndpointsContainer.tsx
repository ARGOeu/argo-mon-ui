import { useMemo } from 'react'
import { useGetEndpointsAR } from '@/hooks/useAvailabilityReliability'
import { useSelectedTenant } from '@/contexts/selected-tenant'
import { useParams, useNavigate } from 'react-router-dom'
import AREndpointsContent from './AREndpointsContent'
import { getLastThreeMonthsRange } from './utils/dateRanges'

const PrivateAREndpointsContainer = () => {
  const { id, groupName, reportName } = useParams<{
    id: string
    groupName: string
    reportName: string
  }>()
  const tenantId = id || ''
  const navigate = useNavigate()
  const { tenant: tenantData } = useSelectedTenant()

  const { startTime, endTime } = useMemo(() => getLastThreeMonthsRange(), [])

  const {
    data: endpointsData,
    isLoading,
    error,
  } = useGetEndpointsAR(
    tenantId,
    decodeURIComponent(reportName || ''),
    decodeURIComponent(groupName || ''),
    'monthly',
    startTime,
    endTime,
    'private',
    !!reportName && !!groupName,
  )

  const handleDrillDown = (
    serviceName: string,
    endpointName: string,
    month: string,
  ) => {
    navigate(
      `/tenants/${tenantId}/ar-groups/${encodeURIComponent(groupName || '')}/report/${encodeURIComponent(reportName || '')}/services/${encodeURIComponent(serviceName)}/endpoints/${encodeURIComponent(endpointName)}/${month}`,
    )
  }

  return (
    <AREndpointsContent
      tenantName={tenantData?.info.name ?? ''}
      groupName={groupName || ''}
      reportName={reportName || ''}
      endpointsData={endpointsData}
      isLoading={isLoading}
      error={error}
      onDrillDown={handleDrillDown}
      backTo={`/tenants/${tenantId}/ar-groups/report/${encodeURIComponent(reportName || '')}`}
    />
  )
}

export default PrivateAREndpointsContainer
