import type { SelectOption } from '@/components/SelectDropdown'
import type { IncidentStatus } from '@/types/incidents'

export const incidentStatusLabel: Record<IncidentStatus, string> = {
  NEW: 'New',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  PENDING: 'Pending',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
}

export const incidentStatusOptions: SelectOption[] = (
  Object.keys(incidentStatusLabel) as IncidentStatus[]
).map((status) => ({ value: status, label: incidentStatusLabel[status] }))

export const incidentStatusBadgeClass: Record<IncidentStatus, string> = {
  NEW: 'bg-red-100 text-red-700',
  ASSIGNED: 'bg-brand-muted text-brand',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  PENDING: 'bg-teal-100 text-teal-700',
  RESOLVED: 'bg-emerald-50 text-emerald-600',
  CLOSED: 'bg-gray-200 text-gray-700',
}
