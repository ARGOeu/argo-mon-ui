import { useMemo, useEffect } from 'react'
import { useGetGroupsAR } from '@/hooks/useAvailabilityReliability'
import { useGetTenantReports } from '@/hooks/useTenants'
import { useSelectedTenant } from '@/contexts/selected-tenant'
import { useParams, useNavigate } from 'react-router-dom'
import ARContent from './ARContent'
import { getLastThreeMonthsRange } from './utils/dateRanges'

const PrivateARContainer = () => {
  const { id, reportName } = useParams<{ id: string; reportName?: string }>()
  const tenantId = id || ''
  const navigate = useNavigate()
  const { tenant: tenantData } = useSelectedTenant()

  const { data: reports } = useGetTenantReports(tenantId)

  const selectedReportName = reportName

  useEffect(() => {
    if (!reportName && reports?.[0]?.name) {
      navigate(
        `/tenants/${tenantId}/ar-groups/report/${encodeURIComponent(reports[0].name)}`,
        { replace: true },
      )
    }
  }, [reportName, reports, tenantId, navigate])

  const { startTime, endTime } = useMemo(() => getLastThreeMonthsRange(), [])

  const {
    data: groupsData,
    isLoading,
    error,
  } = useGetGroupsAR(
    tenantId,
    selectedReportName || '',
    'monthly',
    startTime,
    endTime,
    !!selectedReportName,
  )

  const handleReportChange = (report: string) => {
    navigate(
      `/tenants/${tenantId}/ar-groups/report/${encodeURIComponent(report)}`,
      {
        replace: true,
      },
    )
  }

  const handleDrillDown = (groupName: string, month: string) => {
    navigate(
      `/tenants/${tenantId}/ar-groups/${encodeURIComponent(groupName)}/report/${encodeURIComponent(selectedReportName || '')}/${month}`,
    )
  }

  const handleViewEndpoints = (groupName: string) => {
    navigate(
      `/tenants/${tenantId}/ar-groups/${encodeURIComponent(groupName)}/report/${encodeURIComponent(selectedReportName || '')}/endpoints`,
    )
  }

  return (
    <ARContent
      tenantName={tenantData?.info.name ?? ''}
      reports={reports}
      selectedReportName={selectedReportName || ''}
      onReportChange={handleReportChange}
      groupsData={groupsData}
      isLoading={isLoading}
      error={error}
      onDrillDown={handleDrillDown}
      onViewEndpoints={handleViewEndpoints}
    />
  )
}

export default PrivateARContainer
