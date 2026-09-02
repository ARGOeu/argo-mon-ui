import { useState } from 'react'
import { useAddIncidentCommentMutation } from '@/hooks/useIncidents'
import { toast } from 'sonner'
import Button from '@/components/Button'
import IncidentCommentItem from './IncidentCommentItem'
import type { IncidentComment } from '@/types/incidents'

interface IncidentCommentsProps {
  tenantId: string
  incidentId: string
  comments: IncidentComment[]
  canManage: boolean
}

const IncidentComments = ({
  tenantId,
  incidentId,
  comments,
  canManage,
}: IncidentCommentsProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [commentText, setCommentText] = useState('')
  const addCommentMutation = useAddIncidentCommentMutation()

  const handleAddComment = () => {
    if (!commentText.trim()) {
      return
    }

    addCommentMutation.mutate(
      { tenantId, incidentId, data: { comment: commentText.trim() } },
      {
        onSuccess: () => {
          toast.success('Comment added successfully!')
          setCommentText('')
          setIsExpanded(false)
        },
        onError: (error) => {
          toast.error(`Failed to add comment: ${error.message}`)
        },
      },
    )
  }

  const handleCancel = () => {
    setCommentText('')
    setIsExpanded(false)
  }

  if (comments.length === 0 && !canManage) {
    return null
  }

  return (
    <div>
      <h2 className="text-base font-semibold text-foreground mt-1.5 mb-1">
        Comments
      </h2>
      {comments.length > 0 && (
        <ul className="flex flex-col gap-2 mb-3">
          {comments.map((comment) => (
            <IncidentCommentItem key={comment.id} comment={comment} />
          ))}
        </ul>
      )}
      {canManage &&
        (isExpanded ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share an update or note about this incident"
              rows={2}
              className="resize-y"
            />
            <div className="flex items-center justify-end gap-6">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleCancel}
                disabled={addCommentMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddComment}
                disabled={!commentText.trim() || addCommentMutation.isPending}
              >
                {addCommentMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setIsExpanded(true)}
            >
              Add Comment
            </Button>
          </div>
        ))}
    </div>
  )
}

export default IncidentComments
