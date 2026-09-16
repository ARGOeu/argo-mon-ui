import { useEffect, useMemo } from 'react'
import { useGetEndpointsAR } from '@/hooks/useAvailabilityReliability'
import { useTenantName } from '@/hooks/useTenantName'
import { useOutletContext, useParams, useNavigate } from 'react-router-dom'
import AREndpointsContent from '@/pages/availability-reliability/AREndpointsContent'
import { getLastThreeMonthsRange } from '@/pages/availability-reliability/utils/dateRanges'
import { isPlatformDomain } from '@/utils/domains'
import type { PublicTenantOutletContext } from './PublicTenantLayout'

const PublicAREndpointsContainer = () => {
  const { tenantName } = useTenantName()
  const { groupName, reportName } = useParams<{
    groupName: string
    reportName: string
  }>()
  const navigate = useNavigate()
  const { setLastSelectedReport } =
    useOutletContext<PublicTenantOutletContext>()

  useEffect(() => {
    if (reportName) {
      setLastSelectedReport(reportName)
    }
  }, [reportName, setLastSelectedReport])

  const basePath = isPlatformDomain()
    ? `/public/tenants/${tenantName ?? ''}/ar-groups`
    : '/ar-groups'

  const { startTime, endTime } = useMemo(() => getLastThreeMonthsRange(), [])

  const {
    data: endpointsData,
    isLoading,
    error,
  } = useGetEndpointsAR(
    tenantName ?? '',
    decodeURIComponent(reportName || ''),
    decodeURIComponent(groupName || ''),
    'monthly',
    startTime,
    endTime,
    'public',
    !!reportName && !!groupName,
  )

  const handleDrillDown = (
    serviceName: string,
    endpointName: string,
    month: string,
  ) => {
    navigate(
      `${basePath}/${encodeURIComponent(groupName || '')}/report/${encodeURIComponent(reportName || '')}/services/${encodeURIComponent(serviceName)}/endpoints/${encodeURIComponent(endpointName)}/${month}`,
    )
  }

  return (
    <AREndpointsContent
      tenantName={tenantName ?? ''}
      groupName={groupName || ''}
      reportName={reportName || ''}
      endpointsData={endpointsData}
      isLoading={isLoading}
      error={error}
      onDrillDown={handleDrillDown}
      backTo={`${basePath}/report/${encodeURIComponent(reportName || '')}`}
    />
  )
}

export default PublicAREndpointsContainer
