import { useState } from 'react'
import {
  useAssignRoleMutation,
  useGetApiResources,
  useGetAssignRoleMetadata,
} from '@/hooks/useResources'
import { useGetRoles } from '@/hooks/useSecuredEndpoints'
import { useSelectedTenant } from '@/contexts/selected-tenant/useSelectedTenant'
import { TENANT_MEMBERSHIP_ENTITY } from '@/utils/memberships'
import {
  tenantMapper,
  mapAssignmentAttributes,
} from '@/utils/roleAssignmentMapper'
import { toast } from 'sonner'
import SelectDropdown from '@/components/SelectDropdown'
import Button from '@/components/Button'

interface AssignRoleToUserProps {
  username: string
  email: string
}

const AssignRoleToUser = ({ username, email }: AssignRoleToUserProps) => {
  const [assignForm, setAssignForm] = useState({
    role: '',
    apiResource: '',
    resourceId: '',
  })

  const assignRoleMutation = useAssignRoleMutation()
  const { data: rolesData } = useGetRoles(1, 100)
  const { data: apiResourcesData } = useGetApiResources(1, 100)
  const { data: assignRoleMetadata } = useGetAssignRoleMetadata()
  const { tenants } = useSelectedTenant()

  const roleOptions =
    rolesData?.content.map((r) => ({
      label: r.attributes?.preferred_name?.[0] ?? r.name,
      value: r.name,
    })) ?? []

  const apiResourceOptions = [
    { label: 'None', value: '' },
    ...(apiResourcesData?.content.map((r) => ({
      label: r.resourceName,
      value: r.resourceName,
    })) ?? []),
  ]

  const tenantOptions = tenants.map((t) => ({
    label: t.info.name,
    value: t.id ?? '',
  }))

  const handleAssignSubmit = () => {
    if (!username) return

    const selectedRole = rolesData?.content.find(
      (r) => r.name === assignForm.role,
    )
    const selectedTenant = tenants.find((t) => t.id === assignForm.resourceId)
    const metadataKeys =
      assignRoleMetadata?.resources?.[assignForm.apiResource]?.map(
        (a) => a.key,
      ) ?? []

    const attributes = mapAssignmentAttributes({
      keys: metadataKeys,
      values: {
        [tenantMapper.preferred_role_name]:
          selectedRole?.attributes?.preferred_name?.[0],
        [tenantMapper.role_description]:
          selectedRole?.attributes?.description?.[0],
        [tenantMapper.tenant_name]: selectedTenant?.info.name,
      },
      resourceType: assignForm.apiResource || undefined,
    })

    assignRoleMutation.mutate(
      {
        role: assignForm.role,
        username,
        api_resource: assignForm.apiResource || undefined,
        resource_id: assignForm.resourceId || undefined,
        extras: {
          email,
          voperson_id: username,
        },
        attributes,
      },
      {
        onSuccess: (message) => {
          if (message && message.trim() !== '') {
            toast.success(message)
          }
          setAssignForm({ role: '', apiResource: '', resourceId: '' })
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to assign role')
        },
      },
    )
  }

  return (
    <>
      <div className="h-px bg-gray-200 my-5" />

      <div className="grid grid-cols-[200px_1fr] gap-6">
        <div>
          <h3 className="text-sm font-semibold text-body uppercase tracking-wider">
            Assign Role
          </h3>
        </div>
        <div className="flex flex-col gap-2 max-w-sm">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-body mb-0.5">Role</label>
            <SelectDropdown
              value={assignForm.role}
              onChange={(value) =>
                setAssignForm((prev) => ({ ...prev, role: value }))
              }
              options={roleOptions}
              placeholder="Select a role..."
              disabled={roleOptions.length === 0}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-body mb-0.5">
              Resource Type
            </label>
            <SelectDropdown
              value={assignForm.apiResource}
              onChange={(value) =>
                setAssignForm((prev) => ({
                  ...prev,
                  apiResource: value,
                  resourceId: '',
                }))
              }
              options={apiResourceOptions}
              placeholder="Select a resource type (optional)..."
              disabled={apiResourceOptions.length === 0}
            />
          </div>

          {assignForm.apiResource && (
            <div className="flex flex-col">
              <label className="text-sm font-medium text-body mb-0.5">
                Resource Identifier
              </label>
              {assignForm.apiResource === TENANT_MEMBERSHIP_ENTITY ? (
                <SelectDropdown
                  value={assignForm.resourceId}
                  onChange={(value) =>
                    setAssignForm((prev) => ({ ...prev, resourceId: value }))
                  }
                  options={tenantOptions}
                  placeholder="Select a tenant..."
                  searchable
                />
              ) : (
                <input
                  type="text"
                  value={assignForm.resourceId}
                  onChange={(e) =>
                    setAssignForm((prev) => ({
                      ...prev,
                      resourceId: e.target.value,
                    }))
                  }
                  placeholder="Enter resource ID..."
                />
              )}
            </div>
          )}

          <div className="flex justify-end mt-2">
            <Button
              variant="primary"
              size="md"
              onClick={handleAssignSubmit}
              disabled={
                !assignForm.role ||
                assignRoleMutation.isPending ||
                (!!assignForm.apiResource && !assignForm.resourceId)
              }
            >
              {assignRoleMutation.isPending ? 'Assigning...' : 'Assign Role'}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default AssignRoleToUser
