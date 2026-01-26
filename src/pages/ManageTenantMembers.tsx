import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  useGetTenantInvitations,
  useCreateTenantInvitation,
} from '@/hooks/useInvitations'
import { useGetTenantMembers, useGetUserTenantById } from '@/hooks/useTenants'
import {
  ArrowPathIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/solid'
import { toast, Toaster } from 'sonner'
import Button from '@/components/Button'
import styles from './ManageTenantMembers.module.css'
import adminStyles from './AdminInvitations.module.css'
import type { InvitationRole } from '@/types/invitations'

const roleOptions = [
  { label: 'Tenant Admin', value: 'admin' as InvitationRole },
  { label: 'Member', value: 'viewer' as InvitationRole },
]

const ManageTenantMembers = () => {
  const { id: tenantId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: tenantData } = useGetUserTenantById(tenantId || '')

  const [activeTab, setActiveTab] = useState<'members' | 'invite'>('members')
  const [currentMembersPage, setCurrentMembersPage] = useState(1)
  const membersPageSize = 10
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'viewer' as InvitationRole,
  })
  const [errors, setErrors] = useState({
    email: '',
  })

  const { data: membersData, isLoading: membersLoading } = useGetTenantMembers(
    tenantId || '',
    currentMembersPage,
    membersPageSize,
    !!tenantId,
  )
  const { data: invitationsData, isLoading: invitationsLoading } =
    useGetTenantInvitations(tenantId || '', !!tenantId)

  const createInvitationMutation = useCreateTenantInvitation()

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

  const handleBack = () => {
    navigate('/tenants/view')
  }

  const isLoading = membersLoading || invitationsLoading

  return (
    <>
      <Toaster richColors position="top-center" duration={2000} />
      <div className={styles.container}>
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
          <Button variant="secondary" size="md" onClick={handleBack}>
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
                          <th>Username</th>
                          <th>First Name</th>
                          <th>Last Name</th>
                          <th>Email</th>
                          <th>Role</th>
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
                                <td>{member.username}</td>
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
                              </tr>
                            )
                          })
                        ) : (
                          <tr>
                            <td colSpan={5} className={styles['empty-state']}>
                              No members found for this tenant
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {membersData?.content && membersData.content.length > 0 && (
                    <div className={adminStyles['pagination-container']}>
                      <div className={adminStyles['pagination-info']}>
                        <span className={adminStyles['pagination-text']}>
                          Page {currentMembersPage} of {membersData.total_pages}
                        </span>
                        <span className={adminStyles['pagination-count']}>
                          ({membersData.total_elements} total members)
                        </span>
                      </div>
                      <div className={adminStyles['pagination-buttons']}>
                        <button
                          onClick={() =>
                            setCurrentMembersPage((prev) =>
                              Math.max(1, prev - 1),
                            )
                          }
                          disabled={currentMembersPage === 1}
                          className={adminStyles['pagination-button']}
                          aria-label="Previous page"
                        >
                          <ChevronLeftIcon
                            className={adminStyles['pagination-icon']}
                          />
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
                          className={adminStyles['pagination-button']}
                          aria-label="Next page"
                        >
                          <ChevronRightIcon
                            className={adminStyles['pagination-icon']}
                          />
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
                          placeholder="user@example.com"
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
          </>
        )}
      </div>
    </>
  )
}

export default ManageTenantMembers
