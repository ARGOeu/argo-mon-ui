import { useTenantName } from '@/hooks/useTenantName'
import { useGetPerformanceSettings } from '@/hooks/useSettings'
import PerformanceEmbed from '@/components/PerformanceEmbed'

const PublicPerformanceContainer = () => {
  const { tenantName, loading: tenantLoading } = useTenantName()

  const {
    data: setting,
    isLoading: settingsLoading,
    error: settingsError,
  } = useGetPerformanceSettings()

  return (
    <PerformanceEmbed
      tenantName={tenantName ?? ''}
      isTenantLoading={tenantLoading}
      tenantError={null}
      performanceSetting={setting}
      isSettingsLoading={settingsLoading}
      settingsError={settingsError}
    />
  )
}

export default PublicPerformanceContainer
