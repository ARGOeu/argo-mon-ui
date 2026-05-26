import { useState, useEffect } from 'react'
import { useGetUserTenants, useDeleteTenantMutation } from '@/hooks/useTenants'
import { useGetUserProfile } from '@/hooks/useProfile'
import { useAuth } from '@/auth/useAuth'
import Button from '@/components/Button'
import ConfirmDialog from '@/components/ConfirmDialog'
import ErrorDisplay from '@/components/ErrorDisplay'
import LoadingSpinner from '@/components/LoadingSpinner'
import SearchInput from '@/components/SearchInput'
import Pagination from '@/components/Pagination'
import Card from '@/components/Card'
import TenantCardFooter from '@/pages/administration/TenantCardFooter'
import Badge from '@/components/Badge'
import { roleBadgeClass } from '@/utils/badges'
import { toast } from 'sonner'
import type { UserGroup } from '@/types/profile'
import type { Job, JobStatus } from '@/types/tenants'

const pageSize = 9

const getStatusBadgeClass = (status: JobStatus): string => {
  if (status === 'UNKNOWN') return 'bg-surface-strong text-subtle'
  if (status === 'INITIALISING') return 'bg-amber-100 text-amber-700'
  if (status === 'INITIALISED') return 'bg-brand-muted text-blue-600'
  if (status === 'FAILED_INITIALISATION') return 'bg-red-50 text-red-500'
  if (status === 'IN_PROGRESS') return 'bg-sky-100 text-blue-500'
  if (status === 'COMPLETED') return 'bg-emerald-50 text-emerald-500'
  if (status === 'FAILED') return 'bg-red-50 text-red-500'
  return ''
}

const TenantManagementTab = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tenantToDelete, setTenantToDelete] = useState<{
    id: string
    name: string
  } | null>(null)

  const { isSuperAdmin } = useAuth()
  const { data: userProfileData } = useGetUserProfile()

  const { data, isLoading, error } = useGetUserTenants(
    currentPage,
    pageSize,
    searchQuery,
  )

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
        status: tenant?.status,
      }))) ||
    []

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
    <>
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Tenant"
        message={
          tenantToDelete ? (
            <>
              Are you sure you want to delete tenant{' '}
              <strong>{tenantToDelete.name}</strong> ?
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

      <div className="flex flex-wrap justify-between items-start gap-3 mb-1">
        <SearchInput
          className="min-w-[24rem]"
          value={searchInput}
          onChange={setSearchInput}
          onClear={handleClearSearch}
          placeholder="Search tenants..."
          maxWidth="max-w-md"
        />
        <Button variant="primary" size="md" href="/tenants/create">
          Create New Tenant
        </Button>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <ErrorDisplay error={error} context="tenants" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
          {tenants && tenants?.length > 0
            ? tenants.map((tenant) => (
                <Card
                  key={tenant.id}
                  footer={
                    <TenantCardFooter
                      isSuperAdmin={!!isSuperAdmin}
                      isAdmin={isTenantAdmin(tenant.name)}
                      tenantId={tenant.id!}
                      onDelete={() =>
                        handleDeleteClick(tenant.id!, tenant.name)
                      }
                    />
                  }
                >
                  <div className="px-5 py-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="shrink-0 rounded-lg">
                        {tenant.image ? (
                          <img
                            className="size-12 rounded-lg object-contain bg-surface-muted p-1"
                            src={tenant.image}
                          />
                        ) : (
                          <div className="size-12 rounded-lg bg-slate-500 flex items-center justify-center">
                            <span className="text-lg font-bold text-white">
                              {tenant.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-0.5">
                          <h3
                            className="text-base font-semibold text-foreground overflow-hidden break-words flex-1 min-w-0 line-clamp-2"
                            title={tenant.name}
                          >
                            {tenant.name}
                          </h3>
                          {(() => {
                            const role = getRoleForTenant(tenant.name)
                            return role ? (
                              <Badge
                                className={`shrink-0 mt-0.5 ${roleBadgeClass[role.toLowerCase()] ?? 'bg-surface-strong text-muted'}`}
                              >
                                {role}
                              </Badge>
                            ) : null
                          })()}
                        </div>
                        <p
                          className="text-xs text-muted overflow-hidden text-ellipsis whitespace-nowrap"
                          title={tenant.email}
                        >
                          {tenant.email}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted line-clamp-3">
                      {tenant.description}
                    </p>
                    {(isSuperAdmin || isTenantAdmin(tenant.name)) &&
                      tenant.status?.jobs &&
                      tenant.status.jobs.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-gray-100">
                          <div className="flex flex-row flex-wrap gap-3">
                            {tenant.status.jobs
                              .filter(
                                (job: Job) => job.name !== 'CHECK_READINESS',
                              )
                              .map((job: Job) => (
                                <Badge
                                  key={job.name}
                                  size="xs"
                                  className={`shrink-0 capitalize ${getStatusBadgeClass(job.status)}`}
                                >
                                  {job.name === 'INIT_AMS'
                                    ? 'AMS'
                                    : job.name === 'INIT_MONGO'
                                      ? 'MongoDB'
                                      : job.name === 'CREATE_DOMAIN_NAMES'
                                        ? 'Domain Names'
                                        : job.name
                                            ?.toLowerCase()
                                            ?.replaceAll('_', ' ')}
                                  :
                                  <span className="ms-1">
                                    {job.status?.toLowerCase()}
                                  </span>
                                </Badge>
                              ))}
                          </div>
                        </div>
                      )}
                  </div>
                </Card>
              ))
            : null}
        </div>
      )}

      {!error && !isLoading && (!tenants || tenants?.length === 0) ? (
        <div className="text-center p-8 bg-surface-muted rounded-lg border border-line">
          <p className="text-muted text-lg">No tenants found</p>
        </div>
      ) : null}

      {data?.content && data.content?.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={data.total_pages}
          totalElements={data.total_elements}
          itemLabel="tenants"
          className="py-1 my-4"
          onPrev={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          onNext={() =>
            setCurrentPage((prev) => Math.min(data.total_pages, prev + 1))
          }
        />
      )}
    </>
  )
}

export default TenantManagementTab
