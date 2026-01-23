import { useState, useEffect } from 'react'
import { useGetAdminInvitations } from '@/hooks/useInvitations'
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/16/solid'
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
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

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setCurrentPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchInput])

  const { data: invitationsData, isLoading: invitationsLoading } =
    useGetAdminInvitations(isSuperAdmin, {
      search: debouncedSearch || undefined,
      sort: sortColumn || undefined,
      order: sortColumn ? sortOrder : undefined,
      page: currentPage,
      size: pageSize,
    })

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
          <ArrowPathIcon className="animate-spin size-10 text-blue-400" />
        </div>
      )
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {invitationsData.content && invitationsData.content.length > 0 && (
          <div className={styles['pagination-container']}>
            <div className={styles['pagination-info']}>
              <span className={styles['pagination-text']}>
                Page {currentPage} of {invitationsData.total_pages}
              </span>
              <span className={styles['pagination-count']}>
                ({invitationsData.total_elements} total items)
              </span>
            </div>
            <div className={styles['pagination-buttons']}>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={styles['pagination-button']}
                aria-label="Previous page"
              >
                <ChevronLeftIcon className={styles['pagination-icon']} />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(invitationsData.total_pages, prev + 1),
                  )
                }
                disabled={currentPage >= invitationsData.total_pages}
                className={styles['pagination-button']}
                aria-label="Next page"
              >
                <ChevronRightIcon className={styles['pagination-icon']} />
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
              <XMarkIcon className="size-4" />
            </button>
          )}
        </div>
      </div>
      {renderContent()}
    </>
  )
}

export default AdminInvitations
