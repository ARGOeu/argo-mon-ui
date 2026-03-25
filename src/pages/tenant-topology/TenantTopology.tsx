import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/16/solid'
import { useGetUserTenantById } from '@/hooks/useTenants'
import {
  useGetTopologyEndpoints,
  useCreateTopologyEndpointMutation,
} from '@/hooks/useTopology'
import PageHeader from '@/components/PageHeader'
import Button from '@/components/Button'
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
type SortColumn = 'service' | 'group' | 'monitored'
type DateMode = 'latest' | 'custom'

const pageSize = 15

const TenantTopology = () => {
  const { id } = useParams<{ id: string }>()
  const tenantId = id ?? ''
  const navigate = useNavigate()

  const { data: tenantData } = useGetUserTenantById(tenantId)

  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState<SortColumn>('monitored')
  const [sortAsc, setSortAsc] = useState(false)
  const [dateMode, setDateMode] = useState<DateMode>('latest')
  const [customDate, setCustomDate] = useState('')
  const [committedDate, setCommittedDate] = useState('')
  const dateInputRef = useRef<HTMLInputElement>(null)
  const [monitoredFilter, setMonitoredFilter] = useState<
    'monitored' | 'not_monitored'
  >('monitored')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [endpointToDelete, setEndpointToDelete] =
    useState<EndpointTopologyItem | null>(null)

  const effectiveDate = dateMode === 'latest' ? '' : committedDate

  const {
    data: endpoints,
    isLoading,
    error,
  } = useGetTopologyEndpoints(tenantId, effectiveDate)

  const deleteMutation = useCreateTopologyEndpointMutation()

  const handleDeleteClick = (endpoint: EndpointTopologyItem) => {
    setEndpointToDelete(endpoint)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!endpointToDelete) return

    const updatedEndpoints = (endpoints ?? []).filter(
      (endpoint) => endpoint.hostname !== endpointToDelete.hostname,
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput)
      setCurrentPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchInput])

  /* Use native DOM `change` (not React's onChange) so the API is called only when the user picks a full date, not on every arrow-key increment in the date input. */
  useEffect(() => {
    const input = dateInputRef.current
    if (!input) return

    const handleChange = (e: Event) => {
      const value = (e.target as HTMLInputElement).value
      setCommittedDate(value)
      setCurrentPage(1)
    }

    input.addEventListener('change', handleChange)

    return () => input.removeEventListener('change', handleChange)
  }, [dateMode])

  const latestDate = endpoints?.length
    ? endpoints.reduce(
        (max, e) => (e.date > max ? e.date : max),
        endpoints[0].date,
      )
    : ''

  const showActions =
    dateMode === 'latest' ||
    (dateMode === 'custom' && committedDate === latestDate && !!latestDate)

  const handleDateModeChange = (mode: string) => {
    setDateMode(mode as DateMode)
    if (mode === 'custom') {
      setCustomDate(latestDate)
      setCommittedDate(latestDate)
    }
    setCurrentPage(1)
  }

  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomDate(e.target.value)
  }

  const handleSortChange = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortAsc((prev) => !prev)
    } else {
      setSortColumn(column)
      setSortAsc(true)
    }
    setCurrentPage(1)
  }

  const handleSearchClear = () => {
    setSearchInput('')
    setSearchQuery('')
    setCurrentPage(1)
  }

  const filtered = (endpoints ?? []).filter((e) => {
    if (monitoredFilter === 'monitored' && e.tags?.monitored !== '1')
      return false
    if (monitoredFilter === 'not_monitored' && e.tags?.monitored === '1')
      return false
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    const monitoredLabel =
      e.tags?.monitored === '1' ? 'monitored' : 'not monitored'
    return (
      e.service.toLowerCase().includes(q) ||
      e.group.toLowerCase().includes(q) ||
      monitoredLabel.includes(q)
    )
  })

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0
    if (sortColumn === 'service') {
      cmp = a.service.localeCompare(b.service)
    } else if (sortColumn === 'group') {
      cmp = a.group.localeCompare(b.group)
    } else {
      const aVal = a.tags?.monitored ?? '0'
      const bVal = b.tags?.monitored ?? '0'
      cmp = aVal.localeCompare(bVal)
    }
    return sortAsc ? cmp : -cmp
  })

  const totalPages = Math.ceil(sorted.length / pageSize)
  const paginated = sorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  return (
    <>
      <div className="page-container">
        <PageHeader
          title="Topology Endpoints"
          subtitle={
            <>
              Manage topology endpoints for tenant{' '}
              <strong>{tenantData?.info.name ?? '...'}</strong>
            </>
          }
          className="pb-2 mb-4"
        >
          {tenantData?.metadata?.instance?.topology?.type !== 'GOCDB' && (
            <Button
              variant="primary"
              size="md"
              href={`/tenants/${tenantId}/topology/create`}
            >
              Add Topology Endpoint
            </Button>
          )}
        </PageHeader>

        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 w-full">
            <SearchInput
              value={searchInput}
              onChange={setSearchInput}
              onClear={handleSearchClear}
              placeholder="Search by service or group..."
              className="!mb-0 w-full"
            />
            <SelectDropdown
              value={monitoredFilter}
              onChange={(value) => {
                setMonitoredFilter(value as 'monitored' | 'not_monitored')
                setCurrentPage(1)
              }}
              options={[
                { value: 'monitored', label: 'Monitored' },
                { value: 'not_monitored', label: 'Not monitored' },
              ]}
              className="w-40 shrink-0"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-px bg-line-strong me-1" />
            {dateMode === 'custom' && (
              <input
                ref={dateInputRef}
                type="date"
                value={customDate}
                onChange={handleCustomDateChange}
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
                  isActive={sortColumn === 'monitored'}
                  isAscending={sortAsc}
                  onClick={() => handleSortChange('monitored')}
                >
                  Monitored
                </SortableColumnHeader>
              </th>
              <th className={`${thBase} min-w-28`}>Date</th>
              {showActions && <th className={`${thBase} w-24`}>Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={showActions ? 6 : 5} className="py-12">
                  <div className="flex justify-center">
                    <LoadingSpinner size="md" />
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={showActions ? 6 : 5} className="py-6 px-12">
                  <ErrorDisplay error={error} context="topology endpoints" />
                </td>
              </tr>
            ) : !endpoints?.length ? (
              <tr>
                <td
                  colSpan={showActions ? 6 : 5}
                  className="text-center text-sm text-subtle italic py-6 px-12"
                >
                  No topology endpoints found
                </td>
              </tr>
            ) : !paginated.length ? (
              <tr>
                <td
                  colSpan={showActions ? 6 : 5}
                  className="text-center text-sm text-subtle italic py-6 px-12"
                >
                  No endpoints match your filters
                </td>
              </tr>
            ) : (
              paginated.map((endpoint) => (
                <tr
                  key={endpoint.id}
                  className="hover:bg-surface-muted transition-colors"
                >
                  <td className={tdBase}>{endpoint.service}</td>
                  <td className={`${tdBase} font-mono text-xs break-all`}>
                    {endpoint.hostname}
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
                          icon={
                            <PencilSquareIcon className="size-4 md:size-5" />
                          }
                          label="Edit"
                          onClick={() =>
                            navigate(
                              `/tenants/${tenantId}/topology/edit/${endpoint.id}`,
                            )
                          }
                          className="text-muted hover:bg-surface-strong"
                        />
                        <IconButton
                          icon={<TrashIcon className="size-4 md:size-5" />}
                          label="Delete"
                          onClick={() => handleDeleteClick(endpoint)}
                          className="text-red-600 hover:bg-red-50"
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
      </div>
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Topology Endpoint"
        message={
          <>
            Are you sure you want to delete the endpoint with URL{' '}
            <strong>{endpointToDelete?.hostname}</strong> ?
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

export default TenantTopology
