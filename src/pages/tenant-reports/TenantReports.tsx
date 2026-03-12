import { useParams } from 'react-router-dom'
import { useGetUserTenantById } from '@/hooks/useTenants'
import PageHeader from '@/components/PageHeader'
import TenantReportsContent from './TenantReportsContent'

const TenantReports = () => {
  const { id } = useParams<{ id: string }>()
  const { data: tenantData } = useGetUserTenantById(id || '')

  return (
    <div className="page-container">
      <PageHeader
        title="Reports"
        subtitle={
          <>
            View reports for tenant{' '}
            <strong>
              {tenantData?.info.name ? tenantData.info.name : '...'}
            </strong>
          </>
        }
        className="pb-2 mb-4"
      />
      <TenantReportsContent tenantId={id || ''} />
    </div>
  )
}

export default TenantReports
