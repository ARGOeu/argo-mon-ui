import { useMemo, useEffect } from 'react'
import { useGetGroupsAR } from '@/hooks/useAvailabilityReliability'
import { useGetPublicTenantReports } from '@/hooks/useTenants'
import { useTenantName } from '@/hooks/useTenantName'
import { useParams, useNavigate } from 'react-router-dom'
import ARContent from '@/pages/availability-reliability/ARContent'
import { getLastThreeMonthsRange } from '@/pages/availability-reliability/utils/dateRanges'
import { isPlatformDomain } from '@/utils/domains'

const PublicARContainer = () => {
  const { tenantName } = useTenantName()
  const { reportName } = useParams<{ reportName?: string }>()
  const navigate = useNavigate()

  const basePath = isPlatformDomain()
    ? `/public/tenants/${tenantName ?? ''}/ar-groups`
    : '/ar-groups'

  const { data: reports } = useGetPublicTenantReports(tenantName ?? '')

  const selectedReportName = reportName

  useEffect(() => {
    if (!reportName && reports?.[0]?.name) {
      navigate(`${basePath}/report/${encodeURIComponent(reports[0].name)}`, {
        replace: true,
      })
    }
  }, [reportName, reports, basePath, navigate])

  const { startTime, endTime } = useMemo(() => getLastThreeMonthsRange(), [])

  const {
    data: groupsData,
    isLoading,
    error,
  } = useGetGroupsAR(
    tenantName ?? '',
    selectedReportName || '',
    'monthly',
    startTime,
    endTime,
    'public',
    !!selectedReportName,
  )

  const handleReportChange = (report: string) => {
    navigate(`${basePath}/report/${encodeURIComponent(report)}`, {
      replace: true,
    })
  }

  const handleDrillDown = (groupName: string, month: string) => {
    navigate(
      `${basePath}/${encodeURIComponent(groupName)}/report/${encodeURIComponent(selectedReportName || '')}/${month}`,
    )
  }

  const handleViewEndpoints = (groupName: string) => {
    navigate(
      `${basePath}/${encodeURIComponent(groupName)}/report/${encodeURIComponent(selectedReportName || '')}/endpoints`,
    )
  }

  return (
    <ARContent
      tenantName={tenantName ?? ''}
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

export default PublicARContainer
