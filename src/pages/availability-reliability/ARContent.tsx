import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ArrowDownTrayIcon,
  TableCellsIcon,
  XMarkIcon,
} from '@heroicons/react/16/solid'
import PageHeader from '@/components/PageHeader'
import SearchInput from '@/components/SearchInput'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import SelectDropdown from '@/components/SelectDropdown'
import Pagination from '@/components/Pagination'
import ActionMenu from '@/components/ActionMenu'
import Tabs from '@/components/Tabs'
import Badge from '@/components/Badge'
import MonthlyAvailabilityTable from './MonthlyAvailabilityTable'
import { isNotFoundError } from '@/utils/isNotFoundError'
import { buildReportOptions } from '@/utils/reportVisibilityOptions'
import { formatMonthLabel, getMonthsWithData } from './utils/dateRanges'
import {
  buildCSV,
  downloadCSV,
  sanitizeFilename,
  type CsvField,
} from '@/utils/csvExport'
import type {
  GroupAvailabilityReliability,
  GroupsAvailabilityReliabilityResponse,
  SupergroupsArResponse,
} from '@/types/availabilityReliability'
import type { SortDirection } from './MonthlyAvailabilityTable'

const pageSize = 20

// URL search params that keep the active tab and the supergroup filter in the URL
const tabParam = 'tab'
const supergroupsTabValue = 'supergroups'
const supergroupParam = 'supergroup'
const groupsTabValue = 'groups'

type ArTabId = typeof groupsTabValue | typeof supergroupsTabValue

export const supergroupsTabSearch = `?${tabParam}=${supergroupsTabValue}`

const noticeContainerClass = 'text-center bg-surface-muted rounded-lg my-4'
const noticeTextClass = 'text-sm text-subtle italic py-6 px-12'

const nextSortDirection = (
  current: SortDirection | null,
): SortDirection | null => {
  if (!current) {
    return 'asc'
  }
  return current === 'asc' ? 'desc' : null
}

export interface ARSupergroupsProps {
  data: SupergroupsArResponse | undefined
  isLoading: boolean
  error: Error | null
  onDrillDown: (supergroupName: string, month: string) => void
}

