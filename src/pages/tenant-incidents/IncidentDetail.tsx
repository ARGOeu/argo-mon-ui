import { useParams } from 'react-router-dom'
import ErrorDisplay from '@/components/ErrorDisplay'
import LoadingSpinner from '@/components/LoadingSpinner'
import PageHeader from '@/components/PageHeader'
import { useGetIncident } from '@/hooks/useIncidents'
import IncidentAffectedServices from './IncidentAffectedServices'
import IncidentComments from './IncidentComments'
import IncidentHeader from './IncidentHeader'
import IncidentHistory from './IncidentHistory'
import IncidentStatusForm from './IncidentStatusForm'
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
    <div className="page-container mb-12">
      <PageHeader
        title="Incident Details"
        subtitle="View and manage the details of incident"
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
        <div className="flex flex-col md:flex-row gap-x-4 2xl:gap-x-32 2xl:pe-32 mt-3">
          <div className="flex-1 min-w-0 flex flex-col gap-3">
            <IncidentHeader
              incident={incident}
              tenantId={tenantId ?? ''}
              canManage={canManage}
            />
            {canManage && (
              <IncidentStatusForm
                incident={incident}
                tenantId={tenantId ?? ''}
              />
            )}
            <IncidentHistory
              tenantId={tenantId ?? ''}
              incidentId={incident.id}
              canManage={canManage}
            />
            <IncidentComments
              tenantId={tenantId ?? ''}
              incidentId={incident.id}
              comments={incident.comments ?? []}
              canManage={canManage}
            />
          </div>
          <IncidentAffectedServices incident={incident} />
        </div>
      )}
    </div>
  )
}

export default IncidentDetail
