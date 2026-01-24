import { useState, useMemo } from 'react'
import { useAuth } from '@/auth/useAuth'
import { useGetMembers } from '@/hooks/useTenants'
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  IdentificationIcon,
  UserPlusIcon,
} from '@heroicons/react/16/solid'
import {
  XMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'
import styles from './Administration.module.css'
import AdminInvitations from './AdminInvitations'

type SortColumn = 'username' | 'firstName' | 'lastName' | 'email' | 'tenants'
type SortDirection = 'asc' | 'desc'

const Administration = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'invitations'>('users')
  const [searchInput, setSearchInput] = useState('')
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const { profile } = useAuth()
  const isSuperAdmin = profile?.roles?.includes('super_admin')

  const { data: usersData, isLoading } = useGetMembers(isSuperAdmin)
  const membersData = usersData

  const filteredUsers = useMemo(() => {
    if (!membersData) return []

    let filtered = membersData

    if (searchInput.trim()) {
      const query = searchInput.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.firstName.toLowerCase().includes(query) ||
          user.lastName.toLowerCase().includes(query),
      )
    }

    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: string | number
        let bValue: string | number

        if (sortColumn === 'tenants') {
          aValue = a.tenants?.length || 0
          bValue = b.tenants?.length || 0
        } else {
          aValue = a[sortColumn]?.toLowerCase() || ''
          bValue = b[sortColumn]?.toLowerCase() || ''
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [membersData, searchInput, sortColumn, sortDirection])

  const handleClearSearch = () => {
    setSearchInput('')
  }

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return (
        <span className={styles['sort-icon-container']}>
          <ChevronUpIcon className={styles['sort-icon-inactive']} />
          <ChevronDownIcon className={styles['sort-icon-inactive']} />
        </span>
      )
    }
    return sortDirection === 'asc' ? (
      <ChevronUpIcon className={styles['sort-icon-active']} />
    ) : (
      <ChevronDownIcon className={styles['sort-icon-active']} />
    )
  }

  if (!isSuperAdmin) {
    return (
      <div className={styles.container}>
        <div className={styles['access-denied']}>
          <p>Access denied. This page is only available for admins.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className="page-title">Administration Panel</h1>
          <p className="page-subtitle">Central management and configuration</p>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'users' ? styles['tab-active'] : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'invitations' ? styles['tab-active'] : ''}`}
          onClick={() => setActiveTab('invitations')}
        >
          Invitations
        </button>
      </div>

      {activeTab === 'users' && (
        <>
          <div className={styles['search-container']}>
            <div className={styles['search-input-wrapper']}>
              <MagnifyingGlassIcon className={styles['search-icon']} />
              <input
                type="text"
                placeholder="Search users by username or email..."
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
              {filteredUsers.length > 0 ? (
                <div className={styles['table-wrapper']}>
                  <div className={styles['table-scroll']}>
                    <table className={styles.table}>
                      <thead className={styles['table-head']}>
                        <tr>
                          <th className={styles['th-username']}>
                            <button
                              className={styles['sort-button']}
                              onClick={() => handleSort('username')}
                            >
                              <span>Username</span>
                              {renderSortIcon('username')}
                            </button>
                          </th>
                          <th className={styles['th-name']}>
                            <button
                              className={styles['sort-button']}
                              onClick={() => handleSort('firstName')}
                            >
                              <span>First Name</span>
                              {renderSortIcon('firstName')}
                            </button>
                          </th>
                          <th className={styles['th-name']}>
                            <button
                              className={styles['sort-button']}
                              onClick={() => handleSort('lastName')}
                            >
                              <span>Last Name</span>
                              {renderSortIcon('lastName')}
                            </button>
                          </th>
                          <th className={styles['th-email']}>
                            <button
                              className={styles['sort-button']}
                              onClick={() => handleSort('email')}
                            >
                              <span>Email</span>
                              {renderSortIcon('email')}
                            </button>
                          </th>
                          <th className={styles['th-tenants']}>
                            <button
                              className={styles['sort-button']}
                              onClick={() => handleSort('tenants')}
                            >
                              <span>Tenants</span>
                              {renderSortIcon('tenants')}
                            </button>
                          </th>
                          <th className={styles['th-actions']}>Actions</th>
                        </tr>
                      </thead>
                      <tbody className={styles['table-body']}>
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className={styles['table-row']}>
                            <td className={styles['td-username']}>
                              <span className={styles['username-text']}>
                                {user.username}
                              </span>
                            </td>
                            <td className={styles['td-name']}>
                              <span className={styles['name-text']}>
                                {user.firstName}
                              </span>
                            </td>
                            <td className={styles['td-name']}>
                              <span className={styles['name-text']}>
                                {user.lastName}
                              </span>
                            </td>
                            <td className={styles['td-email']}>
                              <span className={styles['email-text']}>
                                {user.email}
                              </span>
                            </td>
                            <td className={styles['td-tenants']}>
                              <div className={styles['tenants-container']}>
                                {user.tenants && user.tenants.length > 0 ? (
                                  user.tenants.map((tenant, index) => (
                                    <span
                                      key={index}
                                      className={`tooltip ${styles['tenant-badge']} ${
                                        tenant.role === 'admin'
                                          ? styles['tenant-badge-admin']
                                          : styles['tenant-badge-viewer']
                                      }`}
                                      data-tip={
                                        tenant.role === 'admin'
                                          ? 'Tenant Admin'
                                          : 'Tenant Member'
                                      }
                                    >
                                      {tenant.name}
                                    </span>
                                  ))
                                ) : (
                                  <span className={styles['no-tenants']}>
                                    No tenants
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className={styles['td-actions']}>
                              <div className={styles['actions-container']}>
                                <button
                                  className={`tooltip ${styles['action-button']} ${styles['action-button-primary']}`}
                                  data-tip="Add to Tenant Group"
                                  aria-label="Add to Tenant Group"
                                >
                                  <UserPlusIcon
                                    className={styles['action-icon']}
                                  />
                                </button>
                                <button
                                  className={`tooltip ${styles['action-button']}`}
                                  data-tip="View Profile"
                                  aria-label="View Profile"
                                >
                                  <IdentificationIcon
                                    className={styles['action-icon']}
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className={styles['empty-state']}>
                  <p className={styles['empty-text']}>
                    {searchInput
                      ? 'No users found matching your search'
                      : 'No users available'}
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}

      {activeTab === 'invitations' && (
        <AdminInvitations isSuperAdmin={isSuperAdmin} />
      )}
    </div>
  )
}

export default Administration
