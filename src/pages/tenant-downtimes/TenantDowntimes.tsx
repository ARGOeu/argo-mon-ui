import { useEffect, useState } from 'react'
import { useSelectedTenant } from '@/contexts/selected-tenant'
import {
  useGetTenantDowntimes,
  useDeleteDowntimeMutation,
} from '@/hooks/useDowntimes'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { XMarkIcon } from '@heroicons/react/16/solid'
import Button from '@/components/Button'
import ConfirmDialog from '@/components/ConfirmDialog'
import IconButton from '@/components/IconButton'
import PageHeader from '@/components/PageHeader'
import DowntimesList from './DowntimesList'
import { useCanManageDowntimes } from './useCanManageDowntimes'
import type { DowntimeResponse } from '@/types/downtimes'

const pageSize = 20

const TenantDowntimes = () => {
  const { id: tenantId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [dateFilter, setDateFilter] = useState('')

  const { tenant: tenantData } = useSelectedTenant()
  const { canManage } = useCanManageDowntimes()

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetTenantDowntimes(tenantId ?? '', pageSize, dateFilter || undefined)

  const downtimes = data?.pages.flatMap((page) => page.content) ?? []
  const isFullyLoaded = !isLoading && (hasNextPage === false || !!error)

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && !error) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, error, fetchNextPage])

  const handleDateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter(e.target.value)
  }

  const deleteMutation = useDeleteDowntimeMutation()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [downtimeToDelete, setDowntimeToDelete] =
    useState<DowntimeResponse | null>(null)

  const handleEdit = (downtime: DowntimeResponse) => {
    navigate(`/tenants/${tenantId}/downtimes/${downtime.id}/edit`)
  }

  const handleDeleteClick = (downtime: DowntimeResponse) => {
    setDowntimeToDelete(downtime)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!downtimeToDelete || !tenantId) {
      return
    }

    deleteMutation.mutate(
      { tenantId, downtimeId: downtimeToDelete.id },
      {
        onSuccess: () => {
          toast.success('Downtime deleted successfully!')
          setDeleteDialogOpen(false)
          setDowntimeToDelete(null)
        },
        onError: (err) => {
          toast.error(`Failed to delete downtime: ${err.message}`)
        },
      },
    )
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setDowntimeToDelete(null)
  }

  return (
    <div className="page-container mb-8">
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Downtime"
        message={
          downtimeToDelete ? (
            <>
              Are you sure you want to delete the downtime{' '}
              <strong>{downtimeToDelete.name}</strong>?
              <br />
              <span className="text-amber-600 font-medium">
                This action cannot be undone.
              </span>
            </>
          ) : (
            ''
          )
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      <PageHeader
        className="mb-0.5"
        title="Downtimes"
        subtitle={
          <>
            View and manage scheduled maintenance for tenant
            <strong className="break-all">
              {tenantData?.info.name ? ` ${tenantData.info.name}` : '...'}
            </strong>
          </>
        }
      >
        {canManage && (
          <Button
            variant="primary"
            size="md"
            href={`/tenants/${tenantId}/downtimes/create`}
          >
            Create Downtime
          </Button>
        )}
      </PageHeader>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <label className="text-sm text-muted">Select a specific date:</label>
        <div className="flex items-center gap-1">
          <input
            type="date"
            value={dateFilter}
            onChange={handleDateFilterChange}
            onClick={(e) => e.currentTarget.showPicker?.()}
            className="text-sm"
          />
          {dateFilter && (
            <IconButton
              icon={<XMarkIcon className="size-4.5" />}
              label=""
              onClick={() => setDateFilter('')}
              className="text-muted hover:bg-surface-strong !p-1"
            />
          )}
        </div>
      </div>

      <DowntimesList
        key={dateFilter}
        downtimes={downtimes}
        isLoading={!isFullyLoaded}
        error={error}
        canManage={canManage}
        onEdit={handleEdit}
        onDeleteClick={handleDeleteClick}
      />
    </div>
  )
}

export default TenantDowntimes
