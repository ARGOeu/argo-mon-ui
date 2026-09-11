import type { Incident, IncidentStatus } from '@/types/incidents'

export type BannerIncidentStatus =
  | 'NEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'PENDING'
  | 'RESOLVED'

export const BANNER_INCIDENT_STATUSES: BannerIncidentStatus[] = [
  'NEW',
  'ASSIGNED',
  'IN_PROGRESS',
  'PENDING',
  'RESOLVED',
]

export const getBannerIncidents = (
  incidents: Incident[] | undefined,
): Incident[] =>
  (incidents ?? []).filter((incident) => incident.status !== 'CLOSED')

export const incidentStatusLabel: Record<IncidentStatus, string> = {
  NEW: 'New',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  PENDING: 'Pending',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
}

const unresolvedStyle = {
  labelClass: 'text-red-700',
  pillClass: 'bg-red-50 border-red-700',
  nameClass: 'font-bold text-red-700',
  timeClass: 'text-gray-600',
}

export const bannerIncidentStatusStyles: Record<
  BannerIncidentStatus,
  {
    labelClass: string
    pillClass: string
    nameClass: string
    timeClass: string
  }
> = {
  NEW: unresolvedStyle,
  ASSIGNED: unresolvedStyle,
  IN_PROGRESS: unresolvedStyle,
  PENDING: unresolvedStyle,
  RESOLVED: {
    labelClass: 'text-gray-700',
    pillClass: 'bg-white border-gray-200',
    nameClass: 'font-medium text-gray-700',
    timeClass: 'text-gray-400',
  },
}
