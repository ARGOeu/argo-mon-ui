import { useSelectedTenant } from '@/contexts/selected-tenant'
import { useGetTenantReports } from '@/hooks/useTenants'
import { useAuth } from '@/auth/useAuth'
import { ArrowUpRightFromSquare, Info } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import PrivateCapabilitiesContainer from '../tenant-capabilities/PrivateCapabilitiesContainer'
import NodeConfigPanel from '../tenant-capabilities/NodeConfigPanel'

interface TenantCapabilitiesTabProps {
  tenantId: string
}

const TenantCapabilitiesTab = ({ tenantId }: TenantCapabilitiesTabProps) => {
  const { isSuperAdmin } = useAuth()
  const { tenant, isTenantLoading, tenantError, roleInSelectedTenant } =
    useSelectedTenant()
  const canConfigureNode =
    isSuperAdmin || roleInSelectedTenant === 'tenant_admin'

  const {
    data: reports,
    isLoading: isReportsLoading,
    error: reportsError,
  } = useGetTenantReports(tenant?.id || '', undefined, undefined, !!tenant?.id)

  const isNodeEnabled = !!tenant?.node
  const hasNodeReport = reports?.some((report) => !!report.node_report)
  const capabilitiesEnabled = isNodeEnabled && hasNodeReport
  const hasPublicNodeReport =
    reports?.some((r) => !!r.node_report && r.public === true) ?? false

  return isTenantLoading || isReportsLoading ? (
    <div className="loading-container">
      <LoadingSpinner size="md" />
    </div>
  ) : tenantError || reportsError ? (
    <ErrorDisplay
      error={(tenantError || reportsError) as Error}
      context="capabilities"
    />
  ) : (
    <>
      {canConfigureNode && tenant !== undefined && (
        <NodeConfigPanel
          tenantId={tenantId}
          isNodeEnabled={tenant.node ?? false}
        />
      )}
      {!capabilitiesEnabled ? (
        <div className="flex flex-col items-center justify-center py-4 px-6 text-center rounded-xl bg-surface-muted mt-2">
          <div className="bg-surface-strong p-2.5 rounded-full mb-2">
            <Info className="size-5 text-muted" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            Node Configuration Required
          </h3>
          <p className="text-sm text-muted max-w-md">
            {canConfigureNode
              ? 'Please select a node report and enable node status above to view capabilities.'
              : 'This tenant is not currently configured as an active node. Capability data will be available here once the node is fully enabled.'}
          </p>
        </div>
      ) : (
        <>
          {hasPublicNodeReport && tenant?.info.name && (
            <div className="flex justify-end mb-3">
              <a
                href={`/public/tenants/${encodeURIComponent(tenant.info.name)}/capabilities`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-sm text-brand no-underline transition-colors hover:text-brand-strong hover:underline"
              >
                View public capabilities
                <ArrowUpRightFromSquare className="size-3 flex-shrink-0" />
              </a>
            </div>
          )}
          <PrivateCapabilitiesContainer />
        </>
      )}
    </>
  )
}

export default TenantCapabilitiesTab