export interface ARContentProps {
  tenantName: string
  reports: Array<{ name: string; public?: boolean }> | undefined
  selectedReportName: string
  onReportChange: (reportName: string) => void
  groupsData: GroupsAvailabilityReliabilityResponse | undefined
  isLoading: boolean
  error: Error | null
  onDrillDown: (groupName: string, month: string) => void
  onViewEndpoints: (groupName: string) => void
  supergroups?: ARSupergroupsProps
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
  supergroups,
}: ARContentProps) => {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const [sortDirections, setSortDirections] = useState<
    Record<ArTabId, SortDirection | null>
  >({ [groupsTabValue]: null, [supergroupsTabValue]: null })
  const [searchParams, setSearchParams] = useSearchParams()

  const supergroupsView =
    supergroups && searchParams.get(tabParam) === supergroupsTabValue
      ? supergroups
      : undefined
  const isSupergroupsTab = !!supergroupsView
  const activeTabId: ArTabId = isSupergroupsTab
    ? supergroupsTabValue
    : groupsTabValue
  const sortDirection = sortDirections[activeTabId]
  const supergroupFilter =
    supergroups && !isSupergroupsTab ? searchParams.get(supergroupParam) : null
  const supergroupsData = supergroups?.data

  const groupRows = useMemo<GroupAvailabilityReliability[]>(() => {
    if (!groupsData) {
      return []
    }
    return groupsData.results
      .filter(
        (projectGroup) =>
          !supergroupFilter || projectGroup.name === supergroupFilter,
      )
      .flatMap((projectGroup) =>
        projectGroup.groups.map((group) => ({
          name: group.name,
          monthly: group.results.map((result) => ({
            month: result.timestamp,
            availability: parseFloat(result.availability),
            reliability: parseFloat(result.reliability),
          })),
        })),
      )
  }, [groupsData, supergroupFilter])

  const supergroupRows = useMemo<GroupAvailabilityReliability[]>(() => {
    if (!supergroupsData) {
      return []
    }
    return supergroupsData.results.map((supergroup) => ({
      name: supergroup.name,
      monthly: supergroup.results.map((result) => ({
        month: result.timestamp,
        availability: parseFloat(result.availability),
        reliability: parseFloat(result.reliability),
      })),
    }))
  }, [supergroupsData])

  const rows = supergroupsView ? supergroupRows : groupRows

  const activeIsLoading = isLoading || !!supergroupsView?.isLoading
  const activeError = supergroupsView ? supergroupsView.error : error

  // The tab labels are the topology types of the report (for example SITES)
  const groupsTabLabel =
    groupsData?.results.find((supergroup) => supergroup.groups.length > 0)
      ?.groups[0].type || 'Groups'
  const supergroupsTabLabel =
    supergroupsData?.results[0]?.type ||
    groupsData?.results[0]?.type ||
    'Supergroups'

  const showTabs = !!supergroups && !isLoading

  const months = useMemo(() => getMonthsWithData(rows), [rows])

  const filteredRows = useMemo(
    () =>
      rows.filter((row) =>
        row.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [rows, search],
  )

  const sortedRows = useMemo(() => {
    if (!sortDirection) {
      return filteredRows
    }
    const direction = sortDirection === 'asc' ? 1 : -1
    return [...filteredRows].sort(
      (a, b) => direction * a.name.localeCompare(b.name),
    )
  }, [filteredRows, sortDirection])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, selectedReportName, isSupergroupsTab, supergroupFilter])

  const totalElements = filteredRows.length
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize))

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages))
  }, [totalPages])

  const paginatedRows = useMemo(
    () =>
      sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [sortedRows, currentPage],
  )

  const handleSortChange = () => {
    setSortDirections((prev) => ({
      ...prev,
      [activeTabId]: nextSortDirection(prev[activeTabId]),
    }))
    setCurrentPage(1)
  }

  const handleTabChange = (tabId: string) => {
    setSearch('')
    setSearchParams(
      tabId === supergroupsTabValue ? { [tabParam]: supergroupsTabValue } : {},
      { replace: true },
    )
  }

  const handleViewSupergroupGroups = (supergroupName: string) => {
    setSearch('')
    setSearchParams({ [supergroupParam]: supergroupName })
  }

  const handleClearSupergroupFilter = () => {
    setSearch('')
    setSearchParams({}, { replace: true })
  }

  const handleExport = () => {
    type Row = (typeof sortedRows)[number]
    const entity = supergroupsView ? 'Supergroup' : 'Group'

    const fields: CsvField<Row>[] = [
      { label: entity, value: 'name' },
      ...months.flatMap((month): CsvField<Row>[] => [
        {
          label: `${formatMonthLabel(month)} Availability`,
          value: (row: Row) =>
            row.monthly.find((m) => m.month === month)?.availability,
        },
        {
          label: `${formatMonthLabel(month)} Reliability`,
          value: (row: Row) =>
            row.monthly.find((m) => m.month === month)?.reliability,
        },
      ]),
    ]

    downloadCSV(
      `${sanitizeFilename(tenantName)}-${sanitizeFilename(decodeURIComponent(selectedReportName))}-AR-${entity}s-Monthly.csv`,
      buildCSV(sortedRows, fields),
    )
  }

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
        className="pb-2 mb-1"
      />

      {showTabs && (
        <Tabs
          tabs={[
            { id: groupsTabValue, label: groupsTabLabel },
            { id: supergroupsTabValue, label: supergroupsTabLabel },
          ]}
          activeTab={activeTabId}
          onChange={handleTabChange}
          className="mb-3"
        />
      )}

      <div className="flex items-start justify-between gap-x-4 mb-1 flex-wrap">
        <SearchInput
          value={search}
          onChange={setSearch}
          onClear={() => setSearch('')}
          placeholder={
            showTabs
              ? `Search ${supergroupsView ? supergroupsTabLabel : groupsTabLabel}...`
              : 'Search groups...'
          }
          className="order-2 lg:order-none max-w-xs w-full"
        />

        <div className="order-1 lg:order-none flex items-center justify-between flex-wrap gap-x-6 gap-y-2 w-full lg:w-auto mb-2 lg:mb-0">
          {reports && reports.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-semibold text-body">
                Select a report:
              </span>
              <SelectDropdown
                value={selectedReportName || ''}
                onChange={onReportChange}
                options={buildReportOptions(reports)}
                className="w-[180px]"
              />
            </div>
          )}

          {reports && reports.length === 1 && (
            <span className="text-[15px] font-medium text-body">
              Selected report:{' '}
              <strong className="text-muted">{selectedReportName}</strong>
            </span>
          )}

          <ActionMenu
            label="Export"
            icon={ArrowDownTrayIcon}
            disabled={!filteredRows.length}
            items={[
              { label: 'CSV', icon: TableCellsIcon, onClick: handleExport },
            ]}
            menuClassName="w-32"
          />
        </div>
      </div>

      {supergroupFilter && (
        <div className="flex items-center gap-2 mb-3 text-sm text-body">
          <span>Showing groups of</span>
          <Badge size="lg" className="bg-brand-muted text-brand-strong gap-1.5">
            {supergroupFilter}
            <button
              type="button"
              onClick={handleClearSupergroupFilter}
              aria-label="Show all groups"
              className="flex items-center cursor-pointer rounded-full hover:text-brand"
            >
              <XMarkIcon className="size-4" />
            </button>
          </Badge>
        </div>
      )}

      {activeIsLoading ? (
        <div className="loading-container">
          <LoadingSpinner size="md" />
        </div>
      ) : isNotFoundError(activeError) ? (
        <div className={noticeContainerClass}>
          <p className={noticeTextClass}>
            {supergroupsView
              ? 'This report has no supergroup data for the selected period'
              : 'This report has no data for the selected period'}
          </p>
        </div>
      ) : activeError ? (
        <ErrorDisplay
          error={activeError}
          context="loading availability and reliability results"
        />
      ) : (
        <>
          <MonthlyAvailabilityTable
            rows={paginatedRows}
            months={months}
            entityLabel={
              supergroups
                ? supergroupsView
                  ? supergroupsTabLabel
                  : groupsTabLabel
                : 'Group'
            }
            emptyMessage={
              supergroupsView
                ? 'No supergroups found'
                : supergroupFilter
                  ? `No groups found for ${supergroupFilter}`
                  : 'No groups found'
            }
            nameTooltip={
              supergroupsView
                ? 'View the groups of this supergroup'
                : 'View endpoint results for this group'
            }
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
            onNameClick={
              supergroupsView ? handleViewSupergroupGroups : onViewEndpoints
            }
            onDrillDown={
              supergroupsView ? supergroupsView.onDrillDown : onDrillDown
            }
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            itemLabel={supergroupsView ? 'supergroups' : 'groups'}
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
