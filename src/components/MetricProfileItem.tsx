import { useGetTenantMetricProfile } from '@/hooks/useTenants'
import LoadingSpinner from '@/components/LoadingSpinner'
import styles from './MetricProfileItem.module.css'

interface MetricProfileItemProps {
  tenantId: string
  profile: { id: string; name: string; type: string }
  expandedServices: Set<string>
  onToggleService: (serviceName: string) => void
  onToggleAll: (allServices: string[], expand: boolean) => void
}

const MetricProfileItem = ({
  tenantId,
  profile,
  expandedServices,
  onToggleService,
  onToggleAll,
}: MetricProfileItemProps) => {
  const { data: metricProfileData, isLoading } = useGetTenantMetricProfile(
    tenantId,
    profile.id,
    true,
  )

  const allServices =
    metricProfileData?.data?.[0]?.services?.map(
      (s: { service: string; metrics: string[] }) => s.service,
    ) || []
  const allExpanded =
    allServices.length > 0 &&
    allServices.every((s: string) => expandedServices.has(s))

  return (
    <div className={styles['metric-profile-card']}>
      <div className={styles['metric-profile-header']}>
        <h3 className={styles['metric-profile-name']}>{profile.name}</h3>
        {allServices.length > 0 && (
          <button
            className={styles['expand-all-button']}
            onClick={() => onToggleAll(allServices, !allExpanded)}
          >
            {allExpanded ? 'Collapse All' : 'Expand All'}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className={styles['metric-profile-loading']}>
          <LoadingSpinner size="sm" />
        </div>
      ) : metricProfileData?.data?.[0]?.services ? (
        <div className={styles['services-list']}>
          {metricProfileData.data[0].services.map(
            (service: { service: string; metrics: string[] }) => {
              const isExpanded = expandedServices.has(service.service)
              return (
                <div key={service.service} className={styles['service-item']}>
                  <button
                    className={styles['service-header']}
                    onClick={() => onToggleService(service.service)}
                  >
                    <span className={styles['expand-icon']}>
                      {isExpanded ? '▼' : '▶'}
                    </span>
                    <span className={styles['service-name']}>
                      {service.service}
                    </span>
                    <span className={styles['metrics-count']}>
                      ({service.metrics.length}{' '}
                      {service.metrics.length === 1 ? 'metric' : 'metrics'})
                    </span>
                  </button>
                  {isExpanded && (
                    <div className={styles['metrics-list']}>
                      {service.metrics.map((metric: string) => (
                        <div key={metric} className={styles['metric-item']}>
                          {metric}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            },
          )}
        </div>
      ) : (
        <p className={styles['no-data']}>No services available</p>
      )}
    </div>
  )
}

export default MetricProfileItem
