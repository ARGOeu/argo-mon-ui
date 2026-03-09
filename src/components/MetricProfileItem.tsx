import { useGetTenantMetricProfile } from '@/hooks/useTenants'
import LoadingSpinner from '@/components/LoadingSpinner'

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
    <div className="bg-white border border-line rounded-lg p-4">
      <div className="flex justify-between items-center mb-3 gap-4 flex-wrap">
        <h3 className="text-base font-semibold text-foreground m-0">
          {profile.name}
        </h3>
        {allServices.length > 0 && (
          <button
            className="px-3 py-1.5 text-sm font-medium text-blue-500 bg-brand-subtle border border-blue-200 rounded-md cursor-pointer transition-colors hover:bg-brand-muted hover:border-blue-300"
            onClick={() => onToggleAll(allServices, !allExpanded)}
          >
            {allExpanded ? 'Collapse All' : 'Expand All'}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <LoadingSpinner size="sm" />
        </div>
      ) : metricProfileData?.data?.[0]?.services ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 items-start">
          {metricProfileData.data[0].services.map(
            (service: { service: string; metrics: string[] }) => {
              const isExpanded = expandedServices.has(service.service)
              return (
                <div
                  key={service.service}
                  className="border border-line rounded-md overflow-hidden"
                >
                  <button
                    className="w-full flex items-center flex-wrap gap-2 px-3 py-2.5 bg-surface-subtle border-none cursor-pointer text-left transition-colors hover:bg-gray-100"
                    onClick={() => onToggleService(service.service)}
                  >
                    <span className="text-[0.625rem] text-muted leading-none shrink-0">
                      {isExpanded ? '▼' : '▶'}
                    </span>
                    <span className="text-sm font-semibold text-body flex-1 break-all">
                      {service.service}
                    </span>
                    <span className="text-xs text-muted font-normal">
                      ({service.metrics.length}{' '}
                      {service.metrics.length === 1 ? 'metric' : 'metrics'})
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="bg-white p-2 flex flex-col gap-1.5">
                      {service.metrics.map((metric: string) => (
                        <div
                          key={metric}
                          className="px-2.5 py-1.5 text-sm text-muted bg-surface-muted rounded border-l-[3px] border-line-strong"
                        >
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
        <p className="text-subtle italic text-center">No services available</p>
      )}
    </div>
  )
}

export default MetricProfileItem
