import ClampedText from '@/components/ClampedText'
import { formatDateTime } from '@/utils/formatDateTime'
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
      {formatDateTime(comment.created_at, {
        weekday: true,
        seconds: true,
        utcSuffix: true,
      })}{' '}
      by {comment.created_by}
    </p>
  </li>
)

export default IncidentCommentItem
