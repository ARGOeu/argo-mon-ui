import { useGetAllPagesQuery, useDeletePageMutation } from '@/hooks/usePages'
import {
  ArrowTopRightOnSquareIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/16/solid'
import { useNavigate } from 'react-router-dom'
import ConfirmDialog from '@/components/ConfirmDialog'
import { toast, Toaster } from 'sonner'
import { useState } from 'react'
import Button from '@/components/Button'

const View = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const { data } = useGetAllPagesQuery(currentPage, pageSize)
  const deleteMutation = useDeletePageMutation()
  const navigate = useNavigate()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pageToDelete, setPageToDelete] = useState<{
    id: string
    name: string
  } | null>(null)

  const handlePageView = (slug: string) => {
    window.open(`/status/${slug}`, '_blank')
  }

  const handlePageEdit = (id: string | undefined) => {
    if (id) {
      navigate(`/build/${id}`)
    }
  }

  const handlePageDeleteClick = (id: string | undefined, name: string) => {
    if (id) {
      setPageToDelete({ id, name })
      setDeleteDialogOpen(true)
    }
  }

  const handleDeleteConfirm = () => {
    if (!pageToDelete) return

    deleteMutation.mutate(pageToDelete.id, {
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
    })
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
          <>
            Are you sure you want to delete the status page "
            {pageToDelete?.name}"?
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
      <div className="max-w-full md:max-w-5xl lg:max-w-6xl w-full">
        <div className="pb-1 mb-4 md:mb-6 px-2 md:px-0 flex items-center justify-between">
          <div>
            <h1 className="page-title">Status Pages</h1>
            <p className="page-subtitle">View and manage your pages</p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/tenants/create')}
          >
            Create New Status Page
          </Button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden max-h-[calc(100vh-200px)] flex flex-col">
          <div className="overflow-auto flex-1">
            <table className="w-full table-fixed">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="w-[20%] px-2 lg:px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="w-[20%] px-2 lg:px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Path
                  </th>
                  <th className="hidden md:table-cell w-[15%] px-2 lg:px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Report
                  </th>
                  <th className="hidden sm:table-cell w-[15%] px-2 lg:px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="w-[10%] px-2 lg:px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.content &&
                  data.content?.length > 0 &&
                  data?.content?.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-2 lg:px-4 py-3 md:py-4">
                        <span className="text-xs md:text-sm font-medium text-gray-900 break-words">
                          {item.name}
                        </span>
                      </td>
                      <td className="px-2 lg:px-4 py-3 md:py-4">
                        <span className="text-xs md:text-sm text-gray-700 font-mono break-all">
                          {item.slug}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-2 lg:px-4 py-4 text-sm text-gray-700">
                        <span className="break-words">{item.report}</span>
                      </td>
                      <td className="hidden sm:table-cell px-2 lg:px-4 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
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
                            onClick={() => handlePageEdit(item.id)}
                            className="tooltip p-1 md:p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            data-tip="Edit"
                            aria-label="Edit Page"
                          >
                            <PencilSquareIcon className="size-4 md:size-5" />
                          </button>
                          <button
                            onClick={() =>
                              handlePageDeleteClick(item.id, item.name)
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
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {(!data?.content || data.content.length === 0) && (
          <div className="text-center py-8 md:py-12 bg-white rounded-lg border border-gray-200 mt-2">
            <p className="text-sm md:text-base text-gray-500">
              No status pages found
            </p>
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
    </div>
  )
}

export default View
