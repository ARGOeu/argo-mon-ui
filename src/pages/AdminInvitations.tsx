import { useState, useEffect } from 'react'
import { useGetAdminInvitations } from '@/hooks/useInvitations'
import { useRevokeInvitation } from '@/hooks/useTenants'
import { MagnifyingGlassIcon } from '@heroicons/react/16/solid'
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import { XCircleIcon } from '@heroicons/react/24/solid'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import ConfirmDialog from '@/components/ConfirmDialog'
import styles from './AdminInvitations.module.css'
import adminStyles from './Administration.module.css'

interface AdminInvitationsProps {
  isSuperAdmin: boolean
}

type SortColumn = 'tenant_name' | 'email' | 'role' | 'status' | 'created_at'
type SortOrder = 'ASC' | 'DESC'

const AdminInvitations = ({ isSuperAdmin }: AdminInvitationsProps) => {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const [invitationToRevoke, setInvitationToRevoke] = useState<{
    tenantId: string
    invitationId: string
    tenantName: string
    email: string
  } | null>(null)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setCurrentPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchInput])

  const {
    data: invitationsData,
    isLoading: invitationsLoading,
    error: invitationsError,
  } = useGetAdminInvitations(isSuperAdmin, {
    search: debouncedSearch || undefined,
    sort: sortColumn || undefined,
    order: sortColumn ? sortOrder : undefined,
    page: currentPage,
    size: pageSize,
  })

  const revokeInvitationMutation = useRevokeInvitation()

  const handleRevokeClick = (
    tenantId: string,
    invitationId: string,
    tenantName: string,
    email: string,
  ) => {
    setInvitationToRevoke({ tenantId, invitationId, tenantName, email })
    setRevokeDialogOpen(true)
  }

  const handleRevokeConfirm = () => {
    if (!invitationToRevoke) return

    revokeInvitationMutation.mutate(
      {
        tenantId: invitationToRevoke.tenantId,
        invitationId: invitationToRevoke.invitationId,
      },
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

  const handleClearSearch = () => {
    setSearchInput('')
    setDebouncedSearch('')
    setCurrentPage(1)
  }

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')
    } else {
      setSortColumn(column)
      setSortOrder('ASC')
    }
    setCurrentPage(1)
  }

  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return (
        <span className={adminStyles['sort-icon-container']}>
          <ChevronUpIcon className={adminStyles['sort-icon-inactive']} />
          <ChevronDownIcon className={adminStyles['sort-icon-inactive']} />
        </span>
      )
    }
    return sortOrder === 'ASC' ? (
      <ChevronUpIcon className={adminStyles['sort-icon-active']} />
    ) : (
      <ChevronDownIcon className={adminStyles['sort-icon-active']} />
    )
  }

  const renderContent = () => {
    if (invitationsLoading) {
      return (
        <div className="loading-container">
          <LoadingSpinner />
        </div>
      )
    }

    if (invitationsError) {
      return <ErrorDisplay error={invitationsError} context="invitations" />
    }

    if (!invitationsData?.content || invitationsData.content.length === 0) {
      return (
        <div className={styles['empty-state']}>
          <p className={styles['empty-text']}>
            {searchInput
              ? 'No invitations found matching your search'
              : 'No invitations found'}
          </p>
        </div>
      )
    }

    return (
      <>
        <div className={styles['table-wrapper']}>
          <div className={styles['table-scroll']}>
            <table className={styles.table}>
              <thead className={styles['table-head']}>
                <tr>
                  <th className={styles['th-tenant-name']}>
                    <button
                      onClick={() => handleSort('tenant_name')}
                      className={adminStyles['sort-button']}
                    >
                      Tenant Name
                      {renderSortIcon('tenant_name')}
                    </button>
                  </th>
                  <th className={styles['th-email']}>
                    <button
                      onClick={() => handleSort('email')}
                      className={adminStyles['sort-button']}
                    >
                      Email
                      {renderSortIcon('email')}
                    </button>
                  </th>
                  <th className={styles['th-role']}>
                    <button
                      onClick={() => handleSort('role')}
                      className={adminStyles['sort-button']}
                    >
                      Role
                      {renderSortIcon('role')}
                    </button>
                  </th>
                  <th className={styles['th-status']}>
                    <button
                      onClick={() => handleSort('status')}
                      className={adminStyles['sort-button']}
                    >
                      Status
                      {renderSortIcon('status')}
                    </button>
                  </th>
                  <th className={styles['th-created']}>
                    <button
                      onClick={() => handleSort('created_at')}
                      className={adminStyles['sort-button']}
                    >
                      Created At
                      {renderSortIcon('created_at')}
                    </button>
                  </th>
                  <th className={styles['th-actions']}>Actions</th>
                </tr>
              </thead>
              <tbody className={styles['table-body']}>
                {invitationsData.content.map((invitation) => (
                  <tr key={invitation.id} className={styles['table-row']}>
                    <td className={styles['td-tenant-name']}>
                      <span className={styles['tenant-name-text']}>
                        {invitation.tenant_name}
                      </span>
                    </td>
                    <td className={styles['td-email']}>
                      <span className={styles['email-text']}>
                        {invitation.email}
                      </span>
                    </td>
                    <td className={styles['td-role']}>
                      <span
                        className={`${styles['role-badge']} ${
                          invitation.role === 'admin'
                            ? styles['role-admin']
                            : styles['role-viewer']
                        }`}
                      >
                        {invitation.role === 'admin' ? 'Admin' : 'Viewer'}
                      </span>
                    </td>
                    <td className={styles['td-status']}>
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
                    <td className={styles['td-created']}>
                      <span className={styles['date-text']}>
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
                    <td>
                      <div className={styles['actions-container']}>
                        {invitation.status === 'PENDING' ? (
                          <button
                            onClick={() =>
                              handleRevokeClick(
                                invitation.tenant_id,
                                invitation.id,
                                invitation.tenant_name,
                                invitation.email,
                              )
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
                          <span className={styles['empty-actions']}>-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {invitationsData.content && invitationsData.content.length > 0 && (
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
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
    )
  }

  return (
    <>
      <div className={styles['search-container']}>
        <div className={styles['search-input-wrapper']}>
          <MagnifyingGlassIcon className={styles['search-icon']} />
          <input
            type="text"
            placeholder="Search invitations by tenant name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={styles['search-input']}
          />
          {searchInput && (
            <button
              onClick={handleClearSearch}
              className={styles['clear-button']}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>
      {renderContent()}

      <ConfirmDialog
        isOpen={revokeDialogOpen}
        title="Revoke Invitation"
        message={
          invitationToRevoke ? (
            <>
              Are you sure you want to revoke the invitation for{' '}
              <strong>{invitationToRevoke.email}</strong> to join tenant{' '}
              <strong>{invitationToRevoke.tenantName}</strong>?
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

export default AdminInvitations
