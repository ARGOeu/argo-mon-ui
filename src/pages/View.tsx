import { useGetAllPagesQuery, useDeletePageMutation } from '@/hooks/usePages'
import {
  ArrowTopRightOnSquareIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/16/solid'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { LoginPrompt } from '@/components/LoginPrompt'
import { useState } from 'react'

export const View = () => {
  const { authenticated, login } = useAuth()
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const { data } = useGetAllPagesQuery(currentPage, pageSize)
  const deleteMutation = useDeletePageMutation()
  const navigate = useNavigate()

  if (!authenticated) {
    return (
      <LoginPrompt
        title="View Your Status Pages"
        description="Login to view and manage all your status pages"
        onLogin={login}
      />
    )
  }

  const handlePageView = (slug: string) => {
    window.open(`/status/${slug}`, '_blank')
  }

  const handlePageEdit = (id: string | undefined) => {
    if (id) {
      navigate(`/build/${id}`)
    }
  }

  const handlePageDelete = (id: string | undefined) => {
    if (id) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="max-w-7xl w-full">
        <div className="pb-1 mb-4 md:mb-6 px-2 md:px-0">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
            Status Pages
          </h1>
          <p className="text-md text-gray-500">View and manage your pages</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden max-h-[calc(100vh-200px)] flex flex-col">
          <div className="overflow-auto flex-1">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-2 lg:px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-2 lg:px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Path
                  </th>
                  <th className="hidden md:table-cell px-2 lg:px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Report
                  </th>
                  <th className="hidden lg:table-cell px-2 lg:px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Endpoint
                  </th>
                  <th className="hidden sm:table-cell px-2 lg:px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-2 lg:px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
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
                      <td className="px-2 lg:px-4 py-3 md:py-4 whitespace-nowrap">
                        <span className="text-xs md:text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </span>
                      </td>
                      <td className="px-2 lg:px-4 py-3 md:py-4 whitespace-nowrap">
                        <span className="text-xs md:text-sm text-gray-700 font-mono">
                          {item.slug}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-2 lg:px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {item.report}
                      </td>
                      <td className="hidden lg:table-cell px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {item.api || '-'}
                      </td>
                      <td className="hidden sm:table-cell px-2 lg:px-4 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
                        {item.updated_at
                          ? new Date(item.updated_at).toLocaleTimeString(
                              'en-GB',
                              {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                timeZone: 'UTC',
                              },
                            )
                          : null}{' '}
                        (UTC)
                      </td>
                      <td className="px-1 lg:px-3 py-3 md:py-4 whitespace-nowrap text-center">
                        <div className="flex items-center gap-1 md:gap-3">
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
                            onClick={() => handlePageDelete(item.id)}
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

        {data && data.total_pages > 0 && (
          <div className="flex items-center justify-between px-4 py-1 border border-gray-200 rounded-lg mt-2">
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
