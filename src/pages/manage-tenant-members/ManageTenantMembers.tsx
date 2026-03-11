import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useCreateTenantInvitation } from '@/hooks/useInvitations'
import {
  useGetTenantMembers,
  useGetUserTenantById,
  useAddMemberDirectly,
  useRemoveMemberFromTenant,
  useGetMembers,
} from '@/hooks/useTenants'
import { useAuth } from '@/auth/useAuth'
import ErrorDisplay from '@/components/ErrorDisplay'
import { UserMinusIcon, XMarkIcon } from '@heroicons/react/16/solid'
import { toast } from 'sonner'
import Button from '@/components/Button'
import ConfirmDialog from '@/components/ConfirmDialog'
import TenantInvitations from './TenantInvitations'
import PageHeader from '@/components/PageHeader'
import Tabs from '@/components/Tabs'
import DataTable from '@/components/DataTable'
import Pagination from '@/components/Pagination'
import Badge from '@/components/Badge'
import LoadingSpinner from '@/components/LoadingSpinner'
import { roleBadgeClass } from '@/utils/badges'
import type { InvitationRole } from '@/types/invitations'

const roleOptions = [
  { label: 'Tenant Admin', value: 'admin' as InvitationRole },
  { label: 'Member', value: 'viewer' as InvitationRole },
]

