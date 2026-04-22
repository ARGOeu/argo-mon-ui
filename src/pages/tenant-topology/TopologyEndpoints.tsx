import { useState } from 'react'
import { toast } from 'sonner'
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/16/solid'
import { useSelectedTenant } from '@/contexts/selected-tenant'
import {
  useGetTopologyEndpoints,
  useCreateTopologyEndpointMutation,
} from '@/hooks/useTopology'
import Button from '@/components/Button'
import { getLatestTopologyDate } from './utils/topologyDateHelpers'
import { sortByField } from './utils/topologySortHelpers'
import { useTopologyListState } from './hooks/useTopologyListState'
import IconButton from '@/components/IconButton'
import ConfirmDialog from '@/components/ConfirmDialog'
import SearchInput from '@/components/SearchInput'
import Pagination from '@/components/Pagination'
import DataTable, {
  thBase,
  tdBase,
  SortableColumnHeader,
} from '@/components/DataTable'
import Badge from '@/components/Badge'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import SelectDropdown from '@/components/SelectDropdown'
import type { EndpointTopologyItem } from '@/types/topology'

type SortColumn = 'service' | 'group' | 'tags.monitored'

const pageSize = 15

interface TopologyEndpointsProps {
  tenantId: string
  onEdit: (endpoint: EndpointTopologyItem) => void
}

