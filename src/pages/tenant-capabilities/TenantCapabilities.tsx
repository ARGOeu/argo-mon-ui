import { useParams } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { useSelectedTenant } from '@/contexts/selected-tenant'
import { useGetTenantReports } from '@/hooks/useTenants'
import { Info } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import TenantCapabilitiesTab from './TenantCapabilitiesTab'
import NodeConfigPanel from './NodeConfigPanel'

const TenantCapabilities = () => {
  const { id } = useParams<{ id: string }>()
  const { isSuperAdmin } = useAuth()
  const { tenant, isTenantLoading, tenantError, roleInSelectedTenant } =
    useSelectedTenant()
  const canConfigureNode = isSuperAdmin || roleInSelectedTenant === 'admin'

  const {
    data: reports,
    isLoading: isReportsLoading,
    error: reportsError,
  } = useGetTenantReports(tenant?.id || '', undefined, !!tenant?.id)

  const isNodeEnabled = !!tenant?.node
  const hasNodeReport = reports?.some((report) => !!report.node_report)
  const capabilitiesEnabled = isNodeEnabled && hasNodeReport

  return (
    <div className="page-container">
      <PageHeader
        title="Capabilities"
        subtitle={
          <>
            Explore capabilities for tenant{' '}
            <strong>{tenant?.info.name ? tenant.info.name : '...'}</strong>
          </>
        }
        className="pb-2 mb-2"
      />

      {isTenantLoading || isReportsLoading ? (
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
              tenantId={id || ''}
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
            <TenantCapabilitiesTab />
          )}
        </>
      )}
    </div>
  )
}

export default TenantCapabilities
