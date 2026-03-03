import { useGetAllPagesQuery, useDeletePageMutation } from '@/hooks/usePages'
import { useGetUserPages } from '@/hooks/useUsers'
import {
  ArrowTopRightOnSquareIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/16/solid'
import { useNavigate } from 'react-router-dom'
import ConfirmDialog from '@/components/ConfirmDialog'
import ErrorDisplay from '@/components/ErrorDisplay'
import LoadingSpinner from '@/components/LoadingSpinner'
import { toast, Toaster } from 'sonner'
import { useState } from 'react'
import Button from '@/components/Button'
import { useGetUserTenants } from '@/hooks/useTenants'
import { useAuth } from '@/auth/useAuth'
import { useGetUserProfile } from '@/hooks/useProfile'
import type { UserGroup } from '@/types/profile'

const pageSize = 10

const View = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [tenantId, setTenantId] = useState<string>('')
  const [isAllSelected, setIsAllSelected] = useState<boolean>(true)

  const { profile } = useAuth()
  const { data: userProfileData } = useGetUserProfile()
  const { data: tenantsData } = useGetUserTenants(1, 100, undefined, true)

  const isSuperAdmin = profile?.roles?.includes('super_admin')

  // Check if user is admin in at least one tenant
  const isAdminInAtLeastOneTenant = () => {
    if (isSuperAdmin) return true
    if (!userProfileData?.groups || userProfileData.groups.length === 0)
      return false

    return userProfileData.groups.some(
      (group: UserGroup) => group.role === 'admin',
    )
  }

  const canCreateStatusPage = isAdminInAtLeastOneTenant()

  const {
    data: allUserPagesData,
    isLoading: allPagesLoading,
    error: allPagesError,
  } = useGetUserPages(currentPage, pageSize, isAllSelected)

  const {
    data: tenantPagesData,
    isLoading: tenantPagesLoading,
    error: tenantPagesError,
  } = useGetAllPagesQuery(tenantId, currentPage, pageSize, !isAllSelected)

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
        onError: (error) => {
          toast.error(`Failed to delete page: ${error.message}`)
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
      <Toaster richColors position="top-center" duration={2000} />
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Status Page"
        message={
          pageToDelete ? (
            <>
              Are you sure you want to delete status page{' '}
              <strong>{pageToDelete.name}</strong> ?
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
        <div className="pb-1 mb-4 md:mb-6 px-2 md:px-0 flex items-center justify-between">
          <div>
            <h1 className="page-title">Status Pages</h1>
            <p className="page-subtitle">View and manage your pages</p>
          </div>
          {canCreateStatusPage && (
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/status-pages/build')}
            >
              Create Status Page
            </Button>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tenants:
            </label>
            <select
              className="input w-full max-w-md"
              value={tenantId}
              onChange={(e) => {
                if (e.target.value === 'all') {
                  setIsAllSelected(true)
                  setTenantId('')
                  setCurrentPage(1)
                  return
                }
                setIsAllSelected(false)
                setTenantId(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="all">All</option>
              {tenantsData?.content.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.info.name}
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="loading-container">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="px-6 py-4">
              <ErrorDisplay error={error} context="status pages" />
            </div>
          ) : (
            <div className="max-h-[calc(100vh-280px)] overflow-x-auto overflow-y-auto mt-4">
              <table className="w-full table-fixed min-w-[800px]">
                <thead className="border-b border-gray-200 ">
                  <tr>
                    <th
                      className={`${isAllSelected ? 'w-[18%]' : 'w-[22%]'} px-2 lg:px-4 py-1 text-left text-sm font-semibold text-gray-900 tracking-wider`}
                    >
                      Name
                    </th>
                    <th
                      className={`${isAllSelected ? 'w-[18%]' : 'w-[22%]'} px-2 lg:px-4 py-1 text-left text-sm font-semibold text-gray-900 tracking-wider`}
                    >
                      Path
                    </th>
                    <th
                      className={`${isAllSelected ? 'w-[15%]' : 'w-[18%]'} px-2 lg:px-4 py-1 text-left text-sm font-semibold text-gray-900 tracking-wider`}
                    >
                      Report
                    </th>
                    {isAllSelected && (
                      <th className="w-[17%] px-2 lg:px-4 py-1 text-left text-sm font-semibold text-gray-900 tracking-wider">
                        Tenant Name
                      </th>
                    )}
                    <th
                      className={`${isAllSelected ? 'w-[15%]' : 'w-[18%]'} px-2 lg:px-4 py-1 text-left text-sm font-semibold text-gray-900 tracking-wider`}
                    >
                      Updated
                    </th>
                    <th
                      className={`${isAllSelected ? 'w-[12%]' : 'w-[15%]'} px-2 lg:px-4 py-1 text-left text-sm font-semibold text-gray-900 tracking-wider`}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data?.content && data.content?.length > 0 ? (
                    data.content.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-2 lg:px-4 py-3 md:py-4">
                          <span className="text-xs md:text-sm text-gray-900 break-words">
                            {item.name}
                          </span>
                        </td>
                        <td className="px-2 lg:px-4 py-3 md:py-4">
                          <span className="text-xs md:text-sm text-gray-700 font-mono break-all">
                            {item.slug}
                          </span>
                        </td>
                        <td className="px-2 lg:px-4 py-4 text-sm text-gray-700">
                          <span className="break-words">{item.report}</span>
                        </td>
                        {isAllSelected && (
                          <td className="px-2 lg:px-4 py-4 text-sm text-gray-700">
                            <span className="break-words">
                              {'tenant_name' in item ? item.tenant_name : ''}
                            </span>
                          </td>
                        )}
                        <td className="px-2 lg:px-4 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
                          {item?.updated_at
                            ? new Date(item.updated_at).toLocaleDateString(
                                'en-GB',
                                {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  timeZone: 'UTC',
                                },
                              )
                            : item?.created_at
                              ? new Date(item.created_at).toLocaleDateString(
                                  'en-GB',
                                  {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    timeZone: 'UTC',
                                  },
                                )
                              : null}
                        </td>
                        <td className="px-1 lg:px-3 py-3 md:py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handlePageView(item.slug)}
                              className="tooltip p-1 md:p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              data-tip="View"
                              aria-label="View Page"
                            >
                              <ArrowTopRightOnSquareIcon className="size-4 md:size-5" />
                            </button>
                            <button
                              onClick={() =>
                                handlePageEdit(item.id, item.tenant_id)
                              }
                              className="tooltip p-1 md:p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                              data-tip="Edit"
                              aria-label="Edit Page"
                            >
                              <PencilSquareIcon className="size-4 md:size-5" />
                            </button>
                            <button
                              onClick={() =>
                                handlePageDeleteClick(
                                  item.id,
                                  item.name,
                                  item.tenant_id,
                                )
                              }
                              className="tooltip p-1 md:p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              data-tip="Delete"
                              aria-label="Delete Page"
                            >
                              <TrashIcon className="size-4 md:size-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={isAllSelected ? 6 : 5}
                        className="text-center py-9"
                      >
                        <p className="text-sm md:text-base text-gray-500">
                          {isAllSelected
                            ? 'No status pages found'
                            : 'No status pages found for this tenant'}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {tenantId && data?.content && data.content?.length > 0 && (
          <div className="flex items-center justify-between px-4 py-1 border border-gray-200 rounded-lg my-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                Page {currentPage} of {data.total_pages}
              </span>
              <span className="text-sm text-gray-500">
                ({data.total_elements} total status pages)
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
    </div>
  )
}

export default View
