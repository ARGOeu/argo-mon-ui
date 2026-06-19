import { useState, useMemo } from 'react'
import {
  useCreateRoleMutation,
  useGetRoleMetadata,
} from '@/hooks/useSecuredEndpoints'
import { PlusIcon } from '@heroicons/react/20/solid'
import { toast } from 'sonner'
import Button from '@/components/Button'
import ErrorDisplay from '@/components/ErrorDisplay'
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
  const [attributeValues, setAttributeValues] = useState<
    Record<string, string>
  >({})

  const { mutate: createRole, isPending } = useCreateRoleMutation()
  const { data: metadataData, isLoading: isMetadataLoading } =
    useGetRoleMetadata()

  const sortedAttributeEntries = useMemo(() => {
    const attrs = metadataData?.attributes ?? []
    return [...attrs].sort((a, b) =>
      a.required === b.required ? 0 : a.required ? -1 : 1,
    )
  }, [metadataData])

  const isSaveDisabled =
    !newRoleName.trim() ||
    isPending ||
    isMetadataLoading ||
    sortedAttributeEntries.some(
      (attr) => attr.required && !attributeValues[attr.key]?.trim(),
    )

  const handleSave = () => {
    const name = newRoleName.trim()
    if (!name) return

    const attributes: Record<string, string[]> = {}
    for (const { key } of sortedAttributeEntries) {
      const value = attributeValues[key]?.trim()
      if (value) {
        attributes[key] = [value]
      }
    }

    createRole(
      {
        name,
        ...(Object.keys(attributes).length > 0 ? { attributes } : {}),
      },
      {
        onSuccess: () => {
          setNewRoleName('')
          setAttributeValues({})
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
    setAttributeValues({})
    setIsAdding(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isSaveDisabled) handleSave()
    if (e.key === 'Escape') handleCancel()
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
              <div className="flex flex-col gap-1.5 px-4 py-2 border border-line rounded-lg bg-white">
                <p className="font-medium text-body mb-0.5">Add a new role</p>

                <div className="flex flex-col gap-0.5">
                  <label className="text-sm font-medium text-muted">
                    Name <span className="required">*</span>
                  </label>
                  <input
                    autoFocus
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter role name"
                    className="text-xs"
                    disabled={isPending}
                  />
                </div>

                {sortedAttributeEntries.map((attr) => (
                  <div key={attr.key} className="flex flex-col gap-0.5">
                    <label className="text-sm font-medium text-muted">
                      {attr.label}
                      {attr.required && <span className="required"> *</span>}
                    </label>
                    <input
                      type="text"
                      value={attributeValues[attr.key] ?? ''}
                      onChange={(e) =>
                        setAttributeValues((prev) => ({
                          ...prev,
                          [attr.key]: e.target.value,
                        }))
                      }
                      onKeyDown={handleKeyDown}
                      placeholder={`Enter ${attr.label.toLowerCase()}`}
                      className="text-xs"
                      disabled={isPending}
                    />
                  </div>
                ))}

                <div className="flex items-center justify-between gap-3 mt-2 mb-1">
                  <Button
                    variant="outline-secondary"
                    size="xs"
                    onClick={handleCancel}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="xs"
                    onClick={handleSave}
                    disabled={isSaveDisabled}
                  >
                    {isPending ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
              <hr className="border-line my-1" />
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-1 text-sm text-brand font-medium hover:text-brand-strong transition-colors cursor-pointer"
            >
              <PlusIcon className="size-4" />
              Add Role
            </button>
          )}

          {roles.map((role) => {
            const isSelected = selectedRoleId === role.id
            const count = actionCounts[role.id] ?? 0
            const displayName =
              role.attributes?.preferred_name?.[0] ?? role.name
            const description = role.attributes?.description?.[0]
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => onSelectRole(role.id)}
                className={`w-full flex items-center justify-between gap-2 px-4 py-2 text-left cursor-pointer transition-all border rounded-lg ${
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
                      className="text-xs text-subtle truncate"
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
