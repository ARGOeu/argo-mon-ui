import { useSelectedTenant } from '@/contexts/selected-tenant'
import { useParams } from 'react-router-dom'
import Button from '@/components/Button'
import PageHeader from '@/components/PageHeader'
import { useCanManageIncidents } from './useCanManageIncidents'

const TenantIncidents = () => {
  const { id: tenantId } = useParams<{ id: string }>()
  const { tenant: tenantData } = useSelectedTenant()
  const { canManage } = useCanManageIncidents()

  return (
    <div className="page-container mb-8">
      <PageHeader
        className="mb-4"
        title="Incidents"
        subtitle={
          <>
            View and manage reported incidents for tenant
            <strong className="break-all">
              {tenantData?.info.name ? ` ${tenantData.info.name}` : '...'}
            </strong>
          </>
        }
      >
        {canManage && (
          <Button
            variant="primary"
            size="md"
            href={`/tenants/${tenantId}/incidents/create`}
          >
            Report Incident
          </Button>
        )}
      </PageHeader>
    </div>
  )
}

export default TenantIncidents
