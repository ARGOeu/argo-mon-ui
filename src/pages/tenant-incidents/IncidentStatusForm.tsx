import { useEffect, useState } from 'react'
import { useUpdateIncidentStatusMutation } from '@/hooks/useIncidents'
import { toast } from 'sonner'
import Button from '@/components/Button'
import SelectDropdown from '@/components/SelectDropdown'
import { incidentStatusOptions } from './utils/incidentStatus'
import type { Incident, IncidentStatus } from '@/types/incidents'

const labelClass = 'text-sm font-medium text-body mb-0.5'

interface IncidentStatusFormProps {
  incident: Incident
  tenantId: string
}

const IncidentStatusForm = ({
  incident,
  tenantId,
}: IncidentStatusFormProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<IncidentStatus>(
    incident.status,
  )
  const [statusDescription, setStatusDescription] = useState('')

  useEffect(() => {
    setSelectedStatus(incident.status)
  }, [incident.status])

  const updateStatusMutation = useUpdateIncidentStatusMutation()

  const handleUpdateStatus = () => {
    updateStatusMutation.mutate(
      {
        tenantId,
        incidentId: incident.id,
        data: {
          status: selectedStatus,
          status_description: statusDescription.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success('Incident status updated successfully!')
          setStatusDescription('')
          setIsExpanded(false)
        },
        onError: (error) => {
          toast.error(`Failed to update incident status: ${error.message}`)
        },
      },
    )
  }

  const handleCancel = () => {
    setSelectedStatus(incident.status)
    setStatusDescription('')
    setIsExpanded(false)
  }

  if (!isExpanded) {
    return (
      <div>
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => setIsExpanded(true)}
        >
          Update Status
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl bg-surface-muted rounded-lg px-4 py-3">
      <h2 className="text-base font-semibold text-foreground mb-1.5">
        Update Incident Status
      </h2>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col">
          <label className={labelClass}>
            Status <span className="required">*</span>
          </label>
          <SelectDropdown
            value={selectedStatus}
            onChange={(value) => setSelectedStatus(value as IncidentStatus)}
            options={incidentStatusOptions}
            className="w-48"
          />
        </div>

        <div className="flex flex-col">
          <label className={labelClass}>Message</label>
          <textarea
            value={statusDescription}
            onChange={(e) => setStatusDescription(e.target.value)}
            placeholder="Add a message about this status update"
            rows={2}
            className="resize-y"
          />
        </div>

        <div className="flex items-center justify-end gap-6 mt-1.5">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleCancel}
            disabled={updateStatusMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleUpdateStatus}
            disabled={updateStatusMutation.isPending}
          >
            {updateStatusMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default IncidentStatusForm
