import { useMemo } from 'react'
import { Server } from 'lucide-react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { formatDateTime, formatRelativeTime } from '@/utils/formatDateTime'
import {
  BANNER_INCIDENT_STATUSES,
  bannerIncidentStatusStyles,
  incidentStatusLabel,
  type BannerIncidentStatus,
} from '@/utils/incidents'
import type { Incident } from '@/types/incidents'

const isBannerStatus = (status: string): status is BannerIncidentStatus =>
  (BANNER_INCIDENT_STATUSES as string[]).includes(status)

const IncidentPill = ({
  incident,
  status,
}: {
  incident: Incident
  status: BannerIncidentStatus
}) => {
  const s = bannerIncidentStatusStyles[status]
  return (
    <span
      className={`tooltip tooltip-bottom cursor-pointer inline-flex items-center gap-2 rounded-full border mx-1 my-0.5 px-2.5 py-0.5 text-[12px] ${s.pillClass}`}
    >
      <div className="tooltip-content text-[12px]">
        <div className="font-bold mb-1">Incident: {incident.title}</div>
        <div>
          created:{' '}
          {formatDateTime(incident.created_at, {
            seconds: true,
            utcSuffix: true,
          })}{' '}
          by {incident.created_by}
        </div>
        {incident.updated_at && (
          <div>
            updated:{' '}
            {formatDateTime(incident.updated_at, {
              seconds: true,
              utcSuffix: true,
            })}
            {incident.updated_by ? ` by ${incident.updated_by}` : ''}
          </div>
        )}
        <div className="font-bold mb-1 mt-2">
          Affected service{' '}
          {(incident.services ?? []).length === 1 ? 'group' : 'groups'}:
        </div>
        <ul>
          {(incident.services ?? []).map((service, i) => (
            <li key={`${service.id}-${i}`}>
              <Server size={16} className="inline me-2" />
              {service.name}
            </li>
          ))}
        </ul>
      </div>

      <span className={`${s.nameClass} truncate max-w-[18rem]`}>
        {incident.title}
      </span>

      <span className={s.timeClass}>
        {formatRelativeTime(incident.updated_at, incident.created_at)}
      </span>
    </span>
  )
}

const IncidentStatusSection = ({
  status,
  items,
}: {
  status: BannerIncidentStatus
  items: Incident[]
}) => {
  if (items.length === 0) {
    return null
  }
  const s = bannerIncidentStatusStyles[status]
  return (
    <>
      <span className="mx-1">·</span>
      <span className={`ms-1 text-[13px] me-1 ${s.labelClass}`}>
        {incidentStatusLabel[status]}:
      </span>
      {items.map((incident) => (
        <IncidentPill key={incident.id} incident={incident} status={status} />
      ))}
    </>
  )
}

interface IncidentBannerProps {
  incidents: Incident[]
  isLoading?: boolean
  error?: Error | null
}

const IncidentBanner = ({
  incidents,
  isLoading,
  error,
}: IncidentBannerProps) => {
  const incidentsByStatus = useMemo(() => {
    const groups = Object.fromEntries(
      BANNER_INCIDENT_STATUSES.map((status) => [status, [] as Incident[]]),
    ) as Record<BannerIncidentStatus, Incident[]>

    for (const incident of incidents) {
      if (isBannerStatus(incident.status)) {
        groups[incident.status].push(incident)
      }
    }

    return groups
  }, [incidents])

  const count = BANNER_INCIDENT_STATUSES.reduce(
    (total, status) => total + incidentsByStatus[status].length,
    0,
  )

  if (isLoading || error || count === 0) {
    return null
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-3 rounded-xl border px-5 py-2 bg-gray-50 text-gray-600 ring-gray-500/20">
      <ExclamationTriangleIcon className="w-5 h-5 text-red-700" />
      <div className="min-w-0 flex-1">
        <span className="text-[14px] font-semibold">
          {count === 1 ? '1 incident' : `${count} incidents`}
        </span>
        {BANNER_INCIDENT_STATUSES.map((status) => (
          <IncidentStatusSection
            key={status}
            status={status}
            items={incidentsByStatus[status]}
          />
        ))}
      </div>
    </div>
  )
}

export default IncidentBanner
