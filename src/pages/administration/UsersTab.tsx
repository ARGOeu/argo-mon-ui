import { useState, useMemo, useEffect, useRef } from 'react'
import { useAuth } from '@/auth/useAuth'
import { useGetMembers } from '@/hooks/useTenants'
import { UserCircleIcon } from '@heroicons/react/16/solid'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import SearchInput from '@/components/SearchInput'
import DataTable, { thBase, SortableColumnHeader } from '@/components/DataTable'
import Pagination from '@/components/Pagination'
import IconButton from '@/components/IconButton'
import { squishEmail } from '@/utils/profile'

type SortColumn =
  | 'username'
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'memberships'
type SortDirection = 'asc' | 'desc'

const pageSize = 10

const tenantBadgeBase =
  'tooltip inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full max-w-[120px]'

const TenantBadge = ({
  name,
  role,
  colorClass,
}: {
  name: string
  role: string
  colorClass: string
}) => {
  const textRef = useRef<HTMLSpanElement>(null)
  const [isTruncated, setIsTruncated] = useState(false)

  useEffect(() => {
    const el = textRef.current
    if (el) {
      setIsTruncated(el.scrollWidth > el.clientWidth)
    }
  }, [name])

  return (
    <span
      className={`${tenantBadgeBase} ${colorClass}`}
      data-tip={isTruncated ? `${name} (${role})` : role}
    >
      <span ref={textRef} className="truncate min-w-0">
        {name}
      </span>
    </span>
  )
}

const UsersTab = () => {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [currentPage, setCurrentPage] = useState(1)

  const { isSuperAdmin } = useAuth()

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
  } = useGetMembers(currentPage, pageSize, debouncedSearch, !!isSuperAdmin)

  const filteredUsers = useMemo(() => {
    const membersData = usersData?.content || []
    if (!membersData || membersData.length === 0) return []

    let filtered = membersData

    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: string | number
        let bValue: string | number

        if (sortColumn === 'memberships') {
          aValue = a.memberships?.length || 0
          bValue = b.memberships?.length || 0
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

  return (
    <>
      <SearchInput
        className="mb-3"
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
                  <th className={`${thBase} w-[25%]`}>
                    <SortableColumnHeader
                      isActive={sortColumn === 'email'}
                      isAscending={sortDirection === 'asc'}
                      onClick={() => handleSort('email')}
                    >
                      Email
                    </SortableColumnHeader>
                  </th>
                  <th className={`${thBase} w-[25%]`}>
                    <SortableColumnHeader
                      isActive={sortColumn === 'memberships'}
                      isAscending={sortDirection === 'asc'}
                      onClick={() => handleSort('memberships')}
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
                      <span className="text-muted break-all">{user.email}</span>
                    </td>
                    <td className="px-4 py-3 break-words text-sm">
                      <div className="flex flex-wrap gap-1.5">
                        {user.memberships && user.memberships.length > 0 ? (
                          user.memberships.map((tenant, index) => (
                            <TenantBadge
                              key={index}
                              name={tenant.name}
                              role={tenant.role}
                              colorClass={
                                tenant.role === 'tenant_admin'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-brand-muted text-blue-800'
                              }
                            />
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
            <div className="text-center bg-surface-muted rounded-lg">
              <p className="text-sm text-subtle italic py-6 px-12">
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
  )
}

export default UsersTab
