import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetTenantPages, useDeletePageMutation } from '@/hooks/usePages'
import { useGetUserPages } from '@/hooks/useUsers'
import { useSelectedTenant } from '@/contexts/selected-tenant'
import { toast } from 'sonner'
import ConfirmDialog from '@/components/ConfirmDialog'
import Pagination from '@/components/Pagination'
import SelectDropdown from '@/components/SelectDropdown'
import type { SelectOption } from '@/components/SelectDropdown'
import StatusPagesTable from '@/pages/status-pages/StatusPagesTable'
import Button from '@/components/Button'

const pageSize = 10

const StatusPagesManagementTab = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [tenantId, setTenantId] = useState<string>('')
  const [isAllSelected, setIsAllSelected] = useState<boolean>(true)

  const { tenants } = useSelectedTenant()

  const {
    data: allUserPagesData,
    isLoading: allPagesLoading,
    error: allPagesError,
  } = useGetUserPages(currentPage, pageSize, isAllSelected)

  const {
    data: tenantPagesData,
    isLoading: tenantPagesLoading,
    error: tenantPagesError,
  } = useGetTenantPages(tenantId, currentPage, pageSize, !isAllSelected)

  const data = isAllSelected ? allUserPagesData : tenantPagesData
  const isLoading = isAllSelected ? allPagesLoading : tenantPagesLoading
  const error = isAllSelected ? allPagesError : tenantPagesError

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
    const effectiveTenantId = isAllSelected ? itemTenantId : tenantId
    if (id && effectiveTenantId) {
      navigate(`/status-pages/tenants/${effectiveTenantId}/pages/${id}`)
    }
  }

  const handlePageDeleteClick = (
    id: string | undefined,
    name: string,
    itemTenantId: string | undefined,
  ) => {
    const effectiveTenantId = isAllSelected ? itemTenantId : tenantId
    if (id && effectiveTenantId) {
      setPageToDelete({ id, name, tenantId: effectiveTenantId })
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
    <div>
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

      <div className="flex items-center justify-end mb-3">
        <Button
          variant="primary"
          size="md"
          href="/status-pages/build"
          className=""
        >
          Create Status Page
        </Button>
      </div>

      <div className="bg-white border border-line rounded-lg shadow-sm overflow-hidden">
        <div className="bg-surface-strong px-4 py-3 border-b border-line flex items-center gap-2">
          <label className="block text-sm font-medium text-body">
            Select Tenant:
          </label>
          <SelectDropdown
            className="min-w-[280px] max-w-md"
            value={isAllSelected ? 'all' : tenantId}
            options={
              [
                { value: 'all', label: 'All' },
                ...tenants.map((tenant) => ({
                  value: tenant.id ?? '',
                  label: tenant.info.name,
                })),
              ] satisfies SelectOption[]
            }
            onChange={(value) => {
              if (value === 'all') {
                setIsAllSelected(true)
                setTenantId('')
                setCurrentPage(1)
                return
              }
              setIsAllSelected(false)
              setTenantId(value)
              setCurrentPage(1)
            }}
          />
        </div>

        <StatusPagesTable
          data={data}
          isLoading={isLoading}
          error={error}
          isAllSelected={isAllSelected}
          embedded
          onView={handlePageView}
          onEdit={handlePageEdit}
          onDeleteClick={handlePageDeleteClick}
        />
      </div>

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
  )
}

export default StatusPagesManagementTab
