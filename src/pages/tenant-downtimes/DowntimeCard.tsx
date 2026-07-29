import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/16/solid'
import Badge from '@/components/Badge'
import IconButton from '@/components/IconButton'
import { formatDateTimeUTC } from './utils/downtimeGrouping'
import {
  downtimeSeverityBadgeClass,
  downtimeClassificationBadgeClass,
} from './utils/downtimeBadges'
import type { Downtime } from '@/types/downtimes'

const stripHostnameSuffix = (hostname?: string): string =>
  hostname?.split('_')[0] ?? ''

interface DowntimeCardProps {
  downtime: Downtime
  canManage: boolean
  onEdit: (downtime: Downtime) => void
  onDeleteClick: (downtime: Downtime) => void
}

const DowntimeCard = ({
  downtime,
  canManage,
  onEdit,
  onDeleteClick,
}: DowntimeCardProps) => {
  const [expanded, setExpanded] = useState(false)
  const hasServices = downtime.services && downtime.services.length > 0

  return (
    <div className="flex items-start justify-between gap-4 px-4 py-2.5">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-foreground font-medium break-words">
            {downtime.name}
          </span>
          <Badge
            size="sm"
            className={
              downtimeSeverityBadgeClass[downtime.severity?.toUpperCase()] ??
              'bg-gray-100 text-gray-600'
            }
          >
            {downtime.severity}
          </Badge>
          <Badge
            size="sm"
            className={
              downtimeClassificationBadgeClass[
                downtime.classification?.toUpperCase()
              ] ?? 'bg-gray-100 text-gray-600'
            }
          >
            {downtime.classification}
          </Badge>
        </div>
        {downtime.message && (
          <p
            title={downtime.message}
            className="text-xs text-subtle line-clamp-2 mt-1"
          >
            {downtime.message}
          </p>
        )}
        <p className="text-xs text-muted mt-1">
          {formatDateTimeUTC(downtime.scheduled_at)} to{' '}
          {formatDateTimeUTC(downtime.completed_at)} (UTC)
        </p>

        {hasServices && (
          <div className="mt-1.5">
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="text-xs text-brand font-medium flex items-center gap-1 hover:text-brand-strong transition-colors focus:outline-none cursor-pointer"
            >
              {expanded ? (
                <ChevronUp className="size-3" />
              ) : (
                <ChevronDown className="size-3" />
              )}
              {expanded ? 'Hide affected endpoints' : 'Show affected endpoints'}
            </button>
            {expanded && (
              <ul className="mt-1 text-xs text-muted bg-surface-muted rounded-lg border border-line p-2.5 space-y-1">
                {downtime.services.map((service) => (
                  <li key={service.id}>
                    <span className="text-foreground">
                      {stripHostnameSuffix(service.hostname)}
                    </span>{' '}
                    <span className="text-subtle">· {service.service}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      {canManage && (
        <div className="flex items-center gap-1 shrink-0">
          <IconButton
            icon={<PencilSquareIcon className="size-4 md:size-5" />}
            label="Edit"
            onClick={() => onEdit(downtime)}
            className="text-muted hover:bg-surface-strong"
          />
          <IconButton
            icon={<TrashIcon className="size-4 md:size-5" />}
            label="Delete"
            onClick={() => onDeleteClick(downtime)}
            className="text-red-600 hover:bg-red-50"
          />
        </div>
      )}
    </div>
  )
}

export default DowntimeCard
