import { useState } from 'react'
import {
  useGetUserInvitations,
  useRespondToInvitation,
} from '@/hooks/useInvitations'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import PageHeader from '@/components/PageHeader'
import DataTable, { thBase, tdBase } from '@/components/DataTable'
import Pagination from '@/components/Pagination'
import Badge from '@/components/Badge'
import { roleBadgeClass, invitationStatusBadgeClass } from '@/utils/badges'

const pageSize = 10

const MyInvitations = () => {
  const [currentPage, setCurrentPage] = useState(1)

  const {
    data: invitationsData,
    isLoading,
    error: invitationsError,
  } = useGetUserInvitations(true, {
    page: currentPage,
    size: pageSize,
  })
  const respondMutation = useRespondToInvitation()

  const handleRespond = (invitationId: string, action: 'ACCEPT' | 'REJECT') => {
    respondMutation.mutate(
      { invitationId, data: { action } },
      {
        onSuccess: async () => {
          toast.success(
            `Invitation ${action === 'ACCEPT' ? 'accepted' : 'rejected'} successfully!`,
          )
        },
        onError: (error) => {
          toast.error(`Failed to respond to invitation: ${error.message}`)
        },
      },
    )
  }

  return (
    <>
      <div className="page-container">
        <PageHeader
          title="My Invitations"
          subtitle="View and respond to your tenant invitations"
          className="mb-8"
        />

        {isLoading ? (
          <div className="loading-container">
            <LoadingSpinner />
          </div>
        ) : invitationsError ? (
          <ErrorDisplay error={invitationsError} context="invitations" />
        ) : (
          <>
            {invitationsData?.content && invitationsData.content.length > 0 ? (
              <>
                <DataTable
                  className=""
                  tableClassName="table-fixed min-w-[700px]"
                >
                  <thead className="bg-gray-100 border-b border-line">
                    <tr>
                      <th className={`${thBase} w-[20%]`}>Tenant Name</th>
                      <th className={`${thBase} w-[20%]`}>Email</th>
                      <th className={`${thBase} w-[15%]`}>Role</th>
                      <th className={`${thBase} w-[15%]`}>Status</th>
                      <th className={`${thBase} w-[15%]`}>Created At</th>
                      <th className={`${thBase} w-[15%]`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invitationsData.content.map((invitation) => (
                      <tr
                        key={invitation.id}
                        className="transition-colors hover:bg-surface-muted"
                      >
                        <td className={tdBase}>
                          <span className="break-words">
                            {invitation.tenant_name}
                          </span>
                        </td>
                        <td className={tdBase}>
                          <span className="text-muted break-all text-sm">
                            {invitation.email}
                          </span>
                        </td>
                        <td className={tdBase}>
                          <Badge
                            size="xs"
                            className={
                              roleBadgeClass[invitation.role] ??
                              'bg-gray-100 text-muted'
                            }
                          >
                            {invitation.role === 'admin'
                              ? 'Tenant Admin'
                              : 'Member'}
                          </Badge>
                        </td>
                        <td className={tdBase}>
                          <Badge
                            size="xs"
                            className={`capitalize ${invitationStatusBadgeClass[invitation.status] ?? 'bg-gray-100 text-muted'}`}
                          >
                            {invitation.status === 'PENDING'
                              ? 'Pending'
                              : invitation.status === 'ACCEPTED'
                                ? 'Accepted'
                                : invitation.status === 'REJECTED'
                                  ? 'Rejected'
                                  : invitation.status}
                          </Badge>
                        </td>
                        <td className={tdBase}>
                          <span className="text-muted text-sm">
                            {new Date(invitation.created_at).toLocaleDateString(
                              'en-US',
                              {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              },
                            )}
                          </span>
                        </td>
                        <td className={tdBase}>
                          {invitation.status === 'PENDING' ? (
                            <div className="flex items-center gap-5 flex-col md:flex-row md:gap-5">
                              <button
                                onClick={() =>
                                  handleRespond(invitation.id, 'ACCEPT')
                                }
                                className="tooltip p-1 rounded-lg border flex items-center justify-center cursor-pointer transition-all w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-50 border-emerald-500 text-emerald-600 hover:enabled:bg-emerald-100 hover:enabled:border-emerald-600 hover:enabled:text-emerald-700"
                                data-tip="Accept invitation"
                                disabled={respondMutation.isPending}
                              >
                                <CheckCircleIcon className="size-6 shrink-0" />
                              </button>
                              <button
                                onClick={() =>
                                  handleRespond(invitation.id, 'REJECT')
                                }
                                className="tooltip p-1 rounded-lg border flex items-center justify-center cursor-pointer transition-all w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed bg-red-50 border-red-500 text-red-600 hover:enabled:bg-red-100 hover:enabled:border-red-600 hover:enabled:text-red-700"
                                data-tip="Reject invitation"
                                disabled={respondMutation.isPending}
                              >
                                <XCircleIcon className="size-6 shrink-0" />
                              </button>
                            </div>
                          ) : (
                            <span className="w-1/2 block text-muted text-sm text-center">
                              -
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </DataTable>

                {invitationsData.content.length > 0 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={invitationsData.total_pages}
                    totalElements={invitationsData.total_elements}
                    itemLabel="invitations"
                    onPrev={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    onNext={() =>
                      setCurrentPage((prev) =>
                        Math.min(invitationsData.total_pages, prev + 1),
                      )
                    }
                  />
                )}
              </>
            ) : (
              <div className="bg-surface-muted border border-line rounded-lg py-8 px-12 text-center">
                <p className="text-muted text-base m-0">No invitations found</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default MyInvitations
