import { useState } from 'react'
import { useUpdateIncidentStatusDescriptionMutation } from '@/hooks/useIncidents'
import { toast } from 'sonner'
import { PencilSquareIcon } from '@heroicons/react/16/solid'
import Badge from '@/components/Badge'
import ClampedText from '@/components/ClampedText'
import Button from '@/components/Button'
import IconButton from '@/components/IconButton'
import { formatDateTimeWithSeconds } from './utils/incidentDate'
import {
  incidentStatusBadgeClass,
  incidentStatusLabel,
} from './utils/incidentStatus'
import type { IncidentActivity } from '@/types/incidents'

interface IncidentHistoryItemProps {
  activity: IncidentActivity
  tenantId: string
  incidentId: string
  canManage: boolean
}

const IncidentHistoryItem = ({
  activity,
  tenantId,
  incidentId,
  canManage,
}: IncidentHistoryItemProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedDescription, setEditedDescription] = useState(
    activity.status_description ?? '',
  )
  const updateDescriptionMutation = useUpdateIncidentStatusDescriptionMutation()

  const isUnchanged =
    editedDescription.trim() === (activity.status_description ?? '').trim()

  const handleUpdate = () => {
    if (isUnchanged) {
      return
    }

    updateDescriptionMutation.mutate(
      {
        tenantId,
        incidentId,
        statusId: activity.id,
        data: { status_description: editedDescription.trim() },
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
    setEditedDescription(activity.status_description ?? '')
    setIsEditing(false)
  }

  return (
    <li className="relative flex flex-col items-start gap-1 pl-5">
      <span
        className="absolute left-0 top-1 size-2.5 rounded-full bg-white border-2 border-line-strong"
        aria-hidden="true"
      />
      <Badge
        size="sm"
        className={
          incidentStatusBadgeClass[activity.new_status] ??
          'bg-surface-strong text-muted'
        }
      >
        {incidentStatusLabel[activity.new_status]}
      </Badge>

      {isEditing ? (
        <div key="editing" className="flex flex-col gap-2 w-full max-w-2xl">
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            placeholder="Add a message about this status update"
            rows={2}
            className="resize-y"
          />
          <div className="flex items-center justify-end gap-6">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleCancel}
              disabled={updateDescriptionMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleUpdate}
              disabled={isUnchanged || updateDescriptionMutation.isPending}
            >
              {updateDescriptionMutation.isPending ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </div>
      ) : (
        activity.status_description && (
          <div key="viewing" className="group/desc flex items-center gap-1.5">
            <ClampedText
              text={activity.status_description}
              lines={5}
              className="text-sm text-body"
            />
            {canManage && (
              <div className="opacity-0 group-hover/desc:opacity-100 transition-opacity">
                <IconButton
                  icon={<PencilSquareIcon className="size-4" />}
                  label="Edit message"
                  onClick={() => setIsEditing(true)}
                  className="text-muted hover:bg-surface-strong hover:text-brand"
                />
              </div>
            )}
          </div>
        )
      )}

      <p className="text-[13px] text-subtle break-words max-w-md">
        Updated {formatDateTimeWithSeconds(activity.created_at)} (UTC) by{' '}
        {activity.changed_by}
      </p>
    </li>
  )
}

export default IncidentHistoryItem
