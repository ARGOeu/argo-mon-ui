import { ChatBubbleLeftIcon } from '@heroicons/react/16/solid'
import Badge from '@/components/Badge'
import { formatDateTime, roundToSecond } from './utils/incidentDate'
import {
  incidentStatusBadgeClass,
  incidentStatusLabel,
} from './utils/incidentStatus'
import type { Incident } from '@/types/incidents'

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
  const commentCount = incident.comments?.length ?? 0

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
        <p className="text-base font-medium text-foreground transition-colors group-hover:text-brand">
          {incident.title}
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
        <div className="grid grid-cols-[1fr_auto] gap-x-12 lg:gap-x-60">
          <div className="min-w-0">
            <p className="text-sm text-foreground font-medium break-words">
              {formatDateTime(incident.created_at)} (UTC)
            </p>

            <p className="text-sm text-body line-clamp-3 mt-0.5">
              {incident.description}
            </p>

            {incident.status_description && (
              <p className="text-sm text-body line-clamp-4 mt-1.5">
                <span className="text-sm text-muted">Latest update:</span>{' '}
                {incident.status_description}
              </p>
            )}

            <p className="text-sm text-muted break-words max-w-md mt-1.5">
              Created by{' '}
              <span className="text-foreground">{incident.created_by}</span>
              {hasBeenUpdated && (
                <>
                  {' '}
                  <span className="text-subtle">·</span> Updated by{' '}
                  <span className="text-foreground">{incident.updated_by}</span>
                </>
              )}
            </p>
            <p className="text-xs text-subtle mt-2">
              {incident.incident_number}
              {hasBeenUpdated && (
                <>
                  {' '}
                  <span className="text-subtle">·</span> Last updated on{' '}
                  {formatDateTime(incident.updated_at as string)} (UTC)
                </>
              )}
            </p>
          </div>

          <div className="flex flex-col items-end justify-between shrink-0">
            <div className="flex flex-col items-end">
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

            {commentCount > 0 && (
              <div className="flex items-center gap-1 mt-4 text-muted">
                <ChatBubbleLeftIcon className="size-4" />
                <span className="text-sm font-medium">{commentCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default IncidentSummary
