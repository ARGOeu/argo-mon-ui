import { createContext } from 'react'
import type { Tenant } from '@/types/tenants'

export interface SelectedTenantContextValue {
  tenant: Tenant | undefined
  isTenantLoading: boolean
  tenantError: Error | null
  roleInSelectedTenant: string | null
  effectiveTenantId: string | null
  tenants: Tenant[]
  topologyFeedType: string | null
  topologyFeedError: Error | null
  isTopologyFeedLoading: boolean
}

export const SelectedTenantContext = createContext<
  SelectedTenantContextValue | undefined
>(undefined)
