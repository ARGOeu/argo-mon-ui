import { useEffect, useState } from 'react'
import { useSelectedTenant } from '@/contexts/selected-tenant'
import { useGetTenantReports } from '@/hooks/useTenants'
import { useAuth } from '@/auth/useAuth'
import { useParams } from 'react-router-dom'
import { Info } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import PrivateCapabilityContainer from './PrivateCapabilityContainer'
import NodeConfigPanel from './NodeConfigPanel'
import CapabilityNav, { type CapabilityNavItems } from './CapabilityNav'

const TenantCapability = () => {
  const { id } = useParams<{ id: string }>()
  const { isSuperAdmin } = useAuth()
  const { tenant, isTenantLoading, tenantError, roleInSelectedTenant } =
    useSelectedTenant()
  const canConfigureNode =
    isSuperAdmin || roleInSelectedTenant === 'tenant_admin'

  const [selectedView, setSelectedView] =
    useState<CapabilityNavItems>('metrics')

  const {
    data: reports,
    isLoading: isReportsLoading,
    error: reportsError,
  } = useGetTenantReports(tenant?.id || '', undefined, undefined, !!tenant?.id)

  const isNodeEnabled = !!tenant?.node
  const hasNodeReport = reports?.some((report) => !!report.node_report)
  const capEnabled = isNodeEnabled && hasNodeReport
  const hasPublicNodeReport =
    reports?.some((r) => !!r.node_report && r.public === true) ?? false

  const canShowNodeConfig = canConfigureNode && tenant !== undefined

  useEffect(() => {
    if (isTenantLoading || isReportsLoading) return
    if (!capEnabled && canShowNodeConfig) {
      setSelectedView('node-config')
    }
  }, [capEnabled, canShowNodeConfig, isTenantLoading, isReportsLoading])

  return (
    <div className="page-container">
      <PageHeader
        title="Capability"
        subtitle={
          <>
            Explore monitoring capability for tenant{' '}
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
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
          {(capEnabled || canShowNodeConfig) && (
            <aside className="w-full shrink-0 lg:w-72">
              <CapabilityNav
                selected={selectedView}
                onSelect={setSelectedView}
                capEnabled={!!capEnabled}
                showNodeConfig={canShowNodeConfig}
              />
            </aside>
          )}

          <div className="min-w-0 flex-1">
            {selectedView === 'node-config' ? (
              canShowNodeConfig &&
              tenant && (
                <NodeConfigPanel
                  tenantId={id || ''}
                  isNodeEnabled={tenant.node ?? false}
                  tenantName={tenant.info.name}
                  hasPublicNodeReport={hasPublicNodeReport}
                />
              )
            ) : !capEnabled ? (
              <div className="flex flex-col items-center justify-center rounded-xl bg-surface-muted px-6 py-4 text-center">
                <div className="mb-2 rounded-full bg-surface-strong p-2.5">
                  <Info className="size-5 text-muted" />
                </div>
                <h3 className="mb-1 text-base font-semibold text-foreground">
                  Node Configuration Required
                </h3>
                <p className="max-w-md text-sm text-muted">
                  {canConfigureNode
                    ? 'Open Node configuration in the sidebar to select a report and enable this node.'
                    : 'This tenant is not currently configured as an active node. Capability data will be available here once the node is fully enabled.'}
                </p>
                {canShowNodeConfig && (
                  <button
                    type="button"
                    onClick={() => setSelectedView('node-config')}
                    className="mt-3 rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-strong"
                  >
                    Open Node configuration
                  </button>
                )}
              </div>
            ) : (
              selectedView === 'metrics' && <PrivateCapabilityContainer />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TenantCapability
