import { useState, useMemo } from 'react'
import { useAuth } from '@/auth/useAuth'
import { useGetMembers } from '@/hooks/useTenants'
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  IdentificationIcon,
  UserPlusIcon,
} from '@heroicons/react/16/solid'
import { XMarkIcon } from '@heroicons/react/24/outline'
import styles from './Administration.module.css'

const Administration = () => {
  const [activeTab, setActiveTab] = useState<'users'>('users')
  const [searchInput, setSearchInput] = useState('')

  const { profile } = useAuth()
  const isSuperAdmin = profile?.roles?.includes('super_admin')

  const { data: usersData, isLoading } = useGetMembers(isSuperAdmin)

  const filteredUsers = useMemo(() => {
    if (!usersData) return []
    if (!searchInput.trim()) return usersData

    const query = searchInput.toLowerCase()
    return usersData.filter(
      (user) =>
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query),
    )
  }, [usersData, searchInput])

  const handleClearSearch = () => {
    setSearchInput('')
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
          <p className="page-subtitle">View and manage users</p>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'users' ? styles['tab-active'] : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
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
                          <th className={styles['th-username']}>Username</th>
                          <th className={styles['th-name']}>First Name</th>
                          <th className={styles['th-name']}>Last Name</th>
                          <th className={styles['th-email']}>Email</th>
                          <th className={styles['th-tenants']}>Tenants</th>
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
                                      className={styles['tenant-badge']}
                                    >
                                      {tenant}
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
    </div>
  )
}

export default Administration
