import { useSelectedTenant } from '@/contexts/selected-tenant/useSelectedTenant'
import { useGetPerformanceSettings } from '@/hooks/useSettings'
import PerformanceEmbed from '@/components/PerformanceEmbed'

const TenantPerformance = () => {
  const { tenant, isTenantLoading, tenantError } = useSelectedTenant()
  const tenantName = tenant?.info?.name ?? ''

  const {
    data: setting,
    isLoading: settingsLoading,
    error: settingsError,
  } = useGetPerformanceSettings()

  return (
    <PerformanceEmbed
      tenantName={tenantName}
      isTenantLoading={isTenantLoading}
      tenantError={tenantError}
      performanceSetting={setting}
      isSettingsLoading={settingsLoading}
      settingsError={settingsError}
    />
  )
}

export default TenantPerformance
