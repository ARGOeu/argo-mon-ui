import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetTenantPages, useDeletePageMutation } from '@/hooks/usePages'
import { useGetUserTenantById } from '@/hooks/useTenants'
import { toast } from 'sonner'
import ConfirmDialog from '@/components/ConfirmDialog'
import PageHeader from '@/components/PageHeader'
import Pagination from '@/components/Pagination'
import StatusPagesTable from './StatusPagesTable'

const pageSize = 10

const TenantStatusPages = () => {
  const { id: tenantId } = useParams<{ id: string }>()
  const [currentPage, setCurrentPage] = useState(1)

  const { data: tenantData } = useGetUserTenantById(tenantId ?? '')

  const { data, isLoading, error } = useGetTenantPages(
    tenantId ?? '',
    currentPage,
    pageSize,
  )

  const deleteMutation = useDeletePageMutation()
  const navigate = useNavigate()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pageToDelete, setPageToDelete] = useState<{
    id: string
    name: string
    tenantId: string
  } | null>(null)

  const handlePageView = (slug: string) => {
    window.open(`/status/${slug}`, '_blank')
  }

  const handlePageEdit = (
    id: string | undefined,
    itemTenantId: string | undefined,
  ) => {
    if (id && itemTenantId) {
      navigate(`/status-pages/tenants/${itemTenantId}/pages/${id}`)
    }
  }

  const handlePageDeleteClick = (
    id: string | undefined,
    name: string,
    itemTenantId: string | undefined,
  ) => {
    if (id && itemTenantId) {
      setPageToDelete({ id, name, tenantId: itemTenantId })
      setDeleteDialogOpen(true)
    }
  }

  const handleDeleteConfirm = () => {
    if (!pageToDelete) return

    deleteMutation.mutate(
      { tenantId: pageToDelete.tenantId, pageId: pageToDelete.id },
      {
        onSuccess: () => {
          toast.success('Status page deleted successfully!')
          setDeleteDialogOpen(false)
          setPageToDelete(null)

          if (data?.content && data.content.length === 1 && currentPage > 1) {
            setCurrentPage((prev) => prev - 1)
          }
        },
        onError: (err) => {
          toast.error(`Failed to delete page: ${err.message}`)
        },
      },
    )
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setPageToDelete(null)
  }

  return (
    <div className="flex flex-col justify-center items-center">
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Status Page"
        message={
          pageToDelete ? (
            <>
              Are you sure you want to delete status page{' '}
              <strong>{pageToDelete.name}</strong>?
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
      <div className="page-container">
        <PageHeader
          title="Status Pages"
          subtitle={
            <>
              View and manage your pages for tenant
              <strong className="break-all">
                {tenantData?.info.name ? ` ${tenantData.info.name}` : '...'}
              </strong>
            </>
          }
          className="pb-1 mb-2 md:mb-4 px-2 md:px-0"
        />
        <StatusPagesTable
          data={data}
          isLoading={isLoading}
          error={error}
          isAllSelected={false}
          onView={handlePageView}
          onEdit={handlePageEdit}
          onDeleteClick={handlePageDeleteClick}
        />
        {data?.content && data.content.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={data.total_pages}
            totalElements={data.total_elements}
            itemLabel="status pages"
            className="py-1 my-2"
            onPrev={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            onNext={() =>
              setCurrentPage((prev) => Math.min(data.total_pages, prev + 1))
            }
          />
        )}
      </div>
    </div>
  )
}

export default TenantStatusPages
