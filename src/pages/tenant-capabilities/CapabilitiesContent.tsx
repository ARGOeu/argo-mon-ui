import { ClockIcon, Rows4 } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import CapabilityCard from './CapabilityCard'
import type { Stats } from './CapabilityCard'
import type { StatusCount } from '@/utils/capabilityStats'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

interface CapabilitiesContentProps {
  tenantName: string
  availabilityStats?: Stats[]
  statusStats?: Stats[]
  statusCounts?: StatusCount[]
  isLoading?: boolean
  error?: Error | null
}

const CapabilitiesContent = ({
  tenantName,
  availabilityStats,
  statusStats,
  statusCounts,
  isLoading,
  error,
}: CapabilitiesContentProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return <ErrorDisplay error={error} context="capabilities" />
  }

  const statusDetails =
    statusCounts && statusCounts.length > 0 ? (
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {statusCounts.map((c) => (
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
    ) : null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <CapabilityCard
        title="Availability"
        colorClass="bg-emerald-50 text-emerald-600 border border-emerald-100"
        description="Percentage of time a service is fully functional and accessible, based on monitored status history."
        apiUrl={`${BACKEND_API}/api/tenants/${tenantName}/results/ar`}
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
        apiUrl={`${BACKEND_API}/api/tenants/${tenantName}/status`}
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

export default CapabilitiesContent
