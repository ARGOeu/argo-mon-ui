import { useState } from 'react'
import { useUpdateIncidentMutation } from '@/hooks/useIncidents'
import { toast } from 'sonner'
import { PencilSquareIcon } from '@heroicons/react/16/solid'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import ClampedText from '@/components/ClampedText'
import IconButton from '@/components/IconButton'
import { formatDateTimeWithWeekday, roundToSecond } from './utils/incidentDate'
import {
  incidentStatusBadgeClass,
  incidentStatusLabel,
} from './utils/incidentStatus'
import type { Incident } from '@/types/incidents'

interface IncidentHeaderProps {
  incident: Incident
  tenantId: string
  canManage: boolean
}

const IncidentHeader = ({
  incident,
  tenantId,
  canManage,
}: IncidentHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedDescription, setEditedDescription] = useState(
    incident.description,
  )
  const updateIncidentMutation = useUpdateIncidentMutation()

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

  const isUnchanged = editedDescription.trim() === incident.description.trim()

  const handleUpdate = () => {
    if (isUnchanged || !editedDescription.trim()) {
      return
    }

    updateIncidentMutation.mutate(
      {
        tenantId,
        incidentId: incident.id,
        data: { description: editedDescription.trim() },
      },
      {
        onSuccess: () => {
          toast.success('Description updated successfully!')
          setIsEditing(false)
        },
        onError: (error) => {
          toast.error(`Failed to update description: ${error.message}`)
        },
      },
    )
  }

  const handleCancel = () => {
    setEditedDescription(incident.description)
    setIsEditing(false)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-semibold break-words">{incident.title}</h2>
        <Badge
          className={
            incidentStatusBadgeClass[incident.status] ??
            'bg-surface-strong text-muted'
          }
        >
          {incidentStatusLabel[incident.status]}
        </Badge>
      </div>

      <p className="text-sm text-muted mt-1">
        Created {formatDateTimeWithWeekday(incident.created_at)} (UTC)
      </p>

      {isEditing ? (
        <div
          key="editing"
          className="flex flex-col gap-2 w-full max-w-2xl mt-1.5"
        >
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            placeholder="Describe what is down or not working properly"
            rows={2}
            className="resize-y"
          />
          <div className="flex items-center justify-end gap-6">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleCancel}
              disabled={updateIncidentMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleUpdate}
              disabled={
                isUnchanged ||
                !editedDescription.trim() ||
                updateIncidentMutation.isPending
              }
            >
              {updateIncidentMutation.isPending ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </div>
      ) : (
        incident.description && (
          <div
            key="viewing"
            className="group/desc flex items-center gap-1.5 mt-1.5"
          >
            <ClampedText
              text={incident.description}
              lines={5}
              className="text-sm text-body"
            />
            {canManage && (
              <div className="opacity-0 group-hover/desc:opacity-100 transition-opacity">
                <IconButton
                  icon={<PencilSquareIcon className="size-4" />}
                  label="Edit description"
                  onClick={() => setIsEditing(true)}
                  className="text-muted hover:bg-surface-strong hover:text-brand"
                />
              </div>
            )}
          </div>
        )
      )}

      <p className="text-xs text-subtle mt-2">
        {incident.incident_number}
        {hasBeenUpdated && (
          <>
            {' '}
            <span className="text-subtle">·</span> Last updated on{' '}
            {formatDateTimeWithWeekday(incident.updated_at as string)} (UTC)
          </>
        )}
      </p>
    </div>
  )
}

export default IncidentHeader
