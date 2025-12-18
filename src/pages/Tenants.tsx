import { useState, useEffect } from 'react'
import {
  useGetTenants,
  useGetUserTenants,
  useDeleteTenantMutation,
} from '@/hooks/useTenants'
import { useGetUserProfile } from '@/hooks/useProfile'
import { useAuth } from '@/auth/useAuth'
import {
  ArrowPathIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  ListBulletIcon,
} from '@heroicons/react/16/solid'
import Button from '@/components/Button'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useNavigate } from 'react-router-dom'
import { toast, Toaster } from 'sonner'
import styles from './Tenants.module.css'
import type { UserGroup } from '@/types/profile'

const pageSize = 9

const Tenants = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tenantToDelete, setTenantToDelete] = useState<{
    id: string
    name: string
  } | null>(null)

  const { profile } = useAuth()
  const navigate = useNavigate()
  const { data: userProfileData } = useGetUserProfile()

  const isSuperAdmin = profile?.roles?.includes('super_admin')

  const hasTenantAccess =
    (!isSuperAdmin &&
      userProfileData?.groups &&
      userProfileData.groups.length > 0) ||
    false

  const { data: adminData, isLoading: adminLoading } = useGetTenants(
    currentPage,
    pageSize,
    searchQuery,
    isSuperAdmin,
  )
  const { data: userData, isLoading: userLoading } = useGetUserTenants(
    currentPage,
    pageSize,
    searchQuery,
    hasTenantAccess,
  )

  const data = isSuperAdmin ? adminData : userData
  const isLoading = isSuperAdmin ? adminLoading : userLoading

  const deleteMutation = useDeleteTenantMutation()

  const getRoleForTenant = (tenantName: string): string | null => {
    if (isSuperAdmin || !userProfileData?.groups) return null

    const group = userProfileData?.groups?.find(
      (g: UserGroup) => g?.name === tenantName,
    )
    return group?.role || null
  }

  const isTenantAdmin = (tenantName: string) => {
    if (!tenantName) return false
    if (isSuperAdmin) return false
    if (!userProfileData?.groups) return false

    const group = userProfileData?.groups?.find(
      (g: UserGroup) => g?.name === tenantName,
    )
    return group?.role === 'admin'
  }

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput)
      setCurrentPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchInput])

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

  const handleAssignProjects = (tenantId: string) => {
    navigate(`/tenants/${tenantId}/projects/assign`)
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

        if (data?.content && data.content.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1)
        }
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

  const handleClearSearch = () => {
    setSearchInput('')
    setSearchQuery('')
  }

  return (
    <div className={styles.container}>
      <Toaster richColors position="top-center" duration={2000} />
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Tenant"
        message={
          <>
            Are you sure you want to delete the tenant "{tenantToDelete?.name}
            "?
            <br />
            <span className="text-red-600 font-medium">
              This action cannot be undone.
            </span>
          </>
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
      <div className={styles.header}>
        <div>
          <h1 className="page-title">Tenants</h1>
          <p className="page-subtitle">
            {isSuperAdmin
              ? 'Manage and create new tenants for the monitoring service'
              : hasTenantAccess
                ? 'View your tenants'
                : null}
          </p>
        </div>
        {isSuperAdmin && (
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/tenants/create')}
          >
            Create New Tenant
          </Button>
        )}
      </div>

      <div className={styles['search-container']}>
        <div className={styles['search-input-wrapper']}>
          <MagnifyingGlassIcon className={styles['search-icon']} />
          <input
            type="text"
            placeholder="Search tenants..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={styles['search-input']}
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className={styles['clear-button']}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
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
                            {tenant.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className={styles['info-container']}>
                      <div className={styles['name-role-container']}>
                        <h3
                          className={styles['tenant-name']}
                          title={tenant.name}
                        >
                          {tenant.name}
                        </h3>
                        {(() => {
                          if (isSuperAdmin) {
                            return (
                              <span
                                className={`${styles['role-badge']} ${styles['admin']}`}
                              >
                                Admin
                              </span>
                            )
                          }
                          const role = getRoleForTenant(tenant.name)
                          return role ? (
                            <span
                              className={`${styles['role-badge']} ${styles[role.toLowerCase()]}`}
                            >
                              {role.toLowerCase() === 'admin'
                                ? 'Admin'
                                : role.toLowerCase() === 'viewer'
                                  ? 'Member'
                                  : null}
                            </span>
                          ) : null
                        })()}
                      </div>
                      <p
                        className={styles['tenant-email']}
                        title={tenant.email}
                      >
                        {tenant.email}
                      </p>
                    </div>
                  </div>
                  <p className={styles['tenant-description']}>
                    {tenant.description}
                  </p>
                </div>
                {(isSuperAdmin || isTenantAdmin(tenant.name)) && (
                  <div className={styles['card-footer']}>
                    {(isSuperAdmin || isTenantAdmin(tenant.name)) && (
                      <button
                        aria-label="Edit Tenant"
                        className={`${styles['action-button']} ${styles.edit} tooltip`}
                        data-tip="Edit"
                        onClick={() => handleEdit(tenant.id!)}
                      >
                        <PencilSquareIcon className={styles['action-icon']} />
                      </button>
                    )}
                    {isTenantAdmin(tenant.name) && (
                      <button
                        aria-label="View Assigned Projects"
                        className={`${styles['action-button']} ${styles.assign} tooltip`}
                        data-tip="View Assigned Projects"
                        onClick={() => handleAssignProjects(tenant.id!)}
                      >
                        <ListBulletIcon className={styles['action-icon']} />
                      </button>
                    )}
                    {isSuperAdmin && (
                      <>
                        <button
                          aria-label="Assign Projects"
                          className={`${styles['action-button']} ${styles.assign} tooltip`}
                          data-tip="Assign Projects"
                          onClick={() => handleAssignProjects(tenant.id!)}
                        >
                          <PlusCircleIcon className={styles['action-icon']} />
                        </button>
                        <button
                          aria-label="Delete Tenant"
                          className={`${styles['action-button']} ${styles.delete} tooltip`}
                          data-tip="Delete"
                          onClick={() =>
                            handleDeleteClick(tenant.id!, tenant.name)
                          }
                        >
                          <TrashIcon className={styles['action-icon']} />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className={styles['empty-state']}>
              <p className={styles['empty-text']}>No tenants found</p>
            </div>
          )}
        </div>
      )}

      {data?.content && data.content?.length > 0 && (
        <div className="flex items-center justify-between px-4 py-1 border border-gray-200 rounded-lg my-4">
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

export default Tenants
