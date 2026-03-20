import { useParams } from 'react-router-dom'
import { useGetUserTenantById } from '@/hooks/useTenants'
import { useAuth } from '@/auth/useAuth'
import PageHeader from '@/components/PageHeader'
import TenantCapabilitiesTab from './TenantCapabilitiesTab'
import NodeConfigPanel from './NodeConfigPanel'

const TenantCapabilities = () => {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()
  const { data: tenantData } = useGetUserTenantById(id || '')
  const isSuperAdmin = profile?.roles?.includes('super_admin')
  const isTenantAdmin = profile?.groups?.some(
    (g) => g.name === tenantData?.info.name && g.role === 'admin',
  )
  const canConfigureNode = isSuperAdmin || isTenantAdmin

  return (
    <div className="page-container">
      <PageHeader
        title="Capabilities"
        subtitle={
          <>
            Explore capabilities for tenant{' '}
            <strong>
              {tenantData?.info.name ? tenantData.info.name : '...'}
            </strong>
          </>
        }
        className="pb-2 mb-2"
      />
      {canConfigureNode && tenantData !== undefined && (
        <NodeConfigPanel
          tenantId={id || ''}
          currentNode={tenantData.node ?? false}
        />
      )}
      <TenantCapabilitiesTab tenantId={id || ''} />
    </div>
  )
}

export default TenantCapabilities
