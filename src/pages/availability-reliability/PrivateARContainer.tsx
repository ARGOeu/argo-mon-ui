import { useMemo, useEffect } from 'react'
import {
  useGetGroupsAR,
  useGetSupergroupsAR,
} from '@/hooks/useAvailabilityReliability'
import { useGetTenantReports, useGetUserTenantById } from '@/hooks/useTenants'
import { useGetTopologyGroupsByReport } from '@/hooks/useTopology'
import { useParams, useNavigate } from 'react-router-dom'
import ARContent from './ARContent'
import { getRecentMonthsRange } from './utils/dateRanges'

const PrivateARContainer = () => {
  const { id, reportName } = useParams<{ id: string; reportName?: string }>()
  const tenantId = id || ''
  const navigate = useNavigate()
  const { data: tenantData, isLoading: isTenantLoading } =
    useGetUserTenantById(tenantId)

  const displaySupergroups = !!tenantData?.display_supergroup_results

  const { data: reports, isLoading: isReportsLoading } =
    useGetTenantReports(tenantId)

  const selectedReportName = reportName
  const selectedReportId =
    reports?.find((report) => report.name === selectedReportName)?.id ?? ''

  useEffect(() => {
    if (!reportName && reports?.[0]?.name) {
      navigate(
        `/tenants/${tenantId}/ar-groups/report/${encodeURIComponent(reports[0].name)}`,
        { replace: true },
      )
    }
  }, [reportName, reports, tenantId, navigate])

  const { startTime, endTime } = useMemo(() => getRecentMonthsRange(), [])

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
    'private',
    !!selectedReportName,
  )

  const {
    data: supergroupsData,
    isLoading: isSupergroupsLoading,
    error: supergroupsError,
  } = useGetSupergroupsAR(
    tenantId,
    selectedReportName || '',
    'monthly',
    startTime,
    endTime,
    'private',
    !!selectedReportName && displaySupergroups,
  )

  const { data: topologyGroups, isLoading: isTopologyLoading } =
    useGetTopologyGroupsByReport(tenantId, selectedReportId, displaySupergroups)

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

  const handleSupergroupDrillDown = (supergroupName: string, month: string) => {
    navigate(
      `/tenants/${tenantId}/ar-groups/supergroups/${encodeURIComponent(supergroupName)}/report/${encodeURIComponent(selectedReportName || '')}/${month}`,
    )
  }

  return (
    <ARContent
      tenantName={tenantData?.info.name ?? ''}
      reports={reports}
      selectedReportName={selectedReportName || ''}
      onReportChange={handleReportChange}
      groupsData={groupsData}
      isLoading={isLoading || isTenantLoading}
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
              topology: {
                data: topologyGroups,
                isLoading: isReportsLoading || isTopologyLoading,
              },
            }
          : undefined
      }
    />
  )
}

export default PrivateARContainer
