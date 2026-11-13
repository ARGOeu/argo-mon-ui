import { useMemo } from 'react'
import {
  useGetGroupsAR,
  useGetSupergroupsAR,
} from '@/hooks/useAvailabilityReliability'
import { useGetPublicTopologyGroupsByReport } from '@/hooks/useTopology'
import {
  useGetPublicTenantInfo,
  useGetPublicTenantReports,
} from '@/hooks/useTenants'
import { useTenantName } from '@/hooks/useTenantName'
import { useParams, useNavigate } from 'react-router-dom'
import ARContent from '@/pages/availability-reliability/ARContent'
import { getRecentMonthsRange } from '@/pages/availability-reliability/utils/dateRanges'
import { isPlatformDomain } from '@/utils/domains'
import { useSelectedPublicReport } from './hooks/useSelectedPublicReport'

const PublicARContainer = () => {
  const { tenantName } = useTenantName()
  const { reportName } = useParams<{ reportName?: string }>()
  const navigate = useNavigate()

  const basePath = isPlatformDomain()
    ? `/public/tenants/${tenantName ?? ''}/ar-groups`
    : '/ar-groups'

  const { data: reports } = useGetPublicTenantReports(tenantName ?? '')
  const { data: tenantInfo, isLoading: isTenantInfoLoading } =
    useGetPublicTenantInfo(tenantName ?? '')

  const displaySupergroups = !!tenantInfo?.display_supergroup_results

  const handleReportChange = (report: string) => {
    navigate(`${basePath}/report/${encodeURIComponent(report)}`, {
      replace: true,
    })
  }

  const selectedReportName = useSelectedPublicReport(
    reports,
    reportName ?? null,
    handleReportChange,
  )

  const { startTime, endTime } = useMemo(() => getRecentMonthsRange(), [])

  const {
    data: groupsData,
    isLoading,
    error,
  } = useGetGroupsAR(
    tenantName ?? '',
    selectedReportName,
    'monthly',
    startTime,
    endTime,
    'public',
    !!selectedReportName,
  )

  const {
    data: supergroupsData,
    isLoading: isSupergroupsLoading,
    error: supergroupsError,
  } = useGetSupergroupsAR(
    tenantName ?? '',
    selectedReportName,
    'monthly',
    startTime,
    endTime,
    'public',
    !!selectedReportName && displaySupergroups,
  )

  const { data: topologyGroups, isLoading: isTopologyLoading } =
    useGetPublicTopologyGroupsByReport(
      tenantName ?? '',
      selectedReportName,
      displaySupergroups,
    )

  const handleDrillDown = (groupName: string, month: string) => {
    navigate(
      `${basePath}/${encodeURIComponent(groupName)}/report/${encodeURIComponent(selectedReportName)}/${month}`,
    )
  }

  const handleViewEndpoints = (groupName: string) => {
    navigate(
      `${basePath}/${encodeURIComponent(groupName)}/report/${encodeURIComponent(selectedReportName)}/endpoints`,
    )
  }

  const handleSupergroupDrillDown = (supergroupName: string, month: string) => {
    navigate(
      `${basePath}/supergroups/${encodeURIComponent(supergroupName)}/report/${encodeURIComponent(selectedReportName)}/${month}`,
    )
  }

  return (
    <ARContent
      tenantName={tenantName ?? ''}
      reports={reports}
      selectedReportName={selectedReportName}
      onReportChange={handleReportChange}
      groupsData={groupsData}
      isLoading={isLoading || isTenantInfoLoading}
      error={error}
      onDrillDown={handleDrillDown}
      onViewEndpoints={handleViewEndpoints}
      supergroups={
        displaySupergroups
          ? {
              data: supergroupsData,
              isLoading: isSupergroupsLoading,
              error: supergroupsError,
              onDrillDown: handleSupergroupDrillDown,
              topology: { data: topologyGroups, isLoading: isTopologyLoading },
            }
          : undefined
      }
    />
  )
}

export default PublicARContainer
