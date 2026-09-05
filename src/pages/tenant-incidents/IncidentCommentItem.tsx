import ClampedText from '@/components/ClampedText'
import { formatDateTimeWithSeconds } from './utils/incidentDate'
import type { IncidentComment } from '@/types/incidents'

interface IncidentCommentItemProps {
  comment: IncidentComment
}

const IncidentCommentItem = ({ comment }: IncidentCommentItemProps) => (
  <li className="bg-surface-muted rounded-lg px-2 py-1">
    <ClampedText
      text={comment.comment}
      lines={3}
      className="text-sm text-body"
    />

    <p className="text-[13px] text-subtle break-words max-w-md mt-1">
      {formatDateTimeWithSeconds(comment.created_at)} (UTC) by{' '}
      {comment.created_by}
    </p>
  </li>
)

export default IncidentCommentItem
