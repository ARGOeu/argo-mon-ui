import { Link } from 'react-router-dom'
import IncidentSummary from './IncidentSummary'
import type { Incident } from '@/types/incidents'

interface IncidentCardProps {
  incident: Incident
  tenantId: string
}

const IncidentCard = ({ incident, tenantId }: IncidentCardProps) => (
  <Link
    to={`/tenants/${tenantId}/incidents/${incident.id}`}
    className="group block rounded-lg p-1"
  >
    <IncidentSummary incident={incident} compact />
  </Link>
)

export default IncidentCard