const ManageTenantMembers = () => {
  const { id: tenantId } = useParams<{ id: string }>()
  const { profile } = useAuth()
  const { data: tenantData, error: tenantError } = useGetUserTenantById(
    tenantId || '',
  )

  const isSuperAdmin = profile?.roles?.includes('super_admin')

  const [activeTab, setActiveTab] = useState<
    'members' | 'invite' | 'add-direct' | 'invitations'
  >('members')
  const [currentMembersPage, setCurrentMembersPage] = useState(1)
  const membersPageSize = 10
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'viewer' as InvitationRole,
  })
  const [addDirectForm, setAddDirectForm] = useState<{
    username: string
    email: string
    role: InvitationRole
  }>({
    username: '',
    email: '',
    role: 'viewer' as InvitationRole,
  })
  const [errors, setErrors] = useState({
    email: '',
  })
  const [addDirectErrors, setAddDirectErrors] = useState({
    search: '',
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedUser, setSelectedUser] = useState<{
    email: string
    firstName: string
    lastName: string
  } | null>(null)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<{
    id: string
    email: string
  } | null>(null)

  const { data: membersData, isLoading: membersLoading } = useGetTenantMembers(
    tenantId || '',
    currentMembersPage,
    membersPageSize,
    !!tenantId,
  )

  const { data: searchResults, isLoading: searchLoading } = useGetMembers(
    1,
    5,
    searchQuery,
    !!searchQuery && showSearchResults,
  )

  const createInvitationMutation = useCreateTenantInvitation()
  const addMemberDirectlyMutation = useAddMemberDirectly()
  const removeMemberMutation = useRemoveMemberFromTenant()

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleInviteFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target

    setInviteForm((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (name === 'email') {
      if (!value.trim()) {
        setErrors((prev) => ({ ...prev, email: 'Email is required' }))
      } else if (!validateEmail(value)) {
        setErrors((prev) => ({ ...prev, email: 'Invalid email format' }))
      } else {
        setErrors((prev) => ({ ...prev, email: '' }))
      }
    }
  }

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!inviteForm.email.trim()) {
      setErrors({ email: 'Email is required' })
      return
    }

    if (!validateEmail(inviteForm.email)) {
      setErrors({ email: 'Invalid email format' })
      return
    }

    if (!tenantId) {
      toast.error('Tenant ID is missing')
      return
    }

    createInvitationMutation.mutate(
      {
        tenantId,
        data: {
          email: inviteForm.email,
          role: inviteForm.role,
        },
      },
      {
        onSuccess: () => {
          toast.success('Invitation sent successfully!')
          setInviteForm({ email: '', role: 'viewer' })
          setErrors({ email: '' })
        },
        onError: (error) => {
          toast.error(`Failed to send invitation: ${error.message}`)
        },
      },
    )
  }

  const handleAddDirectFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target

    if (name === 'search') {
      setSearchInput(value)
      setShowSearchResults(true)
      if (!value.trim()) {
        setShowSearchResults(false)
        setAddDirectErrors((prev) => ({ ...prev, search: '' }))
      }
    } else if (name === 'role') {
      setAddDirectForm((prev) => ({
        ...prev,
        role: value as InvitationRole,
      }))
    }
  }

  const handleUserSelect = (user: {
    username: string
    email: string
    firstName: string
    lastName: string
  }) => {
    setSelectedUser(user)
    setAddDirectForm({
      username: user.username,
      email: user.email,
      role: addDirectForm.role,
    })
    setSearchInput('')
    setShowSearchResults(false)
    setAddDirectErrors({ search: '' })
  }

  const handleClearSelectedUser = () => {
    setSelectedUser(null)
    setAddDirectForm({
      username: '',
      email: '',
      role: addDirectForm.role,
    })
    setSearchInput('')
  }

  const handleAddDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUser) {
      setAddDirectErrors({ search: 'Please select a user' })
      return
    }

    if (!tenantId) {
      toast.error('Tenant ID is missing')
      return
    }

    addMemberDirectlyMutation.mutate(
      {
        tenantId,
        data: {
          username: addDirectForm.username,
          email: addDirectForm.email,
          role: addDirectForm.role,
        },
      },
      {
        onSuccess: () => {
          toast.success('Member added successfully!')
          setAddDirectForm({ username: '', email: '', role: 'viewer' })
          setSelectedUser(null)
          setSearchInput('')
          setAddDirectErrors({ search: '' })
        },
        onError: (error) => {
          toast.error(`Failed to add member: ${error.message}`)
        },
      },
    )
  }

  const handleRemoveClick = (memberId: string, memberEmail: string) => {
    setMemberToRemove({ id: memberId, email: memberEmail })
    setRemoveDialogOpen(true)
  }

  const handleRemoveConfirm = () => {
    if (!tenantId || !memberToRemove) return

    removeMemberMutation.mutate(
      {
        tenantId,
        memberId: memberToRemove.id,
      },
      {
        onSuccess: () => {
          toast.success('Member removed successfully!')
          setRemoveDialogOpen(false)
          setMemberToRemove(null)
        },
        onError: (error) => {
          toast.error(`Failed to remove member: ${error.message}`)
        },
      },
    )
  }

  const handleRemoveCancel = () => {
    setRemoveDialogOpen(false)
    setMemberToRemove(null)
  }

  const isLoading = membersLoading

  if (tenantError) {
    return (
      <>
        <div className="page-container">
          <ErrorDisplay error={tenantError} context="tenant" />
        </div>
      </>
    )
  }

  return (
    <>
      <div className="page-container">
        <PageHeader
          title="Manage Members"
          subtitle={
            <>
              View members and send invitations for tenant
              <strong className="break-all">
                {tenantData?.info.name ? ` ${tenantData.info.name}` : '...'}
              </strong>
            </>
          }
          className="mb-2 pb-2"
          navigateTo={{ label: 'Back to Tenants', to: '/tenants' }}
        />

        <Tabs
          tabs={[
            { id: 'members', label: 'Members' },
            { id: 'invite', label: 'Invite Member' },
            ...(isSuperAdmin
              ? [{ id: 'add-direct', label: 'Add Member' }]
              : []),
            { id: 'invitations', label: 'Invitations' },
          ]}
          activeTab={activeTab}
          onChange={(id) =>
            setActiveTab(
              id as 'members' | 'invite' | 'add-direct' | 'invitations',
            )
          }
          className="mb-4"
        />

        {isLoading ? (
          <div className="loading-container">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {activeTab === 'members' && (
              <div className="animate-fade-in">
                <div className="mb-10">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2.5">
                    Tenant Members
                  </h2>
                  <DataTable tableClassName="min-w-[700px]">
                    <thead className="bg-surface-muted border-b border-line">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-body whitespace-nowrap">
                          First Name
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-body whitespace-nowrap">
                          Last Name
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-body whitespace-nowrap">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-body whitespace-nowrap">
                          Role
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-body whitespace-nowrap">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {membersData?.content &&
                      membersData.content.length > 0 ? (
                        membersData.content.map((member) => {
                          const tenantInfo = member.tenants?.find(
                            (t) => t.name === tenantData?.info.name,
                          )
                          return (
                            <tr
                              key={member.id}
                              className="hover:bg-surface-muted"
                            >
                              <td className="px-4 py-3.5 text-sm text-gray-800 break-words">
                                {member.firstName || '-'}
                              </td>
                              <td className="px-4 py-3.5 text-sm text-gray-800 break-words">
                                {member.lastName || '-'}
                              </td>
                              <td className="px-4 py-3.5 text-sm text-gray-800 break-words">
                                {member.email}
                              </td>
                              <td className="px-4 py-3.5 text-sm text-gray-800">
                                <Badge
                                  className={
                                    roleBadgeClass[
                                      tenantInfo?.role ?? 'viewer'
                                    ] ?? 'bg-surface-strong text-muted'
                                  }
                                >
                                  {tenantInfo?.role === 'admin'
                                    ? 'Tenant Admin'
                                    : 'Member'}
                                </Badge>
                              </td>
                              <td className="px-4 py-3.5 text-sm text-gray-800">
                                <button
                                  onClick={() =>
                                    handleRemoveClick(member.id, member.email)
                                  }
                                  className="ml-2 inline-flex items-center justify-center p-1.5 bg-transparent rounded-md text-red-500 border-none cursor-pointer transition-all hover:bg-red-50 active:scale-95 tooltip"
                                  data-tip="Remove member"
                                >
                                  <UserMinusIcon className="w-[1.2rem] h-[1.2rem]" />
                                </button>
                              </td>
                            </tr>
                          )
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="text-center !text-subtle italic !p-8"
                          >
                            No members found for this tenant
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </DataTable>

                  {membersData?.content && membersData.content.length > 0 && (
                    <Pagination
                      currentPage={currentMembersPage}
                      totalPages={membersData.total_pages}
                      totalElements={membersData.total_elements}
                      itemLabel="members"
                      className="py-1 my-4"
                      onPrev={() =>
                        setCurrentMembersPage((prev) => Math.max(1, prev - 1))
                      }
                      onNext={() =>
                        setCurrentMembersPage((prev) =>
                          Math.min(membersData.total_pages, prev + 1),
                        )
                      }
                    />
                  )}
                </div>
              </div>
            )}

            {activeTab === 'invite' && (
              <div className="animate-fade-in">
                <form onSubmit={handleInviteSubmit} className="max-w-xl">
                  <div className="bg-surface-muted border border-line rounded-lg px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2.5">
                      Invite New Member
                    </h2>
                    <p className="text-sm text-muted mb-6 leading-relaxed">
                      Send an invitation to a new member to join this tenant.
                      They will receive an email with instructions to accept the
                      invitation.
                    </p>

                    <div className="max-w-[400px] flex flex-col gap-5 mb-6">
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-body mb-1.5">
                          Email Address <span className="required">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={inviteForm.email}
                          onChange={handleInviteFormChange}
                          placeholder="Enter email address to invite..."
                          className={
                            errors.email
                              ? '!border-red-500 focus:!border-red-500 focus:!ring-red-500/10'
                              : ''
                          }
                        />
                        {errors.email && (
                          <span className="text-xs text-red-500 mt-1">
                            {errors.email}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-body mb-1.5">
                          Role <span className="required">*</span>
                        </label>
                        <select
                          name="role"
                          value={inviteForm.role}
                          onChange={handleInviteFormChange}
                        >
                          {roleOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-start pb-1">
                      <Button
                        variant="primary"
                        size="md"
                        type="submit"
                        disabled={
                          !inviteForm.email.trim() ||
                          !!errors.email ||
                          createInvitationMutation.isPending
                        }
                      >
                        Send Invitation
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'add-direct' && isSuperAdmin && (
              <div className="animate-fade-in">
                <form onSubmit={handleAddDirectSubmit} className="max-w-xl">
                  <div className="bg-surface-muted border border-line rounded-lg px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2.5">
                      Add a Member Directly
                    </h2>
                    <p className="text-sm text-muted mb-6 leading-relaxed">
                      Add a new member directly to this tenant without sending
                      an invitation. Search for a registered user by email or
                      name.
                    </p>

                    <div className="max-w-[400px] flex flex-col gap-5 mb-6">
                      {!selectedUser ? (
                        <div className="flex flex-col">
                          <label className="text-sm font-medium text-body mb-1.5">
                            Search User <span className="required">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              name="search"
                              value={searchInput}
                              onChange={handleAddDirectFormChange}
                              placeholder="Search by email or name..."
                              className={
                                addDirectErrors.search
                                  ? '!border-red-500 focus:!border-red-500 focus:!ring-red-500/10 w-full'
                                  : 'w-full'
                              }
                              autoComplete="off"
                            />
                            {addDirectErrors.search && (
                              <span className="text-xs text-red-500 mt-1">
                                {addDirectErrors.search}
                              </span>
                            )}

                            {showSearchResults && (
                              <div className="absolute top-full left-0 right-0 bg-white border border-line-strong rounded-lg mt-1 max-h-[300px] overflow-y-auto shadow-md z-10">
                                {searchLoading ? (
                                  <div className="flex items-center justify-center gap-2 p-4 text-muted text-sm">
                                    <LoadingSpinner size="sm" />
                                    <span>Searching...</span>
                                  </div>
                                ) : searchResults &&
                                  searchResults.content.length > 0 ? (
                                  <ul className="list-none m-0 p-0">
                                    {searchResults.content.map((user) => (
                                      <li
                                        key={user.id}
                                        className="px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 hover:bg-surface-muted last:border-b-0"
                                        onClick={() => handleUserSelect(user)}
                                      >
                                        <div className="flex flex-col gap-1">
                                          <span className="text-sm font-semibold text-foreground">
                                            {user.firstName} {user.lastName}
                                          </span>
                                          <span className="text-xs text-muted">
                                            {user.email}
                                          </span>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <div className="p-4 text-center text-subtle text-sm italic">
                                    No users found
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <label className="text-sm font-medium text-body mb-1.5">
                            Selected User
                          </label>
                          <div className="flex items-center justify-between px-4 py-3 bg-surface-muted border border-line rounded-lg">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-semibold text-foreground">
                                {selectedUser.firstName} {selectedUser.lastName}
                              </span>
                              <span className="text-xs text-muted">
                                {selectedUser.email}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={handleClearSelectedUser}
                              className="flex items-center justify-center p-1 bg-transparent border-none rounded-md text-muted cursor-pointer transition-all hover:bg-gray-200 hover:text-body"
                              aria-label="Clear selected user"
                            >
                              <XMarkIcon className="size-5" />
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-body mb-1.5">
                          Role <span className="required">*</span>
                        </label>
                        <select
                          name="role"
                          value={addDirectForm.role}
                          onChange={handleAddDirectFormChange}
                        >
                          {roleOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-start pb-1">
                      <Button
                        variant="primary"
                        size="md"
                        type="submit"
                        disabled={
                          !selectedUser || addMemberDirectlyMutation.isPending
                        }
                      >
                        Add Member
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'invitations' && (
              <div className="animate-fade-in">
                <TenantInvitations
                  tenantId={tenantId || ''}
                  tenantName={tenantData?.info.name || ''}
                />
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={removeDialogOpen}
        title="Remove Member"
        message={
          memberToRemove ? (
            <>
              Are you sure you want to remove user with email{' '}
              <strong>{memberToRemove.email}</strong> from tenant{' '}
              <strong>{tenantData?.info.name}</strong>?
              <br />
              <span className="text-amber-600 font-medium">
                The user will lose access to this tenant.
              </span>
            </>
          ) : (
            ''
          )
        }
        confirmLabel="Remove"
        cancelLabel="Cancel"
        onConfirm={handleRemoveConfirm}
        onCancel={handleRemoveCancel}
      />
    </>
  )
}

export default ManageTenantMembers
