import { useState } from 'react'
import { useGetTenantInvitations } from '@/hooks/useInvitations'
import { useRevokeInvitation } from '@/hooks/useTenants'
import { XCircleIcon } from '@heroicons/react/24/solid'
import { toast } from 'sonner'
import ErrorDisplay from '@/components/ErrorDisplay'
import ConfirmDialog from '@/components/ConfirmDialog'
import DataTable, { thBase, tdBase } from '@/components/DataTable'
import Pagination from '@/components/Pagination'
import Badge from '@/components/Badge'
import { roleBadgeClass, invitationStatusBadgeClass } from '@/utils/badges'

interface TenantInvitationsProps {
  tenantId: string
  tenantName: string
}

const pageSize = 10

const TenantInvitations = ({
  tenantId,
  tenantName,
}: TenantInvitationsProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const [invitationToRevoke, setInvitationToRevoke] = useState<{
    invitationId: string
    email: string
  } | null>(null)

  const { data: invitationsData, error: invitationsError } =
    useGetTenantInvitations(tenantId, currentPage, pageSize, !!tenantId)

  const revokeInvitationMutation = useRevokeInvitation()

  const handleRevokeClick = (invitationId: string, invitationEmail: string) => {
    setInvitationToRevoke({ invitationId, email: invitationEmail })
    setRevokeDialogOpen(true)
  }

  const handleRevokeConfirm = () => {
    if (!tenantId || !invitationToRevoke) return

    revokeInvitationMutation.mutate(
      { tenantId, invitationId: invitationToRevoke.invitationId },
      {
        onSuccess: () => {
          toast.success('Invitation revoked successfully!')
          setRevokeDialogOpen(false)
          setInvitationToRevoke(null)
        },
        onError: (error) => {
          toast.error(`Failed to revoke invitation: ${error.message}`)
        },
      },
    )
  }

  const handleRevokeCancel = () => {
    setRevokeDialogOpen(false)
    setInvitationToRevoke(null)
  }

  return (
    <>
      <h2 className="text-lg font-semibold text-gray-800 mb-2.5">
        Tenant Invitations
      </h2>
      {invitationsError ? (
        <ErrorDisplay error={invitationsError} context="invitations" />
      ) : (
        <>
          <DataTable>
            <thead className="bg-surface-muted border-b border-line">
              <tr>
                <th className={thBase}>Email</th>
                <th className={thBase}>Role</th>
                <th className={thBase}>Status</th>
                <th className={thBase}>Created At</th>
                <th className={thBase}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invitationsData && invitationsData.content.length > 0 ? (
                invitationsData.content.map((invitation) => (
                  <tr key={invitation.id} className="hover:bg-surface-muted">
                    <td className={tdBase}>{invitation.email}</td>
                    <td className={tdBase}>
                      <Badge
                        className={
                          roleBadgeClass[invitation.role] ??
                          'bg-surface-strong text-muted'
                        }
                      >
                        {invitation.role === 'admin'
                          ? 'Tenant Admin'
                          : 'Member'}
                      </Badge>
                    </td>
                    <td className={tdBase}>
                      <Badge
                        className={
                          invitationStatusBadgeClass[invitation.status] ??
                          'bg-surface-strong text-muted'
                        }
                      >
                        {invitation.status === 'PENDING'
                          ? 'Pending'
                          : invitation.status === 'ACCEPTED'
                            ? 'Accepted'
                            : invitation.status === 'REJECTED'
                              ? 'Rejected'
                              : invitation.status === 'REVOKED'
                                ? 'Revoked'
                                : invitation.status}
                      </Badge>
                    </td>
                    <td className={tdBase}>
                      {new Date(invitation.created_at).toLocaleDateString(
                        'en-US',
                        {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        },
                      )}
                    </td>
                    <td className={tdBase}>
                      {invitation.status === 'PENDING' ? (
                        <button
                          onClick={() =>
                            handleRevokeClick(invitation.id, invitation.email)
                          }
                          className="ml-2 inline-flex items-center justify-center p-1.5 rounded-md text-red-500 bg-transparent border-none cursor-pointer transition-all hover:bg-red-50 active:scale-95 tooltip"
                          data-tip="Revoke invitation"
                          disabled={revokeInvitationMutation.isPending}
                        >
                          <XCircleIcon className="size-6" />
                        </button>
                      ) : (
                        <span className="text-subtle text-sm inline-block ml-6">
                          -
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center text-subtle italic py-8"
                  >
                    No invitations
                  </td>
                </tr>
              )}
            </tbody>
          </DataTable>

          {invitationsData?.content && invitationsData.content.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={invitationsData.total_pages}
              totalElements={invitationsData.total_elements}
              itemLabel="invitations"
              onPrev={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              onNext={() =>
                setCurrentPage((prev) =>
                  Math.min(invitationsData.total_pages, prev + 1),
                )
              }
            />
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={revokeDialogOpen}
        title="Revoke Invitation"
        message={
          invitationToRevoke ? (
            <>
              Are you sure you want to revoke the invitation for{' '}
              <strong>{invitationToRevoke.email}</strong> to join tenant{' '}
              <strong>{tenantName}</strong>?
              <br />
              <span className="text-amber-600 font-medium">
                This action cannot be undone.
              </span>
            </>
          ) : (
            ''
          )
        }
        confirmLabel="Revoke"
        cancelLabel="Cancel"
        onConfirm={handleRevokeConfirm}
        onCancel={handleRevokeCancel}
      />
    </>
  )
}

export default TenantInvitations
