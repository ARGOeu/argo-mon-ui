import { useState } from 'react'
import { useGetTenants, useDeleteTenantMutation } from '@/hooks/useTenants'
import {
  ArrowPathIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/16/solid'
import { Button } from '@/components/Button'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useNavigate } from 'react-router-dom'
import { toast, Toaster } from 'sonner'
import styles from './Tenants.module.css'

export const Tenants = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 2
  const { data, isLoading } = useGetTenants(currentPage, pageSize)
  const deleteMutation = useDeleteTenantMutation()
  const navigate = useNavigate()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tenantToDelete, setTenantToDelete] = useState<{
    id: string
    name: string
  } | null>(null)

  const tenants =
    (data &&
      data?.content?.length > 0 &&
      data.content.map((tenant) => ({
        ...tenant?.info,
        id: tenant?.id,
      }))) ||
    []

  const handleEdit = (tenantId: string) => {
    navigate(`/tenants/edit/${tenantId}`)
  }

  const handleDeleteClick = (id: string, name: string) => {
    setTenantToDelete({ id, name })
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!tenantToDelete) return

    deleteMutation.mutate(tenantToDelete.id, {
      onSuccess: () => {
        toast.success('Tenant deleted successfully!')
        setDeleteDialogOpen(false)
        setTenantToDelete(null)
      },
      onError: (error) => {
        toast.error(`Failed to delete tenant: ${error.message}`)
      },
    })
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setTenantToDelete(null)
  }

  return (
    <div className={styles.container}>
      <Toaster richColors position="top-center" duration={2000} />
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Tenant"
        message={`Are you sure you want to delete the tenant "${tenantToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
      <div className={styles.header}>
        <div>
          <h1 className="page-title">Tenants</h1>
          <p className="page-subtitle">
            Manage and create new tenants for the monitoring service
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/tenants/create')}
        >
          Create New Tenant
        </Button>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <ArrowPathIcon className="animate-spin size-10 text-blue-400" />
        </div>
      ) : (
        <div className={styles.grid}>
          {tenants && tenants?.length > 0 ? (
            tenants.map((tenant) => (
              <div key={tenant.id} className={styles.card}>
                <div className={styles['card-content']}>
                  <div className={styles['card-header']}>
                    <div className={styles['image-container']}>
                      {tenant.image ? (
                        <img
                          className={styles['tenant-image']}
                          src={tenant.image}
                        />
                      ) : (
                        <div className={styles['tenant-fallback']}>
                          <span className={styles['fallback-text']}>
                            {tenant.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className={styles['info-container']}>
                      <h3 className={styles['tenant-name']}>{tenant.name}</h3>
                      <p className={styles['tenant-email']}>{tenant.email}</p>
                    </div>
                  </div>
                  <p className={styles['tenant-description']}>
                    {tenant.description}
                  </p>
                </div>
                <div className={styles['card-footer']}>
                  <button
                    aria-label="Edit Tenant"
                    className={`${styles['action-button']} ${styles.edit} tooltip`}
                    data-tip="Edit"
                    onClick={() => handleEdit(tenant.id!)}
                  >
                    <PencilSquareIcon className={styles['action-icon']} />
                  </button>
                  <button
                    aria-label="Delete Tenant"
                    className={`${styles['action-button']} ${styles.delete} tooltip`}
                    data-tip="Delete"
                    onClick={() => handleDeleteClick(tenant.id!, tenant.name)}
                  >
                    <TrashIcon className={styles['action-icon']} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className={styles['empty-state']}>
              <p className={styles['empty-text']}>No tenants found.</p>
            </div>
          )}
        </div>
      )}

      {data?.content && data.content?.length > 0 && (
        <div className="flex items-center justify-between px-4 py-1 border border-gray-200 rounded-lg mt-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              Page {currentPage} of {data.total_pages}
            </span>
            <span className="text-sm text-gray-500">
              ({data.total_elements} total items)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeftIcon className="size-5 text-gray-600" />
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(data.total_pages, prev + 1))
              }
              disabled={currentPage >= data.total_pages}
              className="p-1 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRightIcon className="size-5 text-gray-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
