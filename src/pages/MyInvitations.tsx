import { useState, useEffect } from 'react'
import {
  useGetUserInvitations,
  useRespondToInvitation,
} from '@/hooks/useInvitations'
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/solid'
import { toast, Toaster } from 'sonner'
import styles from './MyInvitations.module.css'
import paginationStyles from './AdminInvitations.module.css'

const MyInvitations = () => {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setCurrentPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchInput])

  const { data: invitationsData, isLoading } = useGetUserInvitations(true)
  const respondMutation = useRespondToInvitation()

  const handleClearSearch = () => {
    setSearchInput('')
    setDebouncedSearch('')
    setCurrentPage(1)
  }

  const handleRespond = (invitationId: string, action: 'ACCEPT' | 'REJECT') => {
    respondMutation.mutate(
      { invitationId, data: { action } },
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

  const filteredInvitations = invitationsData?.content.filter((invitation) => {
    if (!debouncedSearch.trim()) return true
    const query = debouncedSearch.toLowerCase()
    return (
      invitation.tenant_name.toLowerCase().includes(query) ||
      invitation.email.toLowerCase().includes(query)
    )
  })

  const paginatedInvitations = filteredInvitations?.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  const totalPages = Math.ceil((filteredInvitations?.length || 0) / pageSize)

  return (
    <>
      <Toaster richColors position="top-center" duration={2000} />
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className="page-title">My Invitations</h1>
            <p className="page-subtitle">
              View and respond to your tenant invitations
            </p>
          </div>
        </div>

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
                <XMarkIcon />
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <ArrowPathIcon className="animate-spin size-10 text-blue-400" />
          </div>
        ) : (
          <>
            {paginatedInvitations && paginatedInvitations.length > 0 ? (
              <>
                <div className={styles['table-wrapper']}>
                  <div className={styles['table-scroll']}>
                    <table className={styles.table}>
                      <thead className={styles['table-head']}>
                        <tr>
                          <th className={styles['th-tenant-name']}>
                            Tenant Name
                          </th>
                          <th className={styles['th-email']}>Email</th>
                          <th className={styles['th-role']}>Role</th>
                          <th className={styles['th-status']}>Status</th>
                          <th className={styles['th-created']}>Created At</th>
                          <th className={styles['th-actions']}>Actions</th>
                        </tr>
                      </thead>
                      <tbody className={styles['table-body']}>
                        {paginatedInvitations.map((invitation) => (
                          <tr
                            key={invitation.id}
                            className={styles['table-row']}
                          >
                            <td>
                              <span className={styles['tenant-name-text']}>
                                {invitation.tenant_name}
                              </span>
                            </td>
                            <td>
                              <span className={styles['email-text']}>
                                {invitation.email}
                              </span>
                            </td>
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
                                className={`${styles['status-badge']} ${styles[`status-${invitation.status.toLowerCase()}`]}`}
                              >
                                {invitation.status === 'PENDING'
                                  ? 'Pending'
                                  : invitation.status === 'ACCEPTED'
                                    ? 'Accepted'
                                    : invitation.status === 'REJECTED'
                                      ? 'Rejected'
                                      : invitation.status}
                              </span>
                            </td>
                            <td>
                              <span className={styles['date-text']}>
                                {new Date(
                                  invitation.created_at,
                                ).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </td>
                            <td>
                              {invitation.status === 'PENDING' ? (
                                <div className={styles['actions-container']}>
                                  <button
                                    onClick={() =>
                                      handleRespond(invitation.id, 'ACCEPT')
                                    }
                                    className={`tooltip ${styles['action-button']} ${styles['accept-button']}`}
                                    data-tip="Accept invitation"
                                    disabled={respondMutation.isPending}
                                  >
                                    <CheckCircleIcon
                                      className={styles['action-icon']}
                                    />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleRespond(invitation.id, 'REJECT')
                                    }
                                    className={`tooltip ${styles['action-button']} ${styles['reject-button']}`}
                                    data-tip="Reject invitation"
                                    disabled={respondMutation.isPending}
                                  >
                                    <XCircleIcon
                                      className={styles['action-icon']}
                                    />
                                  </button>
                                </div>
                              ) : (
                                <span className={styles['email-text']}>-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {totalPages > 1 && (
                  <div className={paginationStyles['pagination-container']}>
                    <div className={paginationStyles['pagination-info']}>
                      <span className={paginationStyles['pagination-text']}>
                        Page {currentPage} of {totalPages}
                      </span>
                      <span className={paginationStyles['pagination-count']}>
                        ({filteredInvitations?.length || 0} total invitations)
                      </span>
                    </div>
                    <div className={paginationStyles['pagination-buttons']}>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                        className={paginationStyles['pagination-button']}
                        aria-label="Previous page"
                      >
                        <ChevronLeftIcon
                          className={paginationStyles['pagination-icon']}
                        />
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1),
                          )
                        }
                        disabled={currentPage >= totalPages}
                        className={paginationStyles['pagination-button']}
                        aria-label="Next page"
                      >
                        <ChevronRightIcon
                          className={paginationStyles['pagination-icon']}
                        />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className={styles['empty-state']}>
                <p className={styles['empty-text']}>
                  {searchInput
                    ? 'No invitations found matching your search'
                    : 'No invitations found'}
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
