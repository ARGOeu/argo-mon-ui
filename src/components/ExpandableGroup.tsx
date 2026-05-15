import { useState } from 'react'
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/16/solid'
import type { StatusItemType } from '@/types/common'
import { StatusIcon } from '@/pages/build-status-page/StatusIcon'

const STATUS_PRIORITY: Record<string, number> = {
  OK: 0,
  UNKNOWN: 1,
  DOWNTIME: 2,
  MISSING: 3,
  WARNING: 4,
  CRITICAL: 5,
}

const STATUS_BG: Record<string, string> = {
  CRITICAL: 'bg-red-50 border-red-200',
  WARNING: 'bg-amber-50 border-amber-200',
  MISSING: 'bg-blue-50 border-blue-200',
  UNKNOWN: 'bg-gray-50 border-gray-200',
  DOWNTIME: 'bg-gray-100 border-gray-300',
  OK: 'bg-green-50 border-green-200',
}

function computeGroupStatus(items: StatusItemType[]): string {
  if (!items.length) return 'UNKNOWN'
  return items.reduce((worst, item) => {
    const priority = STATUS_PRIORITY[item.status] ?? -1
    return priority > (STATUS_PRIORITY[worst] ?? -1) ? item.status : worst
  }, 'OK')
}

type Props = {
  name: string
  alias: string
  items: StatusItemType[]
  iconMode: string
  textMode: string
  columns?: string
  defaultOpen?: boolean
}

export default function ExpandableGroup({
  name,
  alias,
  items,
  iconMode,
  textMode,
  columns = 'one',
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const groupStatus = computeGroupStatus(items)
  const bgClass = STATUS_BG[groupStatus] ?? STATUS_BG.UNKNOWN

  return (
    <div className={`rounded-xl border ${bgClass} overflow-hidden`}>
      <button
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3">
          {open ? (
            <ChevronDownIcon className="size-5" />
          ) : (
            <ChevronRightIcon className="size-5" />
          )}
          <span className="font-semibold text-foreground text-base">
            {alias || name}
          </span>
          <span className="text-sm text-muted">
            ({items.length} resource{items.length !== 1 ? 's' : ''})
          </span>
        </div>
        <StatusIcon status={groupStatus} iconMode={iconMode} textMode={textMode} />
      </button>

      {open && (
        <div className={`border-t border-line ${columns === 'two' ? 'grid grid-cols-2' : ''}`}>
          {items.map((item, index) => (
            <div
              key={item.name}
              className={`flex items-center justify-between px-8 py-3 border-b border-line bg-white ${
                columns === 'two'
                  ? index % 2 === 0 ? 'border-r border-line' : ''
                  : 'last:border-b-0'
              }`}
            >
              <span className="text-sm text-body">{item.alias || item.name}</span>
              <StatusIcon
                status={item.status}
                iconMode={iconMode}
                textMode={textMode}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
