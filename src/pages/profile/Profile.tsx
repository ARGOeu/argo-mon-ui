import { useState } from 'react'
import { useGetUserProfileByUsername } from '@/hooks/useTenants'
import { useRevokeRoleMutation } from '@/hooks/useResources'
import { useRoleFriendlyName } from '@/hooks/useRoleFriendlyName'
import { useAuth } from '@/auth/useAuth'
import { Navigate, useParams } from 'react-router-dom'
import { UserCircleIcon } from '@heroicons/react/16/solid'
import { UserMinusIcon } from '@heroicons/react/24/solid'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/LoadingSpinner'
import ConfirmDialog from '@/components/ConfirmDialog'
import ErrorDisplay from '@/components/ErrorDisplay'
import PageHeader from '@/components/PageHeader'
import Badge from '@/components/Badge'
import AssignRoleToUser from './AssignRoleToUser'
import { squishEmail } from '@/utils/profile'
import { roleBadgeClass } from '@/utils/badges'
import { TENANT_MEMBERSHIP_ENTITY } from '@/utils/memberships'
import { tenantMapper } from '@/utils/roleAssignmentMapper'

const fieldValueClass = 'text-sm text-gray-800 font-medium'
const fieldValueUnavailableClass = 'text-sm text-subtle italic'

const profileGridClass = 'grid grid-cols-[200px_1fr] gap-6'

