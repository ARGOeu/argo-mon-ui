import { ClockIcon, Rows4 } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import { useSelectedTenant } from '@/contexts/selected-tenant'
import {
  useGetTenantCapabilityAvailability,
  useGetTenantCapabilityStatus,
} from '@/hooks/useTenants'
import CapabilityCard from './CapabilityCard'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

const statusConfig = [
  { status: 'CRITICAL', colorClass: 'text-red-500', label: 'Critical' },
  { status: 'DOWNTIME', colorClass: 'text-slate-500', label: 'Downtime' },
  { status: 'WARNING', colorClass: 'text-yellow-500', label: 'Warning' },
  { status: 'UNKNOWN', colorClass: 'text-slate-400', label: 'Unknown' },
  { status: 'MISSING', colorClass: 'text-blue-500', label: 'Missing' },
  { status: 'OK', colorClass: 'text-green-600', label: 'OK' },
]

const statusDisplayOrder = [
  'OK',
  'CRITICAL',
  'WARNING',
  'MISSING',
  'DOWNTIME',
  'UNKNOWN',
]

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

  const { statusStats, statusDetails } = (() => {
    const results = statusData?.data?.[0]?.results ?? []
    if (results.length === 0) {
      return { statusStats: undefined, statusDetails: null }
    }

    const count = (status: string) =>
      results.filter((r) => r.value === status).length

    const counts = statusConfig
      .map((p) => ({ ...p, count: count(p.status) }))
      .filter((c) => c.count > 0)

    if (counts.length === 0) {
      return { statusStats: undefined, statusDetails: null }
    }

    const top = counts[0]

    const statusStats = [
      { name: 'Current State', value: top.label, colorClass: top.colorClass },
    ]

    const statusDetails = (
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {[...counts]
          .sort(
            (a, b) =>
              statusDisplayOrder.indexOf(a.status) -
              statusDisplayOrder.indexOf(b.status),
          )
          .map((c) => (
            <div key={c.label} className="flex items-center gap-1">
              <span className={`font-semibold text-xs ${c.colorClass}`}>
                {c.label}
              </span>
              <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded-full leading-none">
                {c.count}
              </span>
            </div>
          ))}
      </div>
    )

    return { statusStats, statusDetails }
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
        apiUrl={`${BACKEND_API}/api/tenants/${tenantData.info.name}/results/ar`}
        apiDoc={`${BACKEND_API}/swagger-ui/#/Capabilities/get_v1_tenants__id__capabilities_availability`}
        apiAccess={`${BACKEND_API}/oidc-client`}
        icon={<ClockIcon />}
        docUrl="https://argoeu.github.io/argo-monitoring/docs/reports/ar#availability"
        stats={availabilityStats}
      />

      <CapabilityCard
        title="Status"
        colorClass="bg-indigo-50 text-indigo-600 border border-indigo-100"
        description="Real-time chronological health timelines, tracking states between OK, Warning, and Critical transitions."
        apiUrl={`${BACKEND_API}/api/tenants/${tenantData.info.name}/status`}
        apiDoc={`${BACKEND_API}/swagger-ui/#/Capabilities/get_v1_tenants__id__capabilities_status`}
        apiAccess={`${BACKEND_API}/oidc-client`}
        icon={<Rows4 />}
        docUrl="https://argoeu.github.io/argo-monitoring/docs/reports/status_timelines"
        stats={statusStats}
        details={statusDetails}
      />
    </div>
  )
}

export default TenantCapabilitiesTab
