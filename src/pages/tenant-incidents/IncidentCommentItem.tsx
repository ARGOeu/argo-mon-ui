import ClampedText from '@/components/ClampedText'
import type { IncidentComment } from '@/types/incidents'

const formatCommentDateTime = (isoString: string) =>
  new Date(isoString).toLocaleString('en-GB', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'UTC',
  })

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

    <p className="text-[13px] text-subtle mt-1">
      {formatCommentDateTime(comment.created_at)} (UTC) by {comment.created_by}
    </p>
  </li>
)

export default IncidentCommentItem
