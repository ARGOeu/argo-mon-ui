import { ArrowBigUp, ClockIcon, Rows4, ZapIcon } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import { useSelectedTenant } from '@/contexts/selected-tenant'
import {
  useGetTenantCapabilityAvailability,
  useGetTenantCapabilityStatus,
} from '@/hooks/useTenants'
import CapabilityCard from './CapabilityCard'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

const TenantCapabilitiesTab = () => {
  const {
    tenant: tenantData,
    isTenantLoading,
    tenantError,
  } = useSelectedTenant()

  const { data: availabilityData } = useGetTenantCapabilityAvailability(
    tenantData?.id || '',
  )
  const { data: statusData } = useGetTenantCapabilityStatus(
    tenantData?.id || '',
  )

  const availabilityStats = (() => {
    const results = availabilityData?.data?.[0]?.results ?? []
    if (results.length === 0) {
      return undefined
    }
    const values = results
      .map((result) => parseFloat(result.availability))
      .filter((value) => !isNaN(value))
    if (values.length === 0) {
      return undefined
    }
    const avg =
      Math.round(
        (values.reduce((sum, value) => sum + value, 0) / values.length) * 10,
      ) / 10
    return [{ name: 'Avg Avail', value: avg }]
  })()

  const statusStats = (() => {
    const results = statusData?.data?.[0]?.results ?? []
    if (results.length === 0) {
      return undefined
    }
    const count = (value: string) =>
      results.filter((result) => result.value === value).length
    return [
      { name: 'Operational', value: count('OK'), colorClass: 'text-green-600' },
      {
        name: 'Warning',
        value: count('WARNING'),
        colorClass: 'text-amber-500',
      },
      {
        name: 'Critical',
        value: count('CRITICAL'),
        colorClass: 'text-red-500',
      },
      {
        name: 'Unknown',
        value: count('UNKNOWN'),
        colorClass: 'text-slate-400',
      },
      { name: 'Missing', value: count('MISSING'), colorClass: 'text-blue-500' },
      {
        name: 'Downtime',
        value: count('DOWNTIME'),
        colorClass: 'text-slate-500',
      },
    ].filter((s) => s.value > 0)
  })()

  if (isTenantLoading)
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner />
      </div>
    )

  if (tenantError) return <ErrorDisplay error={tenantError} context="tenant" />

  if (!tenantData) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <CapabilityCard
        title="Availability"
        colorClass="bg-emerald-50 text-emerald-600 border border-emerald-100"
        description="Percentage of time a service is fully functional and accessible, based on monitored status history."
        uiUrl={`${tenantData.metadata?.instance?.ui_url}/${tenantData.info.name}/report-ar/CORE/SERVICEGROUPS`}
        apiUrl={`${BACKEND_API}/api/tenants/${tenantData.info.name}/results/ar`}
        apiDoc={`${BACKEND_API}/swagger-ui/#/Admin/get_v1_admin_tenants__id__status`}
        apiAccess={`${BACKEND_API}/oidc-client`}
        icon={<ClockIcon />}
        docUrl="https://argoeu.github.io/argo-monitoring/docs/reports/ar#availability"
        stats={availabilityStats}
      />

      <CapabilityCard
        title="Status"
        colorClass="bg-indigo-50 text-indigo-600 border border-indigo-100"
        description="Real-time chronological health timelines, tracking states between OK, Warning, and Critical transitions."
        uiUrl={`${tenantData.metadata?.instance?.ui_url}/${tenantData.info.name}/report-status/CORE/SERVICEGROUPS`}
        apiUrl={`${BACKEND_API}/api/tenants/${tenantData.info.name}/status`}
        apiDoc={`${BACKEND_API}/swagger-ui/#/Admin/get_v1_admin_tenants__id__status`}
        apiAccess={`${BACKEND_API}/oidc-client`}
        icon={<Rows4 />}
        docUrl="https://argoeu.github.io/argo-monitoring/docs/reports/status_timelines"
        stats={statusStats}
      />

      <CapabilityCard
        title="Uptime"
        colorClass="bg-amber-50 text-amber-600 border border-amber-100"
        description="Continuous operation score depicting service stability without registered downtime or interruptions."
        uiUrl={`${tenantData.metadata?.instance?.ui_url}/${tenantData.info.name}/report-ar/CORE/SERVICEGROUPS`}
        apiUrl={`${BACKEND_API}/api/tenants/${tenantData.info.name}/results/uptime`}
        apiDoc={`${BACKEND_API}/swagger-ui/#/Admin/get_v1_admin_tenants__id__status`}
        apiAccess={`${BACKEND_API}/oidc-client`}
        icon={<ArrowBigUp />}
        docUrl="https://argoeu.github.io/argo-monitoring/docs/reports/ar#availability"
        stats={[{ name: 'Avg Uptime', value: 99.8 }]}
      />

      <CapabilityCard
        title="Performance"
        colorClass="bg-pink-50 text-pink-600 border border-pink-100"
        description="Metric analytics for system performance monitoring, focusing on latency and response speed."
        uiUrl={`${tenantData.metadata?.instance?.ui_url}/${tenantData.info.name}/performances`}
        apiUrl={`${BACKEND_API}/api/tenants/${tenantData.info.name}/performance`}
        apiDoc={`${BACKEND_API}/swagger-ui/#/Admin/get_v1_admin_tenants__id__status`}
        apiAccess={`${BACKEND_API}/oidc-client`}
        icon={<ZapIcon />}
        docUrl="https://argoeu.github.io/argo-monitoring/docs/reports/ar#availability"
        stats={[
          { name: 'Latency (s)', value: 3.2, colorClass: 'text-amber-500' },
        ]}
      />
    </div>
  )
}

export default TenantCapabilitiesTab
