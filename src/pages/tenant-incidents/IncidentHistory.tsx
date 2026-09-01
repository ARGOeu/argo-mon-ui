import { useGetIncidentActivity } from '@/hooks/useIncidents'
import Badge from '@/components/Badge'
import ClampedText from '@/components/ClampedText'
import ErrorDisplay from '@/components/ErrorDisplay'
import LoadingSpinner from '@/components/LoadingSpinner'
import {
  incidentStatusBadgeClass,
  incidentStatusLabel,
} from './utils/incidentStatus'

const formatHistoryDateTime = (isoString: string) =>
  new Date(isoString).toLocaleString('en-GB', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'UTC',
  })

interface IncidentHistoryProps {
  tenantId: string
  incidentId: string
}

const IncidentHistory = ({ tenantId, incidentId }: IncidentHistoryProps) => {
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
          {activityEntries.map((entry) => (
            <li
              key={entry.id}
              className="relative flex flex-col items-start gap-1 pl-5"
            >
              <span
                className="absolute left-0 top-1 size-2.5 rounded-full bg-white border-2 border-line-strong"
                aria-hidden="true"
              />
              <Badge
                size="sm"
                className={
                  incidentStatusBadgeClass[entry.new_status] ??
                  'bg-surface-strong text-muted'
                }
              >
                {incidentStatusLabel[entry.new_status]}
              </Badge>
              {entry.status_description && (
                <ClampedText
                  text={entry.status_description}
                  lines={5}
                  className="text-sm text-body"
                />
              )}
              <p className="text-[13px] text-subtle">
                Updated {formatHistoryDateTime(entry.created_at)} (UTC) by{' '}
                {entry.changed_by}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  )
}

export default IncidentHistory
