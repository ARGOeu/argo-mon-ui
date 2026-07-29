import { useEffect, useMemo, useState } from 'react'
import { useSelectedTenant } from '@/contexts/selected-tenant'
import {
  useGetTenantDowntimes,
  useDeleteDowntimeMutation,
} from '@/hooks/useDowntimes'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import Button from '@/components/Button'
import ConfirmDialog from '@/components/ConfirmDialog'
import PageHeader from '@/components/PageHeader'
import DowntimesList from './DowntimesList'
import { useCanManageDowntimes } from './useCanManageDowntimes'
import { getTodayDateString } from './utils/downtimeDateRanges'
import type { DowntimeTab } from './utils/downtimeGrouping'
import type { Downtime } from '@/types/downtimes'

const pageSize = 10

const TenantDowntimes = () => {
  const { id: tenantId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [completedDateFilter, setCompletedDateFilter] = useState('')
  const [activeTab, setActiveTab] = useState<DowntimeTab>('active-upcoming')

  const { tenant: tenantData } = useSelectedTenant()
  const { canManage } = useCanManageDowntimes()

  const today = useMemo(() => getTodayDateString(), [])

  const {
    data: activeUpcomingData,
    isLoading: isActiveUpcomingLoading,
    error: activeUpcomingError,
    fetchNextPage: fetchNextActiveUpcomingPage,
    hasNextPage: hasNextActiveUpcomingPage,
    isFetchingNextPage: isFetchingNextActiveUpcomingPage,
  } = useGetTenantDowntimes(tenantId ?? '', {
    size: pageSize,
    startDate: today,
    enabled: activeTab === 'active-upcoming',
  })

  const {
    data: completedData,
    isLoading: isCompletedLoading,
    error: completedError,
    fetchNextPage: fetchNextCompletedPage,
    hasNextPage: hasNextCompletedPage,
    isFetchingNextPage: isFetchingNextCompletedPage,
  } = useGetTenantDowntimes(tenantId ?? '', {
    size: pageSize,
    date: completedDateFilter || undefined,
    endDate: completedDateFilter ? undefined : today,
    enabled: activeTab === 'completed',
  })

  useEffect(() => {
    if (activeTab !== 'active-upcoming') {
      return
    }
    if (
      hasNextActiveUpcomingPage &&
      !isFetchingNextActiveUpcomingPage &&
      !activeUpcomingError
    ) {
      fetchNextActiveUpcomingPage()
    }
  }, [
    activeTab,
    hasNextActiveUpcomingPage,
    isFetchingNextActiveUpcomingPage,
    activeUpcomingError,
    fetchNextActiveUpcomingPage,
  ])

  const activeUpcomingDowntimes =
    activeUpcomingData?.pages.flatMap((page) => page.content) ?? []
  const isActiveUpcomingFullyLoaded =
    !isActiveUpcomingLoading &&
    (hasNextActiveUpcomingPage === false || !!activeUpcomingError)

  const completedDowntimes =
    completedData?.pages.flatMap((page) => page.content) ?? []
  const isCompletedFullyLoaded = !isCompletedLoading

  const downtimes =
    activeTab === 'active-upcoming'
      ? activeUpcomingDowntimes
      : completedDowntimes

  const isFullyLoaded =
    activeTab === 'active-upcoming'
      ? isActiveUpcomingFullyLoaded
      : isCompletedFullyLoaded

  const currentError =
    activeTab === 'active-upcoming' ? activeUpcomingError : completedError

  const hasAnyCompletedDowntimes =
    isCompletedFullyLoaded && completedDowntimes.length > 0

  const showDateSelector = !!completedDateFilter || hasAnyCompletedDowntimes

  const handleCompletedDateFilterChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setCompletedDateFilter(e.target.value)
  }

  const deleteMutation = useDeleteDowntimeMutation()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [downtimeToDelete, setDowntimeToDelete] = useState<Downtime | null>(
    null,
  )

  const handleEdit = (downtime: Downtime) => {
    navigate(`/tenants/${tenantId}/downtimes/${downtime.id}/edit`)
  }

  const handleDeleteClick = (downtime: Downtime) => {
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
        className="mb-3"
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

      <DowntimesList
        downtimes={downtimes}
        isLoading={!isFullyLoaded}
        error={currentError}
        canManage={canManage}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasMoreCompleted={hasNextCompletedPage === true}
        isFetchingMoreCompleted={isFetchingNextCompletedPage}
        onLoadMoreCompleted={fetchNextCompletedPage}
        dateFilter={completedDateFilter}
        onDateFilterChange={handleCompletedDateFilterChange}
        onClearDateFilter={() => setCompletedDateFilter('')}
        showDateSelector={showDateSelector}
        onEdit={handleEdit}
        onDeleteClick={handleDeleteClick}
      />
    </div>
  )
}

export default TenantDowntimes