const TopologyEndpoints = ({ tenantId, onEdit }: TopologyEndpointsProps) => {
  const { tenant: tenantData } = useSelectedTenant()
  const [monitoredFilter, setMonitoredFilter] = useState<
    'all' | 'monitored' | 'not_monitored'
  >('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [endpointToDelete, setEndpointToDelete] = useState<{
    endpoint: EndpointTopologyItem
    index: number
  } | null>(null)

  const { data: latestEndpoints } = useGetTopologyEndpoints(tenantId, '')
  const latestDate = getLatestTopologyDate(latestEndpoints)

  const {
    searchInput,
    setSearchInput,
    currentPage,
    setCurrentPage,
    sortColumn,
    sortAsc,
    dateMode,
    dateInput,
    committedDate,
    showActions,
    handleDateInputChange,
    handleDateModeChange,
    handleSortChange,
    handleSearchClear,
  } = useTopologyListState<SortColumn>({
    latestDate,
  })

  const {
    data: endpoints,
    isLoading,
    isFetching,
    error,
  } = useGetTopologyEndpoints(tenantId, committedDate)

  const deleteMutation = useCreateTopologyEndpointMutation()

  const handleDeleteClick = (endpoint: EndpointTopologyItem, index: number) => {
    setEndpointToDelete({ endpoint, index })
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!endpointToDelete) return

    const updatedEndpoints = (endpoints ?? []).filter(
      (endpoint, index) =>
        !(
          index === endpointToDelete.index &&
          endpoint.hostname === endpointToDelete.endpoint.hostname
        ),
    )

    deleteMutation.mutate(
      { tenantId, data: updatedEndpoints },
      {
        onSuccess: () => {
          toast.success('Topology endpoint deleted successfully!')
          setDeleteDialogOpen(false)
          setEndpointToDelete(null)
          if (paginated.length === 1 && currentPage > 1) {
            setCurrentPage((prev) => prev - 1)
          }
        },
        onError: (error) => {
          toast.error(`Failed to delete endpoint: ${error.message}`)
        },
      },
    )
  }

  const filtered = (endpoints ?? []).filter((e) => {
    if (monitoredFilter === 'monitored' && e.tags?.monitored !== '1') {
      return false
    }
    if (monitoredFilter === 'not_monitored' && e.tags?.monitored === '1') {
      return false
    }
    if (!searchInput) return true
    const q = searchInput.toLowerCase()
    const monitoredLabel =
      e.tags?.monitored === '1' ? 'monitored' : 'not monitored'
    return (
      e.service.toLowerCase().includes(q) ||
      e.group.toLowerCase().includes(q) ||
      e.hostname.toLowerCase().includes(q) ||
      (e.tags?.info_URL ?? '').toLowerCase().includes(q) ||
      monitoredLabel.includes(q)
    )
  })

  const sorted = sortByField(filtered, sortColumn, sortAsc)

  const totalPages = Math.ceil(sorted.length / pageSize)
  const paginated = sorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  return (
    <>
      <div className="flex flex-wrap xl:flex-nowrap items-center gap-3 mb-3">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          onClear={handleSearchClear}
          placeholder="Search by service, hostname, URL or group..."
          className="!mb-0 flex-1 max-w-xs xl:max-w-none"
        />
        {tenantData?.metadata?.instance?.topology?.type !== 'GOCDB' && (
          <Button
            variant="primary"
            size="md"
            href={`/tenants/${tenantId}/topology/create`}
            className="shrink-0 xl:order-last ms-auto xl:ms-2"
          >
            Add Endpoint
          </Button>
        )}
        <div className="flex items-center gap-2 w-full xl:w-auto">
          <div className="hidden xl:block h-8 w-px bg-line-strong me-1" />
          {dateMode === 'custom' && (
            <input
              type="date"
              value={dateInput}
              onChange={handleDateInputChange}
              onClick={(e) => e.currentTarget.showPicker?.()}
              className="text-sm"
            />
          )}
          <SelectDropdown
            value={dateMode}
            onChange={handleDateModeChange}
            options={[
              { value: 'latest', label: 'Latest' },
              { value: 'custom', label: 'Select date' },
            ]}
            className="w-36"
          />
          <SelectDropdown
            value={monitoredFilter}
            onChange={(value) => {
              setMonitoredFilter(value as 'all' | 'monitored' | 'not_monitored')
              setCurrentPage(1)
            }}
            options={[
              { value: 'all', label: 'All' },
              { value: 'monitored', label: 'Monitored' },
              { value: 'not_monitored', label: 'Not monitored' },
            ]}
            className="w-40 shrink-0 ms-auto xl:ms-0 xl:order-first"
          />
        </div>
      </div>

      <DataTable>
        <thead className="bg-surface-strong border-b border-line">
          <tr>
            <th className={`${thBase} min-w-28`}>
              <SortableColumnHeader
                isActive={sortColumn === 'service'}
                isAscending={sortAsc}
                onClick={() => handleSortChange('service')}
              >
                Service
              </SortableColumnHeader>
            </th>
            <th className={`${thBase} min-w-32`}>Hostname</th>
            <th className={`${thBase} min-w-40`}>URL</th>
            <th className={`${thBase} min-w-24`}>
              <SortableColumnHeader
                isActive={sortColumn === 'group'}
                isAscending={sortAsc}
                onClick={() => handleSortChange('group')}
              >
                Group
              </SortableColumnHeader>
            </th>
            <th className={`${thBase} min-w-24`}>
              <SortableColumnHeader
                isActive={sortColumn === 'tags.monitored'}
                isAscending={sortAsc}
                onClick={() => handleSortChange('tags.monitored')}
              >
                Monitored
              </SortableColumnHeader>
            </th>
            <th className={`${thBase} min-w-28`}>Date</th>
            {showActions && <th className={`${thBase} w-24`}>Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {isLoading || isFetching ? (
            <tr>
              <td colSpan={showActions ? 7 : 6} className="py-12">
                <div className="flex justify-center">
                  <LoadingSpinner size="md" />
                </div>
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={showActions ? 7 : 6} className="py-6 px-12">
                <ErrorDisplay error={error} context="topology endpoints" />
              </td>
            </tr>
          ) : !endpoints?.length ? (
            <tr>
              <td
                colSpan={showActions ? 7 : 6}
                className="text-center text-sm text-subtle italic py-6 px-12"
              >
                No topology endpoints found
              </td>
            </tr>
          ) : !paginated.length ? (
            <tr>
              <td
                colSpan={showActions ? 7 : 6}
                className="text-center text-sm text-subtle italic py-6 px-12"
              >
                No endpoints match your filters
              </td>
            </tr>
          ) : (
            paginated.map((endpoint) => (
              <tr
                key={`${endpoint.tags?.info_URL ?? endpoint.hostname}_${endpoint.service}`}
                className="hover:bg-surface-muted transition-colors"
              >
                <td className={tdBase}>{endpoint.service}</td>
                <td className={`${tdBase} font-mono text-xs break-all`}>
                  {endpoint.hostname || (
                    <span className="pl-2 text-subtle">-</span>
                  )}
                </td>
                <td className={`${tdBase} font-mono text-xs break-all`}>
                  {endpoint.tags?.info_URL || (
                    <span className="pl-2 text-subtle">-</span>
                  )}
                </td>
                <td className={tdBase}>{endpoint.group}</td>
                <td className={tdBase}>
                  {endpoint.tags?.monitored !== undefined ? (
                    <Badge
                      size="sm"
                      className={
                        endpoint.tags.monitored === '1'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-surface-strong text-muted'
                      }
                    >
                      {endpoint.tags.monitored === '1'
                        ? 'Monitored'
                        : 'Not Monitored'}
                    </Badge>
                  ) : null}
                </td>
                <td className={tdBase}>{endpoint.date}</td>
                {showActions && (
                  <td className={`${tdBase} whitespace-nowrap`}>
                    <div className="flex items-center gap-1">
                      <IconButton
                        icon={<PencilSquareIcon className="size-4 md:size-5" />}
                        label="Edit"
                        onClick={() => onEdit(endpoint)}
                        className="text-muted hover:bg-surface-strong !p-1"
                      />
                      <IconButton
                        icon={<TrashIcon className="size-4 md:size-5" />}
                        label="Delete"
                        onClick={() => {
                          const indexToDelete = (endpoints ?? []).indexOf(
                            endpoint,
                          )
                          handleDeleteClick(endpoint, indexToDelete)
                        }}
                        className="text-red-600 hover:bg-red-50 !p-1"
                      />
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </DataTable>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={sorted.length}
        itemLabel="endpoints"
        onPrev={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
        onNext={() => setCurrentPage((prev) => prev + 1)}
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Topology Endpoint"
        message={
          <>
            Are you sure you want to delete the endpoint with URL{' '}
            <strong>
              {endpointToDelete?.endpoint.tags?.info_URL ??
                endpointToDelete?.endpoint.hostname}
            </strong>{' '}
            ?
            <br />
            <span className="text-amber-600 font-medium">
              This action cannot be undone.
            </span>
          </>
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false)
          setEndpointToDelete(null)
        }}
      />
    </>
  )
}

export default TopologyEndpoints