const Profile = () => {
  const { username } = useParams<{ username: string }>()

  const { isSuperAdmin, profile } = useAuth()

  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [membershipToRemove, setMembershipToRemove] = useState<{
    entityType: string
    name: string
    resourceLabel: string
    role: string
    displayName: string
  } | null>(null)

  const {
    data: userProfileData,
    isLoading,
    error,
  } = useGetUserProfileByUsername(username || '', !!username && isSuperAdmin)

  const getRoleFriendlyName = useRoleFriendlyName()
  const revokeRoleMutation = useRevokeRoleMutation()

  if (username && !isSuperAdmin) {
    return <Navigate to="/profile" replace />
  }

  // Determine which profile to display based on route
  const isViewingOtherUser = !!username
  const displayProfile = isViewingOtherUser ? userProfileData : null

  const handleRemoveClick = (
    entityType: string,
    name: string,
    resourceLabel: string,
    role: string,
    displayName: string,
  ) => {
    setMembershipToRemove({
      entityType,
      name,
      resourceLabel,
      role,
      displayName,
    })
    setRemoveDialogOpen(true)
  }

  const handleRemoveConfirm = () => {
    const userId = userProfileData?.id || ''

    if (!membershipToRemove || !userId) return

    revokeRoleMutation.mutate(
      {
        api_resource: membershipToRemove.entityType,
        resource_id: membershipToRemove.name,
        role: membershipToRemove.role,
        member_id: userId,
      },
      {
        onSuccess: () => {
          toast.success('Role revoked successfully!')
          setRemoveDialogOpen(false)
          setMembershipToRemove(null)
        },
        onError: (error) => {
          toast.error(`Failed to revoke role: ${error.message}`)
        },
      },
    )
  }

  const handleRemoveCancel = () => {
    setRemoveDialogOpen(false)
    setMembershipToRemove(null)
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
      </div>
    )
  }

  if (isViewingOtherUser && error) {
    return (
      <div className="flex flex-col justify-center items-center">
        <div className="max-w-6xl w-full">
          <PageHeader
            title="Manage User"
            subtitle="View and manage user account"
            className="mb-6"
            navigateTo={{
              label: 'Back to Users',
              to: '/administration#users',
            }}
          />
          <ErrorDisplay error={error.message} context="user profile" />
        </div>
      </div>
    )
  }

  // Use displayProfile for viewing other users, profile for own profile
  const currentUsername = isViewingOtherUser
    ? displayProfile?.username || 'N/A'
    : profile?.username || 'N/A'
  const currentFirstName = isViewingOtherUser
    ? displayProfile?.firstName || 'Not available'
    : profile?.name || 'Not available'
  const currentLastName = isViewingOtherUser
    ? displayProfile?.lastName || 'Not available'
    : profile?.surname || 'Not available'
  const currentEmail = isViewingOtherUser
    ? displayProfile?.email || 'Not available'
    : profile?.email || 'Not available'

  const currentGroups = isViewingOtherUser ? [] : profile?.groups || []
  const filteredGroups = currentGroups.filter(
    (group) => group.name !== 'members',
  )

  const membershipEntries =
    isViewingOtherUser && displayProfile?.memberships
      ? Object.entries(displayProfile.memberships)
          .filter(([, roles]) => roles.length > 0)
          .sort(([a], [b]) => {
            if (a === TENANT_MEMBERSHIP_ENTITY) return -1
            if (b === TENANT_MEMBERSHIP_ENTITY) return 1
            return a.localeCompare(b)
          })
      : []

  return (
    <div className="flex flex-col justify-center items-center">
      <ConfirmDialog
        isOpen={removeDialogOpen}
        title="Revoke Role"
        message={
          membershipToRemove ? (
            <>
              Are you sure you want to revoke the{' '}
              <strong>{membershipToRemove.displayName}</strong> role in{' '}
              <strong>{membershipToRemove.resourceLabel}</strong>?
              <br />
              <span className="text-amber-600 font-medium">
                The user will lose access to this resource.
              </span>
            </>
          ) : (
            ''
          )
        }
        confirmLabel="Revoke"
        cancelLabel="Cancel"
        isPending={revokeRoleMutation.isPending}
        onConfirm={handleRemoveConfirm}
        onCancel={handleRemoveCancel}
      />
      <div className="max-w-6xl w-full">
        <PageHeader
          title={isViewingOtherUser ? 'Manage User' : 'Profile'}
          subtitle={
            isViewingOtherUser
              ? 'View and manage user account'
              : 'View your account information'
          }
          className="mb-4"
          navigateTo={
            isViewingOtherUser
              ? { label: 'Back to Users', to: '/administration#users' }
              : undefined
          }
        />

        {(profile || displayProfile) && (
          <div className="bg-white border border-line rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-4 border-b border-line">
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-full p-3 shadow-sm">
                  <UserCircleIcon className="size-12 text-blue-600" />
                </div>
                <div>
                  <label className="text-base font-medium text-muted">
                    Username
                  </label>
                  <h2
                    className="text-base font-bold text-gray-800 break-words"
                    title={currentUsername}
                  >
                    {squishEmail(currentUsername, 12, 12)}
                  </h2>
                </div>
              </div>
            </div>

            <div className="px-8 py-4">
              <div className={profileGridClass}>
                <div>
                  <h3 className="text-sm font-semibold text-body uppercase tracking-wider">
                    Account Details
                  </h3>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-muted">
                      First Name
                    </label>
                    <p
                      className={
                        currentFirstName !== 'Not available'
                          ? fieldValueClass
                          : fieldValueUnavailableClass
                      }
                    >
                      {currentFirstName}
                    </p>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-muted">
                      Last Name
                    </label>
                    <p
                      className={
                        currentLastName !== 'Not available'
                          ? fieldValueClass
                          : fieldValueUnavailableClass
                      }
                    >
                      {currentLastName}
                    </p>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-muted">
                      Email
                    </label>
                    <p
                      className={
                        currentEmail !== 'Not available'
                          ? fieldValueClass
                          : fieldValueUnavailableClass
                      }
                    >
                      {currentEmail}
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-200 my-5" />

              <div className={profileGridClass}>
                <div>
                  <h3 className="text-sm font-semibold text-body uppercase tracking-wider">
                    Memberships
                  </h3>
                </div>
                <div className="flex flex-col gap-3">
                  {isSuperAdmin && isViewingOtherUser ? (
                    membershipEntries.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {membershipEntries.map(([entityType, roles]) => {
                          const filteredRoles = roles.filter(
                            (r) => r.name !== 'members',
                          )
                          return (
                            <div key={entityType} className="flex flex-col">
                              <label className="text-sm font-medium text-muted mb-1">
                                {entityType === TENANT_MEMBERSHIP_ENTITY
                                  ? 'Tenants'
                                  : entityType}
                              </label>
                              {filteredRoles.length > 0 ? (
                                <div className="flex flex-col gap-2.5">
                                  {filteredRoles.map((role, index) => {
                                    const resourceLabel =
                                      role.attributes?.[
                                        tenantMapper.tenant_name
                                      ]?.[0] ?? role.name
                                    return (
                                      <div
                                        key={index}
                                        className="w-fit flex items-center justify-between px-4 py-1 bg-surface-muted border border-line rounded-lg transition-all hover:bg-surface-strong"
                                      >
                                        <div className="flex items-center gap-5 flex-1">
                                          <span className="text-sm font-medium text-gray-800">
                                            {resourceLabel}
                                          </span>
                                          <Badge
                                            size="xs"
                                            className={
                                              roleBadgeClass[role.role] ??
                                              roleBadgeClass['tenant_viewer']
                                            }
                                          >
                                            {getRoleFriendlyName(role.role)}
                                          </Badge>
                                        </div>

                                        <button
                                          aria-label="Revoke role"
                                          className="p-1 rounded-md cursor-pointer transition-all text-red-600 hover:bg-red-50 border-none bg-transparent ml-4 tooltip"
                                          data-tip="Revoke this role"
                                          onClick={() =>
                                            handleRemoveClick(
                                              entityType,
                                              role.name,
                                              resourceLabel,
                                              role.role,
                                              getRoleFriendlyName(role.role),
                                            )
                                          }
                                          title="Revoke this role"
                                        >
                                          <UserMinusIcon className="size-4" />
                                        </button>
                                      </div>
                                    )
                                  })}
                                </div>
                              ) : (
                                <p className={fieldValueUnavailableClass}>
                                  No memberships
                                </p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className={fieldValueUnavailableClass}>
                        Not a member of any group
                      </p>
                    )
                  ) : (
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-muted mb-2">
                        Tenants
                      </label>
                      {filteredGroups.length > 0 ? (
                        <div className="flex flex-col gap-2.5">
                          {filteredGroups.map((tenant, index) => (
                            <div
                              key={index}
                              className="w-fit flex items-center justify-between px-4 py-1 bg-surface-muted border border-line rounded-lg transition-all hover:bg-surface-strong"
                            >
                              <div className="flex items-center gap-5 flex-1">
                                <span className="text-sm font-medium text-gray-800">
                                  {tenant.name}
                                </span>
                                <Badge
                                  size="xs"
                                  className={
                                    roleBadgeClass[tenant.role] ??
                                    roleBadgeClass['tenant_viewer']
                                  }
                                >
                                  {getRoleFriendlyName(tenant.role)}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className={fieldValueUnavailableClass}>
                          Not a member of any tenant
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {isSuperAdmin && isViewingOtherUser && (
                <AssignRoleToUser
                  username={displayProfile?.username ?? ''}
                  email={displayProfile?.email ?? ''}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
