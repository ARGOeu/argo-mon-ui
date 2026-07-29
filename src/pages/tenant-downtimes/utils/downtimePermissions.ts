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
  return !!topologyFeedType && topologyFeedType !== 'external'
}
