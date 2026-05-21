import { useState } from 'react'
import { PlusIcon } from '@heroicons/react/20/solid'
import { useCreateRoleMutation } from '@/hooks/useSecuredEndpoints'
import Button from '@/components/Button'
import ErrorDisplay from '@/components/ErrorDisplay'
import { toast } from 'sonner'
import type { Role } from '@/types/securedEndpoints'

interface RoleListPanelProps {
  roles: Role[]
  selectedRoleId: string | null
  onSelectRole: (roleId: string) => void
  actionCounts: Record<string, number>
  error?: Error | null
}

const RoleListPanel = ({
  roles,
  selectedRoleId,
  onSelectRole,
  actionCounts,
  error,
}: RoleListPanelProps) => {
  const [isAdding, setIsAdding] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')

  const { mutate: createRole, isPending } = useCreateRoleMutation()

  const handleSave = () => {
    const name = newRoleName.trim()
    if (!name) return
    createRole(
      { name },
      {
        onSuccess: () => {
          setNewRoleName('')
          setIsAdding(false)
          toast.success('Role created successfully')
        },
        onError: (err) => {
          toast.error(`Failed to create role: ${err.message}`)
        },
      },
    )
  }

  const handleCancel = () => {
    setNewRoleName('')
    setIsAdding(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') handleCancel()
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-base font-semibold text-foreground mb-1">
        Select a role to manage its actions
      </h3>

      {error ? (
        <ErrorDisplay error={error} context="roles" />
      ) : (
        <>
          {roles.map((role) => {
            const isSelected = selectedRoleId === role.id
            const count = actionCounts[role.id] ?? 0
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => onSelectRole(role.id)}
                className={`w-full flex items-center justify-between gap-2 px-4 py-3 text-left cursor-pointer transition-all border rounded-lg ${
                  isSelected
                    ? 'bg-brand-subtle border-brand ring-1 ring-brand-strong shadow-sm'
                    : 'bg-white border-line hover:border-brand-muted hover:shadow-sm'
                }`}
              >
                <span
                  className={`font-semibold text-base ${
                    isSelected ? 'text-brand-strong' : 'text-foreground'
                  }`}
                >
                  {role.name}
                </span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-surface-strong text-muted border border-line shrink-0">
                  {count}
                </span>
              </button>
            )
          })}

          {roles.length === 0 && !isAdding && (
            <div className="text-center bg-surface-muted py-4 text-sm text-subtle">
              No roles found
            </div>
          )}

          {isAdding ? (
            <div className="flex flex-col gap-1 mt-1 pt-2 border-t border-line">
              <label className="text-sm font-medium text-body">
                Add a new role
              </label>
              <input
                autoFocus
                type="text"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Role name"
                className="text-sm py-1.5"
                disabled={isPending}
              />
              <div className="flex gap-3 mt-1">
                <Button
                  variant="primary"
                  size="xs"
                  onClick={handleSave}
                  disabled={!newRoleName.trim() || isPending}
                >
                  {isPending ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  variant="outline-secondary"
                  size="xs"
                  onClick={handleCancel}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-1 text-sm text-brand font-medium hover:text-brand-strong transition-colors mt-1 cursor-pointer"
            >
              <PlusIcon className="size-4" />
              Add Role
            </button>
          )}
        </>
      )}
    </div>
  )
}

export default RoleListPanel
