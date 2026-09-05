import { useGetIncidentActivity } from '@/hooks/useIncidents'
import ErrorDisplay from '@/components/ErrorDisplay'
import LoadingSpinner from '@/components/LoadingSpinner'
import IncidentHistoryItem from './IncidentHistoryItem'

interface IncidentHistoryProps {
  tenantId: string
  incidentId: string
  canManage: boolean
}

const IncidentHistory = ({
  tenantId,
  incidentId,
  canManage,
}: IncidentHistoryProps) => {
  const {
    data: activity,
    isLoading: isActivityLoading,
    error: activityError,
  } = useGetIncidentActivity(tenantId, incidentId)

  const activityEntries = Array.isArray(activity) ? [...activity].reverse() : []

  return (
    <>
      {isActivityLoading ? (
        <div className="flex justify-center">
          <LoadingSpinner size="xs" />
        </div>
      ) : activityError ? (
        <ErrorDisplay error={activityError} context="incident history" />
      ) : activityEntries.length > 0 ? (
        <ul className="relative flex flex-col gap-2.5">
          <div
            className="absolute left-1 top-1 bottom-1 w-px bg-line-strong"
            aria-hidden="true"
          />
          {activityEntries.map((activity) => (
            <IncidentHistoryItem
              key={activity.id}
              activity={activity}
              tenantId={tenantId}
              incidentId={incidentId}
              canManage={canManage}
            />
          ))}
        </ul>
      ) : null}
    </>
  )
}

export default IncidentHistory
