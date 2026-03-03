import { useState } from 'react'
import { useGetTenantInvitations } from '@/hooks/useInvitations'
import { useRevokeInvitation } from '@/hooks/useTenants'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid'
import { toast } from 'sonner'
import ErrorDisplay from '@/components/ErrorDisplay'
import ConfirmDialog from '@/components/ConfirmDialog'
import styles from './TenantInvitations.module.css'

interface TenantInvitationsProps {
  tenantId: string
  tenantName: string
}

const TenantInvitations = ({
  tenantId,
  tenantName,
}: TenantInvitationsProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
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
      <h2 className={styles['section-title']}>Tenant Invitations</h2>
      {invitationsError ? (
        <ErrorDisplay error={invitationsError} context="invitations" />
      ) : (
        <>
          <div className={styles['table-wrapper']}>
            <table className={styles.table}>
              <thead className={styles['table-head']}>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className={styles['table-body']}>
                {invitationsData && invitationsData.content.length > 0 ? (
                  invitationsData.content.map((invitation) => (
                    <tr key={invitation.id}>
                      <td>{invitation.email}</td>
                      <td>
                        <span
                          className={`${styles['role-badge']} ${styles[`role-${invitation.role}`]}`}
                        >
                          {invitation.role === 'admin'
                            ? 'Tenant Admin'
                            : 'Member'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${styles['status-badge']} ${
                            invitation.status === 'PENDING'
                              ? styles['status-pending']
                              : invitation.status === 'ACCEPTED'
                                ? styles['status-accepted']
                                : styles['status-rejected']
                          }`}
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
                        </span>
                      </td>
                      <td>
                        {new Date(invitation.created_at).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          },
                        )}
                      </td>
                      <td>
                        {invitation.status === 'PENDING' ? (
                          <button
                            onClick={() =>
                              handleRevokeClick(invitation.id, invitation.email)
                            }
                            className={`${styles['remove-button']} tooltip`}
                            data-tip="Revoke invitation"
                            disabled={revokeInvitationMutation.isPending}
                          >
                            <XCircleIcon
                              style={{
                                width: '1.6rem',
                                height: '1.6rem',
                              }}
                            />
                          </button>
                        ) : (
                          <span
                            style={{
                              color: '#9ca3af',
                              fontSize: '0.875rem',
                              display: 'inline-block',
                              marginLeft: '1.4rem',
                            }}
                          >
                            -
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className={styles['empty-state']}>
                      No invitations
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {invitationsData?.content && invitationsData.content.length > 0 && (
            <div className="pagination-container">
              <div className="pagination-info">
                <span className="pagination-text">
                  Page {currentPage} of {invitationsData.total_pages}
                </span>
                <span className="pagination-count">
                  ({invitationsData.total_elements} total invitations)
                </span>
              </div>
              <div className="pagination-buttons">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="pagination-button"
                  aria-label="Previous page"
                >
                  <ChevronLeftIcon className="pagination-icon" />
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(invitationsData.total_pages, prev + 1),
                    )
                  }
                  disabled={currentPage >= invitationsData.total_pages}
                  className="pagination-button"
                  aria-label="Next page"
                >
                  <ChevronRightIcon className="pagination-icon" />
                </button>
              </div>
            </div>
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
