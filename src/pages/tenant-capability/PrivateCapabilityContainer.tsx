import { useEffect, useState } from 'react'
import { useSelectedTenant } from '@/contexts/selected-tenant'
import {
  useGetPublicNodeMetrics,
  useGetPublicNodeServiceMetrics,
} from '@/hooks/useTenants'
import type {
  MetricsQueryParams,
  MetricsEndpointMode,
} from '@/types/capability'
import CapabilitiesContent from './CapabilityContent'

const PrivateCapabilityContainer = () => {
  const {
    tenant: tenantData,
    isTenantLoading,
    tenantError,
  } = useSelectedTenant()

  const [mode, setMode] = useState<MetricsEndpointMode>('all')
  const [serviceId, setServiceId] = useState('')
  const [params, setParams] = useState<MetricsQueryParams>({})

  const nodeName = tenantData?.info.name ?? ''

  const { data: suggestionsData } = useGetPublicNodeMetrics(
    nodeName,
    {},
    !!nodeName,
  )

  const knownServices = (suggestionsData?.data ?? []).map((entry) => entry.name)

  // preselect the first available service
  useEffect(() => {
    if (mode === 'service' && !serviceId && knownServices.length > 0) {
      setServiceId(knownServices[0])
    }
  }, [mode, serviceId, knownServices])

  const {
    data: listData,
    isLoading: isListLoading,
    error: listError,
  } = useGetPublicNodeMetrics(nodeName, params, !!nodeName && mode === 'all')

  const {
    data: serviceData,
    isLoading: isServiceLoading,
    error: serviceError,
  } = useGetPublicNodeServiceMetrics(
    nodeName,
    serviceId,
    params,
    !!nodeName && mode === 'service' && !!serviceId,
  )

  if (!tenantData) {
    return null
  }

  const isServiceMode = mode === 'service'
  const activeData = isServiceMode ? serviceData : listData
  const isLoading =
    isTenantLoading || (isServiceMode ? isServiceLoading : isListLoading)
  const error = tenantError || (isServiceMode ? serviceError : listError)

  const path = isServiceMode
    ? `/v1/public/nodes/${nodeName}/capabilities/monitoring/metrics/${serviceId || '{service-id}'}`
    : `/v1/public/nodes/${nodeName}/capabilities/monitoring/metrics`

  return (
    <CapabilitiesContent
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
  )
}

export default PrivateCapabilityContainer
