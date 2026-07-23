import { useState, useMemo, useEffect } from 'react'
import PageHeader from '@/components/PageHeader'
import SearchInput from '@/components/SearchInput'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import SelectDropdown from '@/components/SelectDropdown'
import Pagination from '@/components/Pagination'
import MonthlyAvailabilityTable from './MonthlyAvailabilityTable'
import { isNotFoundError } from '@/utils/isNotFoundError'
import type { GroupsAvailabilityReliabilityResponse } from '@/types/availabilityReliability'

const pageSize = 20
const noticeContainerClass = 'text-center bg-surface-muted rounded-lg my-4'
const noticeTextClass = 'text-sm text-subtle italic py-6 px-12'

export interface ARContentProps {
  tenantName: string
  reports: Array<{ name: string }> | undefined
  selectedReportName: string
  onReportChange: (reportName: string) => void
  groupsData: GroupsAvailabilityReliabilityResponse | undefined
  isLoading: boolean
  error: Error | null
  onDrillDown: (groupName: string, month: string) => void
  onViewEndpoints: (groupName: string) => void
}

const ARContent = ({
  tenantName,
  reports,
  selectedReportName,
  onReportChange,
  groupsData,
  isLoading,
  error,
  onDrillDown,
  onViewEndpoints,
}: ARContentProps) => {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

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

  return (
    <div className="page-container mb-8">
      <PageHeader
        title="Availability & Reliability"
        subtitle={
          <>
            Monthly availability and reliability results for tenant{' '}
            <strong>{tenantName ? tenantName : '...'}</strong>
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
              onChange={onReportChange}
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
      ) : isNotFoundError(error) ? (
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
            onDrillDown={onDrillDown}
            onViewEndpoints={onViewEndpoints}
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

export default ARContent
