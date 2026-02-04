import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  useGetTenantInvitations,
  useCreateTenantInvitation,
} from '@/hooks/useInvitations'
import {
  useGetTenantMembers,
  useGetUserTenantById,
  useAddMemberDirectly,
  useRemoveMemberFromTenant,
  useGetMembers,
} from '@/hooks/useTenants'
import { useAuth } from '@/auth/useAuth'
import {
  ArrowPathIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserMinusIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid'
import { toast, Toaster } from 'sonner'
import Button from '@/components/Button'
import ConfirmDialog from '@/components/ConfirmDialog'
import styles from './ManageTenantMembers.module.css'
import type { InvitationRole } from '@/types/invitations'

const roleOptions = [
  { label: 'Tenant Admin', value: 'admin' as InvitationRole },
  { label: 'Member', value: 'viewer' as InvitationRole },
]

const ManageTenantMembers = () => {
  const { id: tenantId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { data: tenantData } = useGetUserTenantById(tenantId || '')

  const isSuperAdmin = profile?.roles?.includes('super_admin')

  const [activeTab, setActiveTab] = useState<
    'members' | 'invite' | 'add-direct'
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
    username: string
    email: string
    firstName: string
    lastName: string
  } | null>(null)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<{
    id: string
    name: string
  } | null>(null)

  const { data: membersData, isLoading: membersLoading } = useGetTenantMembers(
    tenantId || '',
    currentMembersPage,
    membersPageSize,
    !!tenantId,
  )
  const { data: invitationsData, isLoading: invitationsLoading } =
    useGetTenantInvitations(tenantId || '', !!tenantId)

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

  const handleRemoveClick = (memberId: string, memberName: string) => {
    setMemberToRemove({ id: memberId, name: memberName })
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

  const handleBack = () => {
    navigate('/tenants/view')
  }

  const isLoading = membersLoading || invitationsLoading

  return (
    <>
      <Toaster richColors position="top-center" duration={2000} />
      <div className="page-container">
        <div className={styles.header}>
          <div>
            <h1 className="page-title">Manage Members</h1>
            <p className="page-subtitle">
              View members and send invitations for tenant
              <strong style={{ wordBreak: 'break-all' }}>
                {tenantData?.info.name ? ` ${tenantData.info.name}` : '...'}
              </strong>
            </p>
          </div>
          <Button onClick={handleBack} size="sm" variant="secondary">
            <ArrowLeftIcon className="size-4" />
            Back to Tenants
          </Button>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'members' ? styles['tab-active'] : ''}`}
            onClick={() => setActiveTab('members')}
          >
            Members
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'invite' ? styles['tab-active'] : ''}`}
            onClick={() => setActiveTab('invite')}
          >
            Invite Member
          </button>
          {isSuperAdmin && (
            <button
              className={`${styles.tab} ${activeTab === 'add-direct' ? styles['tab-active'] : ''}`}
              onClick={() => setActiveTab('add-direct')}
            >
              Add Member
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="loading-container">
            <ArrowPathIcon className="animate-spin size-10 text-blue-400" />
          </div>
        ) : (
          <>
            {activeTab === 'members' && (
              <div className={styles['tab-content']}>
                <div className={styles['members-section']}>
                  <h2 className={styles['section-title']}>Tenant Members</h2>
                  <div className={styles['table-wrapper']}>
                    <table className={styles.table}>
                      <thead className={styles['table-head']}>
                        <tr>
                          <th>First Name</th>
                          <th>Last Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody className={styles['table-body']}>
                        {membersData?.content &&
                        membersData.content.length > 0 ? (
                          membersData.content.map((member) => {
                            const tenantInfo = member.tenants?.find(
                              (t) => t.name,
                            )
                            return (
                              <tr key={member.id}>
                                <td>{member.firstName || '-'}</td>
                                <td>{member.lastName || '-'}</td>
                                <td>{member.email}</td>
                                <td>
                                  <span
                                    className={`${styles['role-badge']} ${styles[`role-${tenantInfo?.role || 'viewer'}`]}`}
                                  >
                                    {tenantInfo?.role === 'admin'
                                      ? 'Tenant Admin'
                                      : 'Member'}
                                  </span>
                                </td>
                                <td>
                                  <button
                                    onClick={() =>
                                      handleRemoveClick(
                                        member.id,
                                        member.username,
                                      )
                                    }
                                    className={styles['remove-button']}
                                    title="Remove member"
                                  >
                                    <UserMinusIcon className="size-4" />
                                  </button>
                                </td>
                              </tr>
                            )
                          })
                        ) : (
                          <tr>
                            <td colSpan={6} className={styles['empty-state']}>
                              No members found for this tenant
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {membersData?.content && membersData.content.length > 0 && (
                    <div className="pagination-container">
                      <div className="pagination-info">
                        <span className="pagination-text">
                          Page {currentMembersPage} of {membersData.total_pages}
                        </span>
                        <span className="pagination-count">
                          ({membersData.total_elements} total members)
                        </span>
                      </div>
                      <div className="pagination-buttons">
                        <button
                          onClick={() =>
                            setCurrentMembersPage((prev) =>
                              Math.max(1, prev - 1),
                            )
                          }
                          disabled={currentMembersPage === 1}
                          className="pagination-button"
                          aria-label="Previous page"
                        >
                          <ChevronLeftIcon className="pagination-icon" />
                        </button>
                        <button
                          onClick={() =>
                            setCurrentMembersPage((prev) =>
                              Math.min(membersData.total_pages, prev + 1),
                            )
                          }
                          disabled={
                            currentMembersPage >= membersData.total_pages
                          }
                          className="pagination-button"
                          aria-label="Next page"
                        >
                          <ChevronRightIcon className="pagination-icon" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles['invitations-section']}>
                  <h2 className={styles['section-title']}>
                    Pending Invitations
                  </h2>
                  <div className={styles['table-wrapper']}>
                    <table className={styles.table}>
                      <thead className={styles['table-head']}>
                        <tr>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Created At</th>
                        </tr>
                      </thead>
                      <tbody className={styles['table-body']}>
                        {invitationsData &&
                        invitationsData.content.length > 0 ? (
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
                                  className={`${styles['status-badge']} ${styles[`status-${invitation.status.toLowerCase()}`]}`}
                                >
                                  {invitation.status}
                                </span>
                              </td>
                              <td>
                                {new Date(
                                  invitation.created_at,
                                ).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className={styles['empty-state']}>
                              No pending invitations
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'invite' && (
              <div className={styles['tab-content']}>
                <form
                  onSubmit={handleInviteSubmit}
                  className={styles['invite-form']}
                >
                  <div className={styles['form-section']}>
                    <h2 className={styles['section-title']}>
                      Invite New Member
                    </h2>
                    <p className={styles['section-description']}>
                      Send an invitation to a new member to join this tenant.
                      They will receive an email with instructions to accept the
                      invitation.
                    </p>

                    <div className={styles['form-fields']}>
                      <div className={styles.field}>
                        <label className={styles.label}>
                          Email Address <span className="required">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={inviteForm.email}
                          onChange={handleInviteFormChange}
                          placeholder="Enter email address to invite..."
                          className={errors.email ? styles['input-error'] : ''}
                        />
                        {errors.email && (
                          <span className={styles.error}>{errors.email}</span>
                        )}
                      </div>

                      <div className={styles.field}>
                        <label className={styles.label}>
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

                    <div className={styles['form-actions']}>
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
              <div className={styles['tab-content']}>
                <form
                  onSubmit={handleAddDirectSubmit}
                  className={styles['invite-form']}
                >
                  <div className={styles['form-section']}>
                    <h2 className={styles['section-title']}>
                      Add a Member Directly
                    </h2>
                    <p className={styles['section-description']}>
                      Add a new member directly to this tenant without sending
                      an invitation. Search for a registered user by email or
                      username.
                    </p>

                    <div className={styles['form-fields']}>
                      {!selectedUser ? (
                        <div className={styles.field}>
                          <label className={styles.label}>
                            Search User <span className="required">*</span>
                          </label>
                          <div className={styles['search-wrapper']}>
                            <input
                              type="text"
                              name="search"
                              value={searchInput}
                              onChange={handleAddDirectFormChange}
                              placeholder="Search by email or username..."
                              className={
                                addDirectErrors.search
                                  ? styles['input-error']
                                  : ''
                              }
                              autoComplete="off"
                            />
                            {addDirectErrors.search && (
                              <span className={styles.error}>
                                {addDirectErrors.search}
                              </span>
                            )}

                            {showSearchResults && (
                              <div className={styles['search-results']}>
                                {searchLoading ? (
                                  <div className={styles['search-loading']}>
                                    <ArrowPathIcon className="animate-spin size-5 text-blue-400" />
                                    <span>Searching...</span>
                                  </div>
                                ) : searchResults &&
                                  searchResults.content.length > 0 ? (
                                  <ul className={styles['results-list']}>
                                    {searchResults.content.map((user) => (
                                      <li
                                        key={user.id}
                                        className={styles['result-item']}
                                        onClick={() => handleUserSelect(user)}
                                      >
                                        <div className={styles['user-info']}>
                                          <span className={styles['user-name']}>
                                            {user.firstName} {user.lastName}
                                          </span>
                                          <span
                                            className={styles['user-details']}
                                          >
                                            {user.username} • {user.email}
                                          </span>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <div className={styles['no-results']}>
                                    No users found
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className={styles.field}>
                          <label className={styles.label}>Selected User</label>
                          <div className={styles['selected-user-card']}>
                            <div className={styles['selected-user-info']}>
                              <span className={styles['selected-user-name']}>
                                {selectedUser.firstName} {selectedUser.lastName}
                              </span>
                              <span className={styles['selected-user-details']}>
                                {selectedUser.username} • {selectedUser.email}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={handleClearSelectedUser}
                              className={styles['clear-user-button']}
                              aria-label="Clear selected user"
                            >
                              <XMarkIcon className="size-5" />
                            </button>
                          </div>
                        </div>
                      )}

                      <div className={styles.field}>
                        <label className={styles.label}>
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

                    <div className={styles['form-actions']}>
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
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={removeDialogOpen}
        title="Remove Member"
        message={
          memberToRemove ? (
            <>
              Are you sure you want to remove this user from the tenant "
              {tenantData?.info.name}"?
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
