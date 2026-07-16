import { useState, useMemo, useEffect } from 'react'
import { useGetGroupsAvailabilityReliability } from '@/hooks/useAvailabilityReliability'
import { useGetTenantReports } from '@/hooks/useTenants'
import { useSelectedTenant } from '@/contexts/selected-tenant'
import { useParams, useNavigate } from 'react-router-dom'
import PageHeader from '@/components/PageHeader'
import SearchInput from '@/components/SearchInput'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import SelectDropdown from '@/components/SelectDropdown'
import Pagination from '@/components/Pagination'
import MonthlyAvailabilityTable from './MonthlyAvailabilityTable'
import { getLastThreeMonthsRange } from './utils/dateRanges'

const pageSize = 20
const noticeContainerClass = 'text-center bg-surface-muted rounded-lg my-4'
const noticeTextClass = 'text-sm text-subtle italic py-6 px-12'

const AvailabilityReliability = () => {
  const { id, reportName } = useParams<{ id: string; reportName?: string }>()
  const tenantId = id || ''
  const navigate = useNavigate()
  const { tenant: tenantData } = useSelectedTenant()

  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

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
  } = useGetGroupsAvailabilityReliability(
    tenantId,
    selectedReportName || '',
    'monthly',
    startTime,
    endTime,
    !!selectedReportName,
  )

  const isNotFoundError =
    (error as (Error & { status?: number }) | null)?.status === 404

  const groups = useMemo(() => {
    if (!groupsData) {
      return []
    }
    return groupsData.results.flatMap((projectGroup) =>
      projectGroup.groups.map((group) => ({
        name: group.name,
        monthly: group.results.map((result) => ({
          month: result.timestamp,
          availability: parseFloat(result.availability),
          reliability: parseFloat(result.reliability),
        })),
      })),
    )
  }, [groupsData])

  const months = useMemo(
    () => groups[0]?.monthly.map((m) => m.month) ?? [],
    [groups],
  )

  const filteredGroups = useMemo(
    () =>
      groups.filter((group) =>
        group.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [groups, search],
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [search, selectedReportName])

  const totalElements = filteredGroups.length
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize))

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages))
  }, [totalPages])

  const paginatedGroups = useMemo(
    () =>
      filteredGroups.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
      ),
    [filteredGroups, currentPage],
  )

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
    <div className="page-container mb-8">
      <PageHeader
        title="Availability & Reliability"
        subtitle={
          <>
            Monthly availability and reliability results for tenant{' '}
            <strong>
              {tenantData?.info.name ? tenantData.info.name : '...'}
            </strong>
          </>
        }
        className="pb-2 mb-2"
      />

      <div className="flex items-start justify-between gap-4 mb-1 flex-wrap">
        <SearchInput
          value={search}
          onChange={setSearch}
          onClear={() => setSearch('')}
          placeholder="Search groups..."
        />

        {reports && reports.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold text-body">
              Select a report:
            </span>
            <SelectDropdown
              value={selectedReportName || ''}
              onChange={(report) =>
                navigate(
                  `/tenants/${tenantId}/ar-groups/report/${encodeURIComponent(report)}`,
                  { replace: true },
                )
              }
              options={reports.map((report) => ({
                value: report.name,
                label: report.name,
              }))}
              className="w-[220px]"
            />
          </div>
        )}

        {reports && reports.length === 1 && (
          <span className="self-center text-[15px] font-medium text-body">
            Selected report:{' '}
            <strong className="text-muted">{selectedReportName}</strong>
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="loading-container">
          <LoadingSpinner size="md" />
        </div>
      ) : isNotFoundError ? (
        <div className={noticeContainerClass}>
          <p className={noticeTextClass}>
            This report has no data for the selected period
          </p>
        </div>
      ) : error ? (
        <ErrorDisplay
          error={error}
          context="loading availability and reliability results"
        />
      ) : (
        <>
          <MonthlyAvailabilityTable
            groups={paginatedGroups}
            months={months}
            onDrillDown={handleDrillDown}
            onViewEndpoints={handleViewEndpoints}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            itemLabel="groups"
            onPrev={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            onNext={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
          />
        </>
      )}
    </div>
  )
}

export default AvailabilityReliability
