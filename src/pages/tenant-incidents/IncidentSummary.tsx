import Badge from '@/components/Badge'
import {
  incidentStatusBadgeClass,
  incidentStatusLabel,
} from './utils/incidentStatus'
import type { Incident } from '@/types/incidents'

const formatDateTime = (isoString: string) =>
  new Date(isoString).toLocaleString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  })

// Ignores sub-second differences when comparing timestamps.
const roundToSecond = (isoString: string) =>
  Math.floor(new Date(isoString).getTime() / 1000)

const maxVisibleServices = 5

interface IncidentSummaryProps {
  incident: Incident
  compact?: boolean
}

const IncidentSummary = ({
  incident,
  compact = false,
}: IncidentSummaryProps) => {
  const visibleServices = compact
    ? incident.services.slice(0, maxVisibleServices)
    : incident.services
  const hiddenServicesCount = incident.services.length - visibleServices.length

  const createdSeconds = incident.created_at
    ? roundToSecond(incident.created_at)
    : null
  const updatedSeconds = incident.updated_at
    ? roundToSecond(incident.updated_at)
    : null

  const hasBeenUpdated =
    !!incident.updated_by &&
    createdSeconds != null &&
    updatedSeconds != null &&
    !Number.isNaN(createdSeconds) &&
    !Number.isNaN(updatedSeconds) &&
    updatedSeconds !== createdSeconds

  const servicesContent = (
    <>
      <span className="text-sm text-foreground font-medium mb-1">
        Affected service group{incident.services.length > 1 ? 's' : ''}
      </span>
      <div className="flex flex-col items-end gap-1">
        {visibleServices.map((service) => (
          <span
            key={service.id}
            className="text-xs font-medium text-brand bg-brand-subtle px-2 py-0.5 rounded-md"
          >
            {service.name}
          </span>
        ))}
        {hiddenServicesCount > 0 && (
          <span className="text-xs font-semibold text-muted bg-surface-strong px-2 py-0.5 rounded-md">
            +{hiddenServicesCount} more
          </span>
        )}
      </div>
    </>
  )

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-1">
        <p className="text-base font-semibold text-foreground transition-colors group-hover:text-brand">
          {formatDateTime(incident.created_at)} (UTC)
        </p>
        <Badge
          size="md"
          className={
            incidentStatusBadgeClass[incident.status] ??
            'bg-surface-strong text-muted'
          }
        >
          {incidentStatusLabel[incident.status]}
        </Badge>
      </div>

      <div className="bg-surface-muted rounded-lg px-3 py-2">
        <div className="grid grid-cols-[1fr_auto] items-start gap-x-12 lg:gap-x-60">
          <div className="min-w-0">
            <p className="text-foreground font-medium break-words">
              {incident.title}
            </p>

            <p className="text-sm text-body line-clamp-3 mt-0.5">
              {incident.description}
            </p>

            {incident.status_description && (
              <p className="text-sm text-body line-clamp-4 mt-1.5">
                <span className="text-xs font-medium text-muted">
                  Latest update:
                </span>{' '}
                {incident.status_description}
              </p>
            )}

            <p className="text-sm text-muted mt-1.5">
              Created by{' '}
              <span className="text-foreground">{incident.created_by}</span>
              {hasBeenUpdated && (
                <>
                  {' '}
                  <span className="text-subtle">·</span> Updated by{' '}
                  <span className="text-foreground">{incident.updated_by}</span>{' '}
                  on {formatDateTime(incident.updated_at as string)} (UTC)
                </>
              )}
            </p>
            <p className="text-xs text-subtle mt-2">
              {incident.incident_number}
            </p>
          </div>

          <div className="flex flex-col items-end shrink-0">
            {hiddenServicesCount > 0 ? (
              <div className="tooltip tooltip-left flex flex-col items-end">
                <div className="tooltip-content !text-left">
                  <ul className="flex flex-col gap-0.5">
                    {incident.services.map((service) => (
                      <li key={service.id} className="max-w-48 truncate">
                        {service.name}
                      </li>
                    ))}
                  </ul>
                </div>
                {servicesContent}
              </div>
            ) : (
              servicesContent
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default IncidentSummary
