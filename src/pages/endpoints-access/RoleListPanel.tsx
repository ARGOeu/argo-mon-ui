import { useState } from 'react'
import { PlusIcon } from '@heroicons/react/20/solid'
import { PencilSquareIcon } from '@heroicons/react/16/solid'
import ErrorDisplay from '@/components/ErrorDisplay'
import IconButton from '@/components/IconButton'
import RoleForm from './RoleForm'
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
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null)

  const handleStartAdding = () => {
    setEditingRoleId(null)
    setIsAdding(true)
  }

  const handleEditClick = (role: Role) => {
    setIsAdding(false)
    setEditingRoleId(role.id)
  }

  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="text-base font-semibold text-foreground">
        Select a role to manage its actions
      </h3>

      {error ? (
        <ErrorDisplay error={error} context="roles" />
      ) : (
        <>
          {isAdding ? (
            <>
              <RoleForm onSuccess={() => setIsAdding(false)} />
              <hr className="border-line my-1" />
            </>
          ) : (
            <button
              type="button"
              onClick={handleStartAdding}
              className="flex items-center gap-1 text-sm text-brand font-medium hover:text-brand-strong transition-colors cursor-pointer"
            >
              <PlusIcon className="size-4" />
              Add Role
            </button>
          )}

          {roles.map((role) => {
            const isSelected = selectedRoleId === role.id
            const isEditing = editingRoleId === role.id
            const count = actionCounts[role.id] ?? 0
            const displayName =
              role.attributes?.preferred_name?.[0] ?? role.name
            const description = role.attributes?.description?.[0]

            if (isEditing) {
              return (
                <RoleForm
                  key={role.id}
                  role={role}
                  onSuccess={() => setEditingRoleId(null)}
                />
              )
            }

            return (
              <div key={role.id} className="flex items-center gap-1.5 min-w-0">
                <button
                  type="button"
                  onClick={() => onSelectRole(role.id)}
                  className={`flex-1 min-w-0 flex items-center justify-between gap-2 px-4 py-2 text-left cursor-pointer transition-all border rounded-lg ${
                    isSelected
                      ? 'bg-brand-subtle border-brand ring-1 ring-brand-strong shadow-sm'
                      : 'bg-white border-line hover:border-brand-muted hover:shadow-sm'
                  }`}
                >
                  <div className="flex flex-col min-w-0 flex-1">
                    <span
                      className={`font-semibold text-sm ${
                        isSelected ? 'text-brand-strong' : 'text-foreground'
                      }`}
                    >
                      {displayName}
                    </span>
                    {description && (
                      <span
                        className="text-xs text-subtle line-clamp-2"
                        title={description}
                      >
                        {description}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-surface-strong text-muted border border-line shrink-0">
                    {count}
                  </span>
                </button>
                <IconButton
                  icon={<PencilSquareIcon className="size-4" />}
                  label="Edit role attributes"
                  onClick={() => handleEditClick(role)}
                  className="text-muted shrink-0 !p-0"
                />
              </div>
            )
          })}

          {roles.length === 0 && !isAdding && (
            <div className="text-center bg-surface-muted py-4 text-sm text-subtle">
              No roles found
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default RoleListPanel
