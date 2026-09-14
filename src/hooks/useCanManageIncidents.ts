import { useAuth } from '@/auth/useAuth'
import { useSelectedTenant } from '@/contexts/selected-tenant'

const MANAGE_INCIDENT_ROLES = ['tenant_admin', 'incident_admin']

export const useCanManageIncidents = () => {
  const { isSuperAdmin } = useAuth()
  const { roleInSelectedTenant, isTenantLoading } = useSelectedTenant()

  const isResolved = !isTenantLoading
  const canManage =
    isResolved &&
    (isSuperAdmin ||
      (roleInSelectedTenant !== null &&
        MANAGE_INCIDENT_ROLES.includes(roleInSelectedTenant)))

  return { canManage, isResolved }
}
