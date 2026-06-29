import { useSelectedTenant } from '@/contexts/selected-tenant'
import {
  useGetTenantCapabilityAvailability,
  useGetTenantCapabilityStatus,
} from '@/hooks/useTenants'
import {
  computeAvailabilityStats,
  computeStatusStats,
} from '@/utils/capabilityStats'
import CapabilitiesContent from './CapabilitiesContent'

const PrivateCapabilitiesContainer = () => {
  const {
    tenant: tenantData,
    isTenantLoading,
    tenantError,
  } = useSelectedTenant()

  const {
    data: availabilityData,
    isLoading: isAvailabilityLoading,
    error: availabilityError,
  } = useGetTenantCapabilityAvailability(tenantData?.id || '')

  const {
    data: statusData,
    isLoading: isStatusLoading,
    error: statusError,
  } = useGetTenantCapabilityStatus(tenantData?.id || '')

  const availabilityStats = computeAvailabilityStats(
    availabilityData?.data?.[0]?.results ?? [],
  )

  const { statusStats, statusCounts } = computeStatusStats(
    statusData?.data?.[0]?.results ?? [],
  )

  if (!tenantData) {
    return null
  }

  return (
    <CapabilitiesContent
      tenantName={tenantData.info.name}
      availabilityStats={availabilityStats}
      statusStats={statusStats}
      statusCounts={statusCounts}
      isLoading={isTenantLoading || isAvailabilityLoading || isStatusLoading}
      error={tenantError || availabilityError || statusError}
    />
  )
}

export default PrivateCapabilitiesContainer
