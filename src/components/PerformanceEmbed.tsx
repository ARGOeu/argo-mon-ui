import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import type { Setting } from '@/types/settings'

const noticeContainerClass = 'text-center bg-surface-muted rounded-lg'
const noticeTextClass = 'text-sm text-subtle italic py-6 px-12'
const BASE_URL_FIELD = 'base.url'

interface PerformanceEmbedProps {
  tenantName: string
  isTenantLoading: boolean
  tenantError?: Error | null
  performanceSetting: Setting | undefined
  isSettingsLoading: boolean
  settingsError: Error | null
}

const PerformanceEmbed = ({
  tenantName,
  isTenantLoading,
  tenantError,
  performanceSetting,
  isSettingsLoading,
  settingsError,
}: PerformanceEmbedProps) => {
  const isLoading = isTenantLoading || isSettingsLoading
  const error = tenantError || settingsError

  const grafanaBaseUrl = performanceSetting?.data.config?.[BASE_URL_FIELD] as
    | string
    | undefined

  const isPerformanceEnabled = performanceSetting?.enabled ?? false

  const iframeSrc =
    grafanaBaseUrl && tenantName
      ? `${grafanaBaseUrl.replace(/\/+$/, '')}/${encodeURIComponent(tenantName)}?kiosk`
      : null

  return (
    <div className="page-container">
      <PageHeader
        title="Performance"
        subtitle={
          tenantName ? `Grafana dashboard for ${tenantName}` : undefined
        }
        className="mb-3"
      />

      {isLoading ? (
        <div className="loading-container">
          <LoadingSpinner size="md" />
        </div>
      ) : error ? (
        <ErrorDisplay error={error} context="performance dashboard" />
      ) : !tenantName ? (
        <ErrorDisplay
          error="Tenant could not be resolved"
          context="performance dashboard"
        />
      ) : !grafanaBaseUrl ? (
        <div className={noticeContainerClass}>
          <p className={noticeTextClass}>
            The Grafana base URL has not been configured yet
          </p>
        </div>
      ) : !isPerformanceEnabled ? (
        <div className={noticeContainerClass}>
          <p className={noticeTextClass}>
            Performance monitoring setting is currently disabled
          </p>
        </div>
      ) : (
        <iframe
          src={iframeSrc ?? undefined}
          title={`Grafana dashboard for ${tenantName}`}
          className="w-full h-[calc(100vh-160px)] border-0 rounded-lg"
        />
      )}
    </div>
  )
}

export default PerformanceEmbed
