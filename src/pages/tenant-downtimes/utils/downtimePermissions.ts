export const MANAGE_ELIGIBLE_TOPOLOGY_TYPES = [
  'internal',
  'CSV',
  'desy-marketplace',
]

export const canViewDowntimes = (
  isSuperAdmin: boolean,
  roleInSelectedTenant: string | null,
): boolean => isSuperAdmin || roleInSelectedTenant === 'tenant_admin'

export const canManageDowntimes = (
  topologyFeedType: string | null,
  isSuperAdmin: boolean,
  roleInSelectedTenant: string | null,
): boolean => {
  if (!canViewDowntimes(isSuperAdmin, roleInSelectedTenant)) {
    return false
  }
  return (
    !!topologyFeedType &&
    MANAGE_ELIGIBLE_TOPOLOGY_TYPES.includes(topologyFeedType)
  )
}
