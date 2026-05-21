import { UserCircleIcon } from '@heroicons/react/16/solid'
import { UserMinusIcon } from '@heroicons/react/24/solid'
import { Navigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../auth/useAuth'
import {
  useGetUserProfileByUsername,
  useGetTenantByName,
} from '@/hooks/useTenants'
import { useRevokeRoleMutation } from '@/hooks/useResources'
import { squishEmail } from '@/utils/profile'
import LoadingSpinner from '@/components/LoadingSpinner'
import ConfirmDialog from '@/components/ConfirmDialog'
import { toast } from 'sonner'
import ErrorDisplay from '@/components/ErrorDisplay'
import PageHeader from '@/components/PageHeader'
import Badge from '@/components/Badge'
import { roleBadgeClass } from '@/utils/badges'

const fieldValueClass = 'text-sm text-gray-800 font-medium'
const fieldValueUnavailableClass = 'text-sm text-subtle italic'

const profileGridClass = 'grid grid-cols-[200px_1fr] gap-6'

export const Profile = () => {
  const { username } = useParams<{ username: string }>()

  const { isSuperAdmin, profile } = useAuth()

  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [tenantToRemove, setTenantToRemove] = useState<{
    name: string
    role: string
  } | null>(null)

  const {
    data: userProfileData,
    isLoading,
    error,
  } = useGetUserProfileByUsername(username || '', !!username && isSuperAdmin)

  const getTenantByNameMutation = useGetTenantByName()
  const revokeRoleMutation = useRevokeRoleMutation()

  if (username && !isSuperAdmin) {
    return <Navigate to="/profile" replace />
  }

  // Determine which profile to display based on route
  const isViewingOtherUser = !!username
  const displayProfile = isViewingOtherUser ? userProfileData : null

  const handleRemoveClick = (tenantName: string, role: string) => {
    setTenantToRemove({ name: tenantName, role })
    setRemoveDialogOpen(true)
  }

  const handleRemoveConfirm = () => {
    const userId = userProfileData?.id || ''

    if (!tenantToRemove || !userId) return

    getTenantByNameMutation.mutate(tenantToRemove.name, {
      onSuccess: (tenantData) => {
        if (!tenantData || tenantData.content.length === 0) {
          toast.error('Tenant not found')
          return
        }

        const tenantId = tenantData.content[0].id || ''
        if (!tenantId) {
          toast.error('Tenant ID not found')
          return
        }

        revokeRoleMutation.mutate(
          {
            api_resource: 'Tenant',
            resource_id: tenantId,
            role: tenantToRemove.role,
            member_id: userId,
          },
          {
            onSuccess: () => {
              toast.success('Member removed successfully!')
              setRemoveDialogOpen(false)
              setTenantToRemove(null)
            },
            onError: (error) => {
              toast.error(`Failed to remove member: ${error.message}`)
            },
          },
        )
      },
      onError: (error) => {
        toast.error(`Failed to find tenant: ${error.message}`)
      },
    })
  }

  const handleRemoveCancel = () => {
    setRemoveDialogOpen(false)
    setTenantToRemove(null)
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

  const currentGroups = isViewingOtherUser
    ? displayProfile?.tenants || []
    : profile?.groups || []

  const filteredGroups = currentGroups.filter(
    (group) => group.name !== 'members',
  )

  return (
    <div className="flex flex-col justify-center items-center">
      <ConfirmDialog
        isOpen={removeDialogOpen}
        title="Remove from Tenant"
        message={
          tenantToRemove ? (
            <>
              Are you sure you want to remove this user from tenant{' '}
              <strong>{tenantToRemove.name}</strong> ?
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
      <div className="max-w-6xl w-full">
        <PageHeader
          title={isViewingOtherUser ? 'Manage User' : 'Profile'}
          subtitle={
            isViewingOtherUser
              ? 'View and manage user account'
              : 'View your account information'
          }
          className="mb-6"
          navigateTo={
            isViewingOtherUser
              ? { label: 'Back to Users', to: '/administration#users' }
              : undefined
          }
        />

        {(profile || displayProfile) && (
          <div className="bg-white border border-line rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-line">
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

            <div className="px-8 py-6">
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

              <div className="h-px bg-gray-200 my-6" />

              <div className={profileGridClass}>
                <div>
                  <h3 className="text-sm font-semibold text-body uppercase tracking-wider">
                    Tenant Memberships
                  </h3>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-muted mb-4">
                      Tenants
                    </label>
                    <div className="flex flex-col gap-4">
                      {filteredGroups && filteredGroups.length > 0 ? (
                        <div className="flex flex-col gap-3">
                          {filteredGroups.map((tenant, index) => (
                            <div
                              key={index}
                              className="w-fit flex items-center justify-between px-3 py-2 bg-surface-muted border border-line rounded-lg transition-all hover:bg-surface-strong"
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
                                  {tenant.role === 'super_admin'
                                    ? 'Super Admin'
                                    : tenant.role}
                                </Badge>
                              </div>
                              {isSuperAdmin && isViewingOtherUser && (
                                <button
                                  aria-label="Remove from tenant"
                                  className="p-1 rounded-md cursor-pointer transition-all text-red-600 hover:bg-red-50 border-none bg-transparent ml-4 tooltip"
                                  data-tip="Remove user from this tenant"
                                  onClick={() =>
                                    handleRemoveClick(tenant.name, tenant.role)
                                  }
                                  title="Remove user from this tenant"
                                >
                                  <UserMinusIcon className="size-5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className={fieldValueUnavailableClass}>
                          Not a member of any tenant
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
