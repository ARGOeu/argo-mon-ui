import { useState, useMemo, useEffect } from 'react'
import {
  useGetSecuredEndpoints,
  useGetRoles,
  useGetRoleAssignedEndpoints,
  useGetAssignedEndpoints,
  useAssignEndpointsToRoleMutation,
} from '@/hooks/useSecuredEndpoints'
import { useRoleActionsManager } from './hooks/useRoleActionsManager'
import { toast } from 'sonner'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import ConfirmDialog from '@/components/ConfirmDialog'
import RoleListPanel from './RoleListPanel'
import RoleDetailsPanel from './RoleDetailsPanel'

const EndpointsAccess = () => {
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [pendingRoleId, setPendingRoleId] = useState<string | null>(null)

  useEffect(() => {
    const main = document.querySelector('main')
    if (!main) return

    const apply = () => {
      main.style.overflowY = window.innerWidth >= 1024 ? 'scroll' : ''
    }

    apply()
    window.addEventListener('resize', apply)
    return () => {
      window.removeEventListener('resize', apply)
      main.style.overflowY = ''
    }
  }, [])

  const {
    data: rolesData,
    isLoading: isRolesLoading,
    error: rolesError,
  } = useGetRoles(1, 100)

  const {
    data: endpointsPagesData,
    isLoading: isEndpointsLoading,
    error: endpointsError,
    fetchNextPage: fetchNextEndpointsPage,
    hasNextPage: hasNextEndpointsPage,
  } = useGetSecuredEndpoints()

  useEffect(() => {
    if (hasNextEndpointsPage) {
      fetchNextEndpointsPage()
    }
  }, [endpointsPagesData, hasNextEndpointsPage, fetchNextEndpointsPage])

  const endpointsList = useMemo(() => {
    return (
      endpointsPagesData?.pages?.flatMap((page) => page.content || []) || []
    )
  }, [endpointsPagesData])

  const { data: roleAssignmentsData, isLoading: isRoleActionsLoading } =
    useGetRoleAssignedEndpoints(selectedRoleId)

  const { data: allAssignmentsData } = useGetAssignedEndpoints()

  const { mutate: saveRoleActions, isPending: isMutating } =
    useAssignEndpointsToRoleMutation()

  const roleAssignments = useMemo(
    () => roleAssignmentsData?.assignments?.[0]?.secured_endpoints ?? [],
    [roleAssignmentsData],
  )

  const {
    selectedAssignments,
    toggleAction,
    setScope,
    isDirty,
    addedCount,
    removedCount,
  } = useRoleActionsManager(roleAssignments)

  const actionCounts = useMemo(() => {
    const saved = Object.fromEntries(
      (allAssignmentsData?.assignments ?? []).map((a) => [
        a.role_id,
        a.secured_endpoints?.length ?? 0,
      ]),
    )
    return {
      ...saved,
      ...(selectedRoleId && isDirty
        ? { [selectedRoleId]: selectedAssignments.length }
        : {}),
    }
  }, [allAssignmentsData, selectedRoleId, selectedAssignments, isDirty])

  const roles = useMemo(() => rolesData?.content ?? [], [rolesData])

  useEffect(() => {
    if (!selectedRoleId && roles.length > 0) {
      setSelectedRoleId(roles[0].id)
    }
  }, [selectedRoleId, roles])

  const selectedRole = useMemo(
    () => roles.find((r) => r.id === selectedRoleId) ?? null,
    [selectedRoleId, roles],
  )

  const isLoading = isRolesLoading || isEndpointsLoading

  const handleSelectRole = (roleId: string) => {
    if (isDirty) {
      setPendingRoleId(roleId)
    } else {
      setSelectedRoleId(roleId)
    }
  }

  const handleConfirmRoleSwitch = () => {
    setSelectedRoleId(pendingRoleId)
    setPendingRoleId(null)
  }

  const handleCancelRoleSwitch = () => {
    setPendingRoleId(null)
  }

  const handleSubmitActions = () => {
    if (!selectedRoleId || !selectedRole) return

    saveRoleActions(
      {
        roleId: selectedRoleId,
        data: { secured_endpoint_assignments: selectedAssignments },
      },
      {
        onSuccess: () => {
          toast.success('Role actions saved successfully')
        },
        onError: (err) => {
          toast.error(`Failed to save role actions: ${err.message}`)
        },
      },
    )
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Endpoints Access"
        subtitle="Manage authorization rules and access actions for roles"
        className="mb-4"
      />

      <ConfirmDialog
        isOpen={!!pendingRoleId}
        title="Unsaved Changes"
        message="You have unsaved changes. Switching roles will discard them. Are you sure?"
        confirmLabel="Discard changes"
        cancelLabel="Cancel"
        onConfirm={handleConfirmRoleSwitch}
        onCancel={handleCancelRoleSwitch}
      />

      {isLoading ? (
        <div className="loading-container">
          <LoadingSpinner size="md" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-x-8 items-start pb-10">
          <div className="lg:sticky lg:top-4 bg-surface-muted rounded-lg p-4 mb-6 lg:mb-0">
            <RoleListPanel
              roles={roles}
              selectedRoleId={selectedRoleId}
              onSelectRole={handleSelectRole}
              actionCounts={actionCounts}
              error={rolesError}
            />
          </div>

          <div className="min-w-0">
            {selectedRole ? (
              <RoleDetailsPanel
                key={selectedRoleId}
                roleName={selectedRole.name}
                endpointsList={endpointsList}
                selectedAssignments={selectedAssignments}
                onToggleAction={toggleAction}
                onSetScope={setScope}
                onSubmit={handleSubmitActions}
                isMutating={isMutating}
                isDirty={isDirty}
                addedCount={addedCount}
                removedCount={removedCount}
                isLoadingActions={isRoleActionsLoading}
                error={endpointsError}
              />
            ) : (
              <div className="flex items-center justify-center py-6 rounded-xl border border-line bg-surface-muted">
                <p className="text-sm text-subtle italic">
                  Select a role to manage its permissions
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default EndpointsAccess
