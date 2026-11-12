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
  getGroupRows,
  getSupergroupTopology,
  getSupergroupTypes,
  getTopologySupergroupNames,
} from './utils/supergroupFilter'
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
import type { GroupTopologyItem } from '@/types/topology'
import type { SortDirection } from './MonthlyAvailabilityTable'

const pageSize = 20

// URL search params that keep the active tab and the supergroup filter in the URL
const tabParam = 'tab'
const supergroupsTabValue = 'supergroups'
const supergroupParam = 'supergroup'
const groupsTabValue = 'groups'

type ArTabId = typeof groupsTabValue | typeof supergroupsTabValue

export const supergroupsTabSearch = `?${tabParam}=${supergroupsTabValue}`

const searchControlsClass = 'order-2 w-full lg:order-none lg:w-auto'
const searchControlsWithFilterClass = 'order-2 w-full xl:order-none xl:w-auto'
const reportControlsClass =
  'order-1 w-full mb-2 lg:order-none lg:w-auto lg:mb-0'
const reportControlsWithFilterClass =
  'order-1 w-full mb-2 xl:order-none xl:w-auto xl:mb-0'

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
  topology?: { data: GroupTopologyItem[] | undefined; isLoading: boolean }
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
  const [currentPage, setCurrentPage] = useState(1)

  const [searches, setSearches] = useState<Record<ArTabId, string>>({
    [groupsTabValue]: '',
    [supergroupsTabValue]: '',
  })
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
  const search = searches[activeTabId]
  const sortDirection = sortDirections[activeTabId]
  const supergroupFilter =
    supergroups && !isSupergroupsTab ? searchParams.get(supergroupParam) : null
  const supergroupsData = supergroups?.data

  const topology = supergroups?.topology
  const topologyGroups = topology?.data
  const supergroupTypes = useMemo(
    () => getSupergroupTypes(supergroupsData?.results, groupsData?.results),
    [supergroupsData, groupsData],
  )

  // The dropdown needs the latest topology
  const hasSupergroupDropdown =
    !!topology && (topology.isLoading || !!topologyGroups)

  const supergroupTopology = useMemo(
    () =>
      topologyGroups && getSupergroupTopology(topologyGroups, supergroupTypes),
    [topologyGroups, supergroupTypes],
  )

  const groupRows = useMemo(
    () => getGroupRows(groupsData, supergroupFilter, supergroupTopology),
    [groupsData, supergroupFilter, supergroupTopology],
  )

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

  const isResultsLoading =
    isLoading ||
    !!supergroupsView?.isLoading ||
    (!!supergroupFilter && !!topology?.isLoading)

  const resultsError = supergroupsView ? supergroupsView.error : error

  // The tab labels are the topology types of the report (for example SITES)
  const groupsTabLabel =
    groupsData?.results.find((supergroup) => supergroup.groups.length > 0)
      ?.groups[0].type || 'Groups'
  const supergroupsTabLabel =
    supergroupTypes.length === 1 ? supergroupTypes[0] : 'Supergroups'

  const showTabs = !!supergroups && !isLoading
  const showSupergroupDropdown =
    showTabs && hasSupergroupDropdown && !isSupergroupsTab
  const supergroupOptions = useMemo(
    () => [
      { value: '', label: 'All entries' },
      ...getTopologySupergroupNames(supergroupTopology ?? []).map((name) => ({
        value: name,
        label: name,
      })),
    ],
    [supergroupTopology],
  )

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

  const handleSearchChange = (value: string) => {
    setSearches((prev) => ({ ...prev, [activeTabId]: value }))
  }

  const handleTabChange = (tabId: string) => {
    setSearchParams(
      tabId === supergroupsTabValue ? { [tabParam]: supergroupsTabValue } : {},
      { replace: true },
    )
  }

  const handleViewSupergroupGroups = (supergroupName: string) => {
    setSearches((prev) => ({ ...prev, [groupsTabValue]: '' }))
    setSearchParams({ [supergroupParam]: supergroupName })
  }

  const handleSupergroupFilterChange = (supergroupName: string) => {
    setSearchParams(
      supergroupName ? { [supergroupParam]: supergroupName } : {},
      {
        replace: true,
      },
    )
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
        <div
          className={`flex flex-wrap items-start gap-x-3 ${hasSupergroupDropdown ? searchControlsWithFilterClass : searchControlsClass}`}
        >
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            onClear={() => handleSearchChange('')}
            placeholder={
              showTabs
                ? `Search ${supergroupsView ? supergroupsTabLabel : groupsTabLabel}...`
                : 'Search groups...'
            }
            className="w-full sm:w-72"
          />

          {showSupergroupDropdown && (
            <SelectDropdown
              value={supergroupFilter ?? ''}
              onChange={handleSupergroupFilterChange}
              options={supergroupOptions}
              placeholder="Filter entries"
              disabled={!topologyGroups}
              searchable
              className="w-full sm:w-48 mb-2 ml-auto xl:ml-0"
            />
          )}
        </div>

        <div
          className={`flex items-center justify-between flex-wrap gap-x-4 gap-y-2 ${hasSupergroupDropdown ? reportControlsWithFilterClass : reportControlsClass}`}
        >
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
              onClick={() => handleSupergroupFilterChange('')}
              aria-label="Show all groups"
              className="flex items-center cursor-pointer rounded-full hover:text-brand"
            >
              <XMarkIcon className="size-4" />
            </button>
          </Badge>
        </div>
      )}

      {isResultsLoading ? (
        <div className="loading-container">
          <LoadingSpinner size="md" />
        </div>
      ) : isNotFoundError(resultsError) ? (
        <div className={noticeContainerClass}>
          <p className={noticeTextClass}>
            {supergroupsView
              ? 'This report has no supergroup data for the selected period'
              : 'This report has no data for the selected period'}
          </p>
        </div>
      ) : resultsError ? (
        <ErrorDisplay
          error={resultsError}
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
