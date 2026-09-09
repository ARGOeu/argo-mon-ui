import { useState } from 'react'
import { Info } from 'lucide-react'
import {
  useGetPublicTenantReports,
  useGetPublicNodeMetrics,
  useGetPublicNodeServiceMetrics,
} from '@/hooks/useTenants'
import { useTenantName } from '@/hooks/useTenantName'
import type {
  MetricsQueryParams,
  MetricsEndpointMode,
} from '@/types/capability'
import PageHeader from '@/components/PageHeader'
import type { CapabilityNavItems } from '../tenant-capability/CapabilityNav'
import CapabilityNav from '../tenant-capability/CapabilityNav'
import CapabilityContent from '../tenant-capability/CapabilityContent'

const PublicCapabilityContainer = () => {
  const { tenantName } = useTenantName()

  const [selectedView, setSelectedView] =
    useState<CapabilityNavItems>('metrics')
  const [mode, setMode] = useState<MetricsEndpointMode>('all')
  const [serviceId, setServiceId] = useState('')
  const [params, setParams] = useState<MetricsQueryParams>({})

  const {
    data: reports,
    isLoading: reportsLoading,
    error: reportsError,
  } = useGetPublicTenantReports(tenantName ?? '', true)

  const nodeReport = reports?.find((r) => r.node === true)
  const capEnabled = !!nodeReport

  const { data: suggestionsData } = useGetPublicNodeMetrics(
    tenantName ?? '',
    {},
    !!tenantName && capEnabled,
  )
  const knownServices = (suggestionsData?.data ?? []).map((entry) => entry.name)

  const {
    data: listData,
    isLoading: isListLoading,
    error: listError,
  } = useGetPublicNodeMetrics(
    tenantName ?? '',
    params,
    !!tenantName && capEnabled && mode === 'all',
  )

  const {
    data: serviceData,
    isLoading: isServiceLoading,
    error: serviceError,
  } = useGetPublicNodeServiceMetrics(
    tenantName ?? '',
    serviceId,
    params,
    !!tenantName && capEnabled && mode === 'service' && !!serviceId,
  )

  const isServiceMode = mode === 'service'
  const activeData = isServiceMode ? serviceData : listData
  const isLoading =
    reportsLoading || (isServiceMode ? isServiceLoading : isListLoading)
  const error = reportsError || (isServiceMode ? serviceError : listError)

  const path = isServiceMode
    ? `/v1/public/nodes/${tenantName}/capabilities/monitoring/metrics/${serviceId || '{service-id}'}`
    : `/v1/public/nodes/${tenantName}/capabilities/monitoring/metrics`

  return (
    <div className="page-container">
      <PageHeader
        title="Capability"
        subtitle={
          <>
            Explore monitoring federated capability for tenant{' '}
            <strong>{tenantName ?? '...'}</strong>
          </>
        }
        className="pb-2 mb-2"
      />

      {!reportsLoading && !nodeReport ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white px-12 py-4 mt-6 text-center shadow-sm">
          <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-brand-subtle">
            <Info className="h-6 w-6 text-brand" />
          </div>
          <h3 className="mb-1 text-lg font-medium text-neutral-900">
            Capability data Not Available
          </h3>
          <p className="max-w-sm text-sm text-neutral-500">
            This tenant does not have capability data available publicly.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
          <aside className="w-full shrink-0 lg:w-72">
            <CapabilityNav
              selected={selectedView}
              onSelect={setSelectedView}
              capEnabled={capEnabled}
              showNodeConfig={false}
            />
          </aside>

          <div className="min-w-0 flex-1">
            {selectedView === 'metrics' && (
              <CapabilityContent
                mode={mode}
                onModeChange={setMode}
                knownServices={knownServices}
                serviceId={serviceId}
                onServiceIdChange={setServiceId}
                params={params}
                onParamsChange={setParams}
                data={activeData}
                isLoading={isLoading}
                error={(error as Error) || null}
                endpointPath={path}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PublicCapabilityContainer
