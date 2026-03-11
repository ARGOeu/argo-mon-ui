import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '@/auth/useAuth'
import { useGetMembers } from '@/hooks/useTenants'
import { UserCircleIcon } from '@heroicons/react/16/solid'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import AdminInvitations from './AdminInvitations'
import PageHeader from '@/components/PageHeader'
import SearchInput from '@/components/SearchInput'
import Tabs from '@/components/Tabs'
import DataTable, { thBase, SortableColumnHeader } from '@/components/DataTable'
import Pagination from '@/components/Pagination'
import IconButton from '@/components/IconButton'
import { squishEmail } from '@/utils/profile'

type SortColumn = 'username' | 'firstName' | 'lastName' | 'email' | 'tenants'
type SortDirection = 'asc' | 'desc'

const pageSize = 10

const tenantBadgeBase =
  'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap'

const Administration = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'invitations'>('users')
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [currentPage, setCurrentPage] = useState(1)

  const { profile } = useAuth()
  const isSuperAdmin = profile?.roles?.includes('super_admin')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setCurrentPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchInput])

  const {
    data: usersData,
    isLoading,
    error: usersError,
  } = useGetMembers(currentPage, pageSize, debouncedSearch, isSuperAdmin)

  const filteredUsers = useMemo(() => {
    const membersData = usersData?.content || []
    if (!membersData || membersData.length === 0) return []

    let filtered = membersData

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
  }, [usersData?.content, sortColumn, sortDirection])

  const handleClearSearch = () => {
    setSearchInput('')
    setDebouncedSearch('')
    setCurrentPage(1)
  }

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  if (!isSuperAdmin) {
    return (
      <div className="page-container">
        <div className="bg-red-100 border border-red-200 rounded-lg p-8 text-center mt-8">
          <p className="text-red-800 font-medium text-base m-0">
            Access denied. This page is only available for admins.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Administration Panel"
        subtitle="Central management and configuration"
        className="mb-2"
      />

      <Tabs
        tabs={[
          { id: 'users', label: 'Users' },
          { id: 'invitations', label: 'Invitations' },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as 'users' | 'invitations')}
        className="mb-4"
      />

      {activeTab === 'users' && (
        <>
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            onClear={handleClearSearch}
            placeholder="Search users by username or email..."
            maxWidth="max-w-[24rem]"
          />

          {isLoading ? (
            <div className="loading-container">
              <LoadingSpinner />
            </div>
          ) : usersError ? (
            <ErrorDisplay error={usersError} context="users" />
          ) : (
            <>
              {filteredUsers.length > 0 ? (
                <DataTable tableClassName="table-fixed min-w-[700px]">
                  <thead className="bg-surface-strong border-b border-line">
                    <tr>
                      <th className={`${thBase} w-[15%]`}>
                        <SortableColumnHeader
                          isActive={sortColumn === 'username'}
                          isAscending={sortDirection === 'asc'}
                          onClick={() => handleSort('username')}
                        >
                          Username
                        </SortableColumnHeader>
                      </th>
                      <th className={`${thBase} w-[18%]`}>
                        <SortableColumnHeader
                          isActive={sortColumn === 'firstName'}
                          isAscending={sortDirection === 'asc'}
                          onClick={() => handleSort('firstName')}
                        >
                          First Name
                        </SortableColumnHeader>
                      </th>
                      <th className={`${thBase} w-[18%]`}>
                        <SortableColumnHeader
                          isActive={sortColumn === 'lastName'}
                          isAscending={sortDirection === 'asc'}
                          onClick={() => handleSort('lastName')}
                        >
                          Last Name
                        </SortableColumnHeader>
                      </th>
                      <th className={`${thBase} w-[30%]`}>
                        <SortableColumnHeader
                          isActive={sortColumn === 'email'}
                          isAscending={sortDirection === 'asc'}
                          onClick={() => handleSort('email')}
                        >
                          Email
                        </SortableColumnHeader>
                      </th>
                      <th className={`${thBase} w-[20%]`}>
                        <SortableColumnHeader
                          isActive={sortColumn === 'tenants'}
                          isAscending={sortDirection === 'asc'}
                          onClick={() => handleSort('tenants')}
                        >
                          Tenants
                        </SortableColumnHeader>
                      </th>
                      <th className={`${thBase} w-[15%]`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="transition-colors hover:bg-surface-muted"
                      >
                        <td className="px-4 py-3 break-words text-sm">
                          <span
                            className="font-medium text-foreground break-words"
                            title={user.username}
                          >
                            {squishEmail(user.username, 8, 8)}
                          </span>
                        </td>
                        <td className="px-4 py-3 break-words text-sm">
                          <span className="text-body break-words">
                            {user.firstName}
                          </span>
                        </td>
                        <td className="px-4 py-3 break-words text-sm">
                          <span className="text-body break-words">
                            {user.lastName}
                          </span>
                        </td>
                        <td className="px-4 py-3 break-words text-sm">
                          <span className="text-muted break-all">
                            {user.email}
                          </span>
                        </td>
                        <td className="px-4 py-3 break-words text-sm">
                          <div className="flex flex-wrap gap-1.5">
                            {user.tenants && user.tenants.length > 0 ? (
                              user.tenants.map((tenant, index) => (
                                <span
                                  key={index}
                                  className={`tooltip ${tenantBadgeBase} ${
                                    tenant.role === 'admin'
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-brand-muted text-blue-800'
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
                              <span className="text-subtle text-sm italic">
                                No tenants
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 break-words text-sm">
                          <div className="flex items-center gap-1 ml-2.5">
                            <IconButton
                              href={`/administration/users/${encodeURIComponent(user?.username?.split('@')[0] || '')}`}
                              icon={
                                <UserCircleIcon className="size-[1.125rem] md:size-[1.375rem]" />
                              }
                              label="Manage user"
                              className="text-muted hover:bg-gray-200 hover:text-foreground"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </DataTable>
              ) : (
                <div className="bg-surface-muted border border-line rounded-lg p-12 text-center">
                  <p className="text-muted text-base m-0">
                    {searchInput
                      ? 'No users found matching your search'
                      : 'No users available'}
                  </p>
                </div>
              )}

              {filteredUsers.length > 0 && usersData && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={usersData.total_pages}
                  totalElements={usersData.total_elements}
                  itemLabel="users"
                  onPrev={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  onNext={() => setCurrentPage((prev) => prev + 1)}
                />
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
