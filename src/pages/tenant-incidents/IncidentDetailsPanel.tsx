import { useEffect, useState } from 'react'
import { useUpdateIncidentStatusMutation } from '@/hooks/useIncidents'
import { toast } from 'sonner'
import Button from '@/components/Button'
import SelectDropdown from '@/components/SelectDropdown'
import { incidentStatusOptions } from './utils/incidentStatus'
import type { Incident, IncidentStatus } from '@/types/incidents'

const sectionTitleClass = 'text-base font-semibold text-foreground mb-1'

interface IncidentDetailsPanelProps {
  incident: Incident
  tenantId: string
  canManage: boolean
}

const IncidentDetailsPanel = ({
  incident,
  tenantId,
  canManage,
}: IncidentDetailsPanelProps) => {
  const [selectedStatus, setSelectedStatus] = useState<IncidentStatus>(
    incident.status,
  )

  useEffect(() => {
    setSelectedStatus(incident.status)
  }, [incident.status])

  const updateStatusMutation = useUpdateIncidentStatusMutation()

  const handleUpdateStatus = () => {
    if (selectedStatus === incident.status) {
      return
    }

    updateStatusMutation.mutate(
      { tenantId, incidentId: incident.id, data: { status: selectedStatus } },
      {
        onSuccess: () => {
          toast.success('Incident status updated successfully!')
        },
        onError: (error) => {
          toast.error(`Failed to update incident status: ${error.message}`)
        },
      },
    )
  }

  return (
    <>
      {canManage && (
        <div>
          <h2 className={sectionTitleClass}>Change Status</h2>

          <div className="flex items-center gap-2">
            <SelectDropdown
              value={selectedStatus}
              onChange={(value) => setSelectedStatus(value as IncidentStatus)}
              options={incidentStatusOptions}
              className="w-48"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleUpdateStatus}
              disabled={
                selectedStatus === incident.status ||
                updateStatusMutation.isPending
              }
            >
              {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

export default IncidentDetailsPanel
