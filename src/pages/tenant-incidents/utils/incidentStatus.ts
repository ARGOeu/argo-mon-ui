import type { SelectOption } from '@/components/SelectDropdown'
import type { IncidentStatus } from '@/types/incidents'
import { incidentStatusLabel } from '@/utils/incidents'

export { incidentStatusLabel }

export const incidentStatusOptions: SelectOption[] = (
  Object.keys(incidentStatusLabel) as IncidentStatus[]
)
  .filter((status) => status !== 'NEW')
  .map((status) => ({ value: status, label: incidentStatusLabel[status] }))

export const incidentStatusBadgeClass: Record<IncidentStatus, string> = {
  NEW: 'bg-red-100 text-red-700',
  ASSIGNED: 'bg-brand-muted text-brand',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  PENDING: 'bg-teal-100 text-teal-700',
  RESOLVED: 'bg-emerald-50 text-emerald-600',
  CLOSED: 'bg-gray-200 text-gray-700',
}
