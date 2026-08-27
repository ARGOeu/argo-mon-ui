import { useParams } from 'react-router-dom'
import ErrorDisplay from '@/components/ErrorDisplay'
import LoadingSpinner from '@/components/LoadingSpinner'
import PageHeader from '@/components/PageHeader'
import { useGetIncident } from '@/hooks/useIncidents'
import IncidentDetailsPanel from './IncidentDetailsPanel'
import IncidentSummary from './IncidentSummary'
import { useCanManageIncidents } from './useCanManageIncidents'

const IncidentDetail = () => {
  const { id: tenantId, incidentId } = useParams<{
    id: string
    incidentId: string
  }>()
  const { canManage } = useCanManageIncidents()

  const {
    data: incident,
    isLoading,
    error,
  } = useGetIncident(tenantId ?? '', incidentId ?? '')

  return (
    <div className="page-container mb-8">
      <PageHeader
        title="Incident Details"
        subtitle={
          <>
            View and manage the details of incident
            <strong className="break-all">
              {incident?.title ? ` ${incident.title}` : '...'}
            </strong>
          </>
        }
        navigateTo={{
          label: 'Back to Incidents',
          to: `/tenants/${tenantId}/incidents`,
        }}
      />

      {isLoading ? (
        <div className="loading-container">
          <LoadingSpinner size="md" />
        </div>
      ) : error ? (
        <ErrorDisplay error={error} context="incident" />
      ) : !incident ? (
        <p className="text-center text-base text-subtle italic py-8">
          Incident not found
        </p>
      ) : (
        <div className="flex flex-col gap-3 mt-4">
          <IncidentSummary incident={incident} />
          <IncidentDetailsPanel
            incident={incident}
            tenantId={tenantId ?? ''}
            canManage={canManage}
          />
        </div>
      )}
    </div>
  )
}

export default IncidentDetail
