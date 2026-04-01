import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/16/solid'
import { useGetUserTenantById } from '@/hooks/useTenants'
import {
  useGetTopologyGroups,
  useCreateTopologyGroupsMutation,
} from '@/hooks/useTopology'
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
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import SelectDropdown from '@/components/SelectDropdown'
import type { GroupTopologyItem } from '@/types/topology'

type SortColumn = 'subgroup'
type DateMode = 'latest' | 'custom'

const pageSize = 15

interface TopologyGroupsProps {
  tenantId: string
  onEdit: (group: GroupTopologyItem) => void
}

const TopologyGroups = ({ tenantId, onEdit }: TopologyGroupsProps) => {
  const { data: tenantData } = useGetUserTenantById(tenantId)

  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState<SortColumn>('subgroup')
  const [sortAsc, setSortAsc] = useState(true)
  const [dateMode, setDateMode] = useState<DateMode>('latest')
  const [committedDate, setCommittedDate] = useState('')
  const dateInputRef = useRef<HTMLInputElement>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [groupToDelete, setGroupToDelete] = useState<{
    group: GroupTopologyItem
    index: number
  } | null>(null)

  const effectiveDate = dateMode === 'latest' ? '' : committedDate

  const {
    data: groups,
    isLoading,
    isFetching,
    error,
  } = useGetTopologyGroups(tenantId, effectiveDate)

  const { data: latestGroups } = useGetTopologyGroups(tenantId, '')

  const deleteMutation = useCreateTopologyGroupsMutation()

  const handleDeleteClick = (group: GroupTopologyItem, index: number) => {
    setGroupToDelete({ group, index })
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!groupToDelete) return

    const updatedGroups = (groups ?? []).filter(
      (group, index) =>
        !(
          index === groupToDelete.index &&
          group.subgroup === groupToDelete.group.subgroup
        ),
    )

    deleteMutation.mutate(
      { tenantId, data: updatedGroups },
      {
        onSuccess: () => {
          toast.success('Topology group deleted successfully!')
          setDeleteDialogOpen(false)
          setGroupToDelete(null)
          if (paginated.length === 1 && currentPage > 1) {
            setCurrentPage((prev) => prev - 1)
          }
        },
        onError: (error) => {
          toast.error(`Failed to delete group: ${error.message}`)
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

  const latestDate = latestGroups?.length
    ? latestGroups.reduce(
        (max, g) => (g.date > max ? g.date : max),
        latestGroups[0].date,
      )
    : ''

  const showActions =
    dateMode === 'latest' ||
    (dateMode === 'custom' && committedDate === latestDate && !!latestDate)

  const handleDateModeChange = (mode: string) => {
    setDateMode(mode as DateMode)
    if (mode === 'custom') {
      if (dateInputRef.current) {
        dateInputRef.current.value = latestDate
      }
      setCommittedDate(latestDate)
    }
    setCurrentPage(1)
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

  const filtered = (groups ?? []).filter((g) => {
    if (!searchQuery) return true
    return g.subgroup.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const sorted = [...filtered].sort((a, b) => {
    const cmp = a.subgroup.localeCompare(b.subgroup)
    return sortAsc ? cmp : -cmp
  })

  const totalPages = Math.ceil(sorted.length / pageSize)
  const paginated = sorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  return (
    <>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 w-full">
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            onClear={handleSearchClear}
            placeholder="Search by group..."
            className="!mb-0 w-full"
          />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {dateMode === 'custom' && (
            <input
              ref={dateInputRef}
              type="date"
              defaultValue={latestDate || undefined}
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
          {tenantData?.metadata?.instance?.topology?.type !== 'GOCDB' && (
            <Button
              size="md"
              variant="primary"
              href={`/tenants/${tenantId}/topology/groups/create`}
              className="ms-2"
            >
              Add Group
            </Button>
          )}
        </div>
      </div>

      <DataTable tableClassName="table-fixed">
        <thead className="bg-surface-strong border-b border-line">
          <tr>
            <th className={`${thBase} w-[30%]`}>
              <SortableColumnHeader
                isActive={sortColumn === 'subgroup'}
                isAscending={sortAsc}
                onClick={() => handleSortChange('subgroup')}
              >
                Group
              </SortableColumnHeader>
            </th>
            <th className={`${thBase} w-[40%]`}>Contacts</th>
            <th className={`${thBase} w-[15%]`}>Date</th>
            {showActions && <th className={`${thBase} w-[8%]`}>Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {isLoading || isFetching ? (
            <tr>
              <td colSpan={showActions ? 4 : 3} className="py-12">
                <div className="flex justify-center">
                  <LoadingSpinner size="md" />
                </div>
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={showActions ? 4 : 3} className="py-6 px-12">
                <ErrorDisplay error={error} context="topology groups" />
              </td>
            </tr>
          ) : !groups?.length ? (
            <tr>
              <td
                colSpan={showActions ? 4 : 3}
                className="text-center text-sm text-subtle italic py-6 px-12"
              >
                No topology groups found
              </td>
            </tr>
          ) : !paginated.length ? (
            <tr>
              <td
                colSpan={showActions ? 4 : 3}
                className="text-center text-sm text-subtle italic py-6 px-12"
              >
                No groups match your filters
              </td>
            </tr>
          ) : (
            paginated.map((group) => (
              <tr
                key={group.subgroup}
                className="hover:bg-surface-muted transition-colors"
              >
                <td className={tdBase}>{group.subgroup}</td>
                <td className={`${tdBase} text-sm text-muted`}>
                  {group.notifications?.contacts?.length ? (
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                      {group.notifications.contacts.map((contact, i, arr) => (
                        <span key={contact}>
                          {contact}
                          {i < arr.length - 1 ? ',' : ''}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="ms-7">-</span>
                  )}
                </td>
                <td className={tdBase}>{group.date}</td>
                {showActions && (
                  <td className={`${tdBase} whitespace-nowrap`}>
                    <div className="flex items-center gap-1">
                      <IconButton
                        icon={<PencilSquareIcon className="size-4 md:size-5" />}
                        label="Edit"
                        onClick={() => onEdit(group)}
                        className="text-muted hover:bg-surface-strong !p-1"
                      />
                      <IconButton
                        icon={<TrashIcon className="size-4 md:size-5" />}
                        label="Delete"
                        onClick={() => {
                          const indexToDelete = (groups ?? []).indexOf(group)
                          handleDeleteClick(group, indexToDelete)
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
        itemLabel="groups"
        onPrev={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
        onNext={() => setCurrentPage((prev) => prev + 1)}
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Topology Group"
        message={
          <>
            Are you sure you want to delete the group{' '}
            <strong>{groupToDelete?.group.subgroup}</strong> ?
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
          setGroupToDelete(null)
        }}
      />
    </>
  )
}

export default TopologyGroups
