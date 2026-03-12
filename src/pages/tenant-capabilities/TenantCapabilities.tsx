import { useParams } from 'react-router-dom'
import { useGetUserTenantById } from '@/hooks/useTenants'
import PageHeader from '@/components/PageHeader'
import TenantCapabilitiesTab from './TenantCapabilitiesTab'

const TenantCapabilities = () => {
  const { id } = useParams<{ id: string }>()
  const { data: tenantData } = useGetUserTenantById(id || '')

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
        className="pb-2 mb-4"
      />
      <TenantCapabilitiesTab tenantId={id || ''} />
    </div>
  )
}

export default TenantCapabilities
