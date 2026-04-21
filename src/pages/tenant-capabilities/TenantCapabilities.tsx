import { useParams } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { useSelectedTenant } from '@/contexts/selected-tenant'
import PageHeader from '@/components/PageHeader'
import TenantCapabilitiesTab from './TenantCapabilitiesTab'
import NodeConfigPanel from './NodeConfigPanel'

const TenantCapabilities = () => {
  const { id } = useParams<{ id: string }>()
  const { isSuperAdmin } = useAuth()
  const { tenant, isTenantAdmin } = useSelectedTenant()
  const canConfigureNode = isSuperAdmin || isTenantAdmin

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
      {canConfigureNode && tenant !== undefined && (
        <NodeConfigPanel
          tenantId={id || ''}
          currentNode={tenant.node ?? false}
        />
      )}
      <TenantCapabilitiesTab />
    </div>
  )
}

export default TenantCapabilities
