import type { Incident } from '@/types/incidents'

interface IncidentAffectedServicesProps {
  incident: Incident
}

const IncidentAffectedServices = ({
  incident,
}: IncidentAffectedServicesProps) => (
  <div className="mt-4 md:mt-0 md:w-40 lg:w-80 md:shrink-0">
    <h2 className="text-base font-semibold text-foreground mb-2 text-left md:text-right whitespace-nowrap md:whitespace-normal lg:whitespace-nowrap">
      Affected service group{incident.services.length > 1 ? 's' : ''}
    </h2>
    <div className="flex flex-col items-start md:items-end gap-2">
      {incident.services.map((service) => (
        <span
          key={service.id}
          className="text-xs font-medium text-brand bg-brand-subtle px-2 py-0.5 rounded-md w-fit"
        >
          {service.name}
        </span>
      ))}
    </div>
  </div>
)

export default IncidentAffectedServices
