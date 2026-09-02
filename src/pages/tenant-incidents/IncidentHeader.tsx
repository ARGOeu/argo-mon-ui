import Badge from '@/components/Badge'
import ClampedText from '@/components/ClampedText'
import {
  incidentStatusBadgeClass,
  incidentStatusLabel,
} from './utils/incidentStatus'
import type { Incident } from '@/types/incidents'

const formatDateTime = (isoString: string) =>
  new Date(isoString).toLocaleString('en-GB', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  })

interface IncidentHeaderProps {
  incident: Incident
}

const IncidentHeader = ({ incident }: IncidentHeaderProps) => (
  <div>
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-xl font-semibold">
        {incident.created_at ? formatDateTime(incident.created_at) : '...'}{' '}
        (UTC)
      </p>
      <Badge
        className={
          incidentStatusBadgeClass[incident.status] ??
          'bg-surface-strong text-muted'
        }
      >
        {incidentStatusLabel[incident.status]}
      </Badge>
    </div>

    <h2 className="text-xl text-foreground mt-1 break-words">
      {incident.title}
    </h2>

    {incident.description && (
      <ClampedText
        text={incident.description}
        lines={5}
        className="text-base text-body mt-1"
      />
    )}
  </div>
)

export default IncidentHeader
