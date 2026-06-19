import { TENANT_MEMBERSHIP_ENTITY } from '@/utils/memberships'

export const ATTRIBUTE_MAPPERS = {
  [TENANT_MEMBERSHIP_ENTITY]: {
    preferred_role_name: 'preferred_role_name',
    role_description: 'role_description',
    tenant_name: 'tenant_name',
  },
} as const

export const tenantMapper = ATTRIBUTE_MAPPERS[TENANT_MEMBERSHIP_ENTITY]

export const mapAssignmentAttributes = ({
  keys,
  values,
  resourceType,
}: {
  keys: string[]
  values: Record<string, string | undefined>
  resourceType?: string
}): Record<string, string[]> | undefined => {
  if (!resourceType) return undefined

  const result: Record<string, string[]> = {}
  for (const key of keys) {
    const value = values[key]
    if (value) {
      result[key] = [value]
    }
  }
  return Object.keys(result).length > 0 ? result : undefined
}
