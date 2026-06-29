import { useState } from 'react'
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/16/solid'
import type { StatusItemType } from '@/types/common'
import { StatusIcon } from '@/pages/build-status-page/StatusIcon'

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
  defaultOpen = true,
}: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-xl border border-line overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer bg-surface-muted"
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
      </button>

      {open && (
        <div
          className={`border-t border-line ${columns === 'two' ? 'grid grid-cols-2' : ''}`}
        >
          {items.map((item, index) => (
            <div
              key={item.name}
              className={`flex items-center justify-between px-8 py-3 border-b border-line bg-white ${
                columns === 'two'
                  ? index % 2 === 0
                    ? 'border-r border-line'
                    : ''
                  : 'last:border-b-0'
              }`}
            >
              <span className="text-sm text-body">
                {item.alias || item.name}
              </span>
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
