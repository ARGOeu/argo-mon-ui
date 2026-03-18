import { useState, useEffect } from 'react'
import { useGetAdminInvitations } from '@/hooks/useInvitations'
import { useRevokeInvitation } from '@/hooks/useTenants'
import SearchInput from '@/components/SearchInput'
import DataTable, {
  thBase,
  tdBase,
  SortableColumnHeader,
} from '@/components/DataTable'
import { XCircleIcon } from '@heroicons/react/24/solid'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import ConfirmDialog from '@/components/ConfirmDialog'
import Pagination from '@/components/Pagination'
import Badge from '@/components/Badge'
import { roleBadgeClass, invitationStatusBadgeClass } from '@/utils/badges'

interface AdminInvitationsProps {
  isSuperAdmin: boolean
}

type SortColumn = 'tenant_name' | 'email' | 'role' | 'status' | 'created_at'
type SortOrder = 'ASC' | 'DESC'

const pageSize = 10

const AdminInvitationsTab = ({ isSuperAdmin }: AdminInvitationsProps) => {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC')
  const [currentPage, setCurrentPage] = useState(1)
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
        <div className="text-center bg-surface-muted rounded-lg">
          <p className="text-sm text-subtle italic py-6 px-12">
            {searchInput
              ? 'No invitations found matching your search'
              : 'No invitations found'}
          </p>
        </div>
      )
    }

    return (
      <>
        <DataTable tableClassName="table-fixed min-w-[700px]">
          <thead className="bg-surface-strong border-b border-line">
            <tr>
              <th className={`${thBase} w-[22%]`}>
                <SortableColumnHeader
                  isActive={sortColumn === 'tenant_name'}
                  isAscending={sortOrder === 'ASC'}
                  onClick={() => handleSort('tenant_name')}
                >
                  Tenant Name
                </SortableColumnHeader>
              </th>
              <th className={`${thBase} w-[22%]`}>
                <SortableColumnHeader
                  isActive={sortColumn === 'email'}
                  isAscending={sortOrder === 'ASC'}
                  onClick={() => handleSort('email')}
                >
                  Email
                </SortableColumnHeader>
              </th>
              <th className={`${thBase} w-[15%]`}>
                <SortableColumnHeader
                  isActive={sortColumn === 'role'}
                  isAscending={sortOrder === 'ASC'}
                  onClick={() => handleSort('role')}
                >
                  Role
                </SortableColumnHeader>
              </th>
              <th className={`${thBase} w-[15%]`}>
                <SortableColumnHeader
                  isActive={sortColumn === 'status'}
                  isAscending={sortOrder === 'ASC'}
                  onClick={() => handleSort('status')}
                >
                  Status
                </SortableColumnHeader>
              </th>
              <th className={`${thBase} w-[15%]`}>
                <SortableColumnHeader
                  isActive={sortColumn === 'created_at'}
                  isAscending={sortOrder === 'ASC'}
                  onClick={() => handleSort('created_at')}
                >
                  Created At
                </SortableColumnHeader>
              </th>
              <th className={`${thBase} w-[12%]`}>Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invitationsData.content.map((invitation) => (
              <tr
                key={invitation.id}
                className="transition-colors hover:bg-surface-muted"
              >
                <td className={tdBase}>
                  <span className="break-words">{invitation.tenant_name}</span>
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
                    {invitation.role === 'admin' ? 'Admin' : 'Viewer'}
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
                          : invitation.status === 'REVOKED'
                            ? 'Revoked'
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
                  <div className="flex items-center gap-1 ml-3">
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
                        className="inline-flex items-center justify-center p-1.5 bg-transparent rounded-md text-red-500 border-none cursor-pointer transition-all hover:bg-red-50 active:scale-95 tooltip"
                        data-tip="Revoke invitation"
                        disabled={revokeInvitationMutation.isPending}
                      >
                        <XCircleIcon className="size-6" />
                      </button>
                    ) : (
                      <span className="ml-3.5 block text-muted text-sm">-</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>

        {invitationsData.content && invitationsData.content.length > 0 && (
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
    )
  }

  return (
    <>
      <SearchInput
        className="mb-3"
        value={searchInput}
        onChange={setSearchInput}
        onClear={handleClearSearch}
        placeholder="Search invitations by tenant name or email..."
        maxWidth="max-w-[24rem]"
      />
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

export default AdminInvitationsTab
