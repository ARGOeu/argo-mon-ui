import { useAuth } from '@/auth/useAuth'
import { useSelectedTenant } from '@/contexts/selected-tenant'
import { canManageDowntimes } from './utils/downtimePermissions'

export const useCanManageDowntimes = () => {
  const { isSuperAdmin } = useAuth()
  const {
    roleInSelectedTenant,
    topologyFeedType,
    isTenantLoading,
    isTopologyFeedLoading,
  } = useSelectedTenant()

  const isResolved = !isTenantLoading && !isTopologyFeedLoading
  const canManage =
    isResolved &&
    canManageDowntimes(topologyFeedType, isSuperAdmin, roleInSelectedTenant)

  return { canManage, isResolved }
}
