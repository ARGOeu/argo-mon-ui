import { useState, useMemo } from 'react'
import {
  useCreateRoleMutation,
  useGetRoleMetadata,
  useUpdateRoleAttributesMutation,
} from '@/hooks/useSecuredEndpoints'
import { toast } from 'sonner'
import Button from '@/components/Button'
import type { Role } from '@/types/securedEndpoints'

interface RoleFormProps {
  role?: Role
  onSuccess: () => void
}

const RoleForm = ({ role, onSuccess }: RoleFormProps) => {
  const isEditMode = !!role

  const [roleName, setRoleName] = useState('')
  const [attributeValues, setAttributeValues] = useState<
    Record<string, string>
  >({})
  const [editForm, setEditForm] = useState({
    preferred_name: role?.attributes?.preferred_name?.[0] ?? '',
    description: role?.attributes?.description?.[0] ?? '',
  })

  const { mutate: createRole, isPending: isCreatePending } =
    useCreateRoleMutation()
  const { mutate: updateAttributes, isPending: isUpdatePending } =
    useUpdateRoleAttributesMutation()
  const { data: metadataData, isLoading: isMetadataLoading } =
    useGetRoleMetadata()

  const isPending = isCreatePending || isUpdatePending

  const sortedAttributeEntries = useMemo(() => {
    if (isEditMode) return []
    const attrs = metadataData?.attributes ?? []
    return [...attrs].sort((a, b) =>
      a.required === b.required ? 0 : a.required ? -1 : 1,
    )
  }, [metadataData, isEditMode])

  const isSaveDisabled = isEditMode
    ? isPending || !editForm.preferred_name.trim()
    : !roleName.trim() ||
      isPending ||
      isMetadataLoading ||
      sortedAttributeEntries.some(
        (attr) => attr.required && !attributeValues[attr.key]?.trim(),
      )

  const handleSave = () => {
    if (isEditMode) {
      const attributes: Record<string, string[]> = {
        ...(role.attributes ?? {}),
      }
      attributes.preferred_name = [editForm.preferred_name.trim()]
      attributes.description = [editForm.description.trim()]

      updateAttributes(
        { roleId: role.id, attributes },
        {
          onSuccess: (data) => {
            toast.success(data.message || 'Role updated successfully')
            onSuccess()
          },
          onError: (err) => {
            toast.error(`Failed to update role: ${err.message}`)
          },
        },
      )
    } else {
      const name = roleName.trim()
      if (!name) return

      const attributes: Record<string, string[]> = {}
      for (const { key } of sortedAttributeEntries) {
        const value = attributeValues[key]?.trim()
        if (value) attributes[key] = [value]
      }

      createRole(
        {
          name,
          ...(Object.keys(attributes).length > 0 ? { attributes } : {}),
        },
        {
          onSuccess: () => {
            toast.success('Role created successfully')
            onSuccess()
          },
          onError: (err) => {
            toast.error(`Failed to create role: ${err.message}`)
          },
        },
      )
    }
  }

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isSaveDisabled) handleSave()
    if (e.key === 'Escape') onSuccess()
  }

  const title = isEditMode
    ? (role.attributes?.preferred_name?.[0] ?? role.name)
    : 'Add a new role'

  return (
    <div className="flex flex-col gap-1.5 px-4 py-2 border border-line rounded-lg bg-white">
      <p
        className={`font-semibold text-body truncate ${isEditMode ? 'text-sm mb-1' : 'mb-0.5'}`}
      >
        {title}
      </p>

      {isEditMode ? (
        <>
          <div className="flex flex-col gap-0.5">
            <label className="text-xs font-medium text-muted">Name</label>
            <input type="text" value={role.name} className="text-xs" disabled />
          </div>

          <div className="flex flex-col gap-0.5">
            <label className="text-xs font-medium text-muted">
              Preferred Name <span className="required">*</span>
            </label>
            <input
              autoFocus
              type="text"
              name="preferred_name"
              value={editForm.preferred_name}
              onChange={handleEditFormChange}
              onKeyDown={handleKeyDown}
              placeholder={role.name}
              className="text-xs"
              disabled={isPending}
            />
          </div>

          <div className="flex flex-col gap-0.5">
            <label className="text-xs font-medium text-muted">
              Description
            </label>
            <input
              type="text"
              name="description"
              value={editForm.description}
              onChange={handleEditFormChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter description..."
              className="text-xs"
              disabled={isPending}
            />
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-0.5">
            <label className="text-sm font-medium text-muted">
              Name <span className="required">*</span>
            </label>
            <input
              autoFocus
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
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
        </>
      )}

      <div
        className={`flex items-center justify-between mb-1 ${isEditMode ? 'mt-1.5 gap-2' : 'mt-2 gap-3'}`}
      >
        <Button
          variant="outline-secondary"
          size="xs"
          onClick={onSuccess}
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
  )
}

export default RoleForm
