import { useState } from 'react'
import {
  useGetUserInvitations,
  useRespondToInvitation,
} from '@/hooks/useInvitations'
import { useRoleFriendlyName } from '@/hooks/useRoleFriendlyName'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/16/solid'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import PageHeader from '@/components/PageHeader'
import DataTable, { thBase, tdBase } from '@/components/DataTable'
import Pagination from '@/components/Pagination'
import Badge from '@/components/Badge'
import IconButton from '@/components/IconButton'
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
  const getRoleFriendlyName = useRoleFriendlyName()

  const handleRespond = (
    invitation: {
      id: string
      tenant_id: string
      role: string
    },
    action: 'ACCEPT' | 'REJECT',
  ) => {
    respondMutation.mutate(
      {
        invitationId: invitation.id,
        tenantId: invitation.tenant_id,
        role: invitation.role,
        action,
      },
      {
        onSuccess: () => {
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
          className="mb-6"
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
                  <thead className="bg-surface-strong border-b border-line">
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
                              'bg-surface-strong text-muted'
                            }
                          >
                            {getRoleFriendlyName(invitation.role)}
                          </Badge>
                        </td>
                        <td className={tdBase}>
                          <Badge
                            size="xs"
                            className={`capitalize ${invitationStatusBadgeClass[invitation.status] ?? 'bg-surface-strong text-muted'}`}
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
                            <div className="flex items-center gap-2 flex-col md:flex-row">
                              <IconButton
                                label="Accept invitation"
                                icon={
                                  <CheckCircleIcon className="size-6 shrink-0" />
                                }
                                onClick={() =>
                                  handleRespond(invitation, 'ACCEPT')
                                }
                                disabled={respondMutation.isPending}
                                className="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 w-auto"
                              />
                              <IconButton
                                label="Reject invitation"
                                icon={
                                  <XCircleIcon className="size-6 shrink-0" />
                                }
                                onClick={() =>
                                  handleRespond(invitation, 'REJECT')
                                }
                                disabled={respondMutation.isPending}
                                className="text-red-600 bg-red-50 hover:bg-red-100 w-auto"
                              />
                            </div>
                          ) : (
                            <span className="w-1/3 block text-muted text-sm text-center">
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
              <div className="text-center bg-surface-muted rounded-lg">
                <p className="text-sm text-subtle italic py-6 px-12">
                  No invitations found
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default MyInvitations
