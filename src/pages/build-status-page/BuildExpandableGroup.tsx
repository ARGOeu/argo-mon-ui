import { useState, useEffect, useRef } from 'react'
import { useDragAndDrop } from '@formkit/drag-and-drop/react'
import {
  ChevronDownIcon,
  ChevronRightIcon,
  TrashIcon,
} from '@heroicons/react/16/solid'
import { GripVertical } from 'lucide-react'
import type { StatusItemType } from '@/types/common'
import Button from '@/components/Button'
import { StatusIcon } from '@/pages/build-status-page/StatusIcon'
import StatusLabel from '@/pages/build-status-page/StatusLabel'

type Props = {
  name: string
  alias: string
  items: StatusItemType[]
  iconMode: string
  textMode: string
  columns?: string
  group: string
  onRename: (alias: string) => void
  onRemove: () => void
  onItemsChange: (items: StatusItemType[]) => void
  onChangeAlias: (itemName: string, newAlias: string) => void
}

const BuildExpandableGroup = ({
  name,
  alias,
  items,
  iconMode,
  textMode,
  columns = 'one',
  group,
  onRename,
  onRemove,
  onItemsChange,
  onChangeAlias,
}: Props) => {
  const [open, setOpen] = useState(true)

  const [listRef, orderedItems, setOrderedItems] = useDragAndDrop<
    HTMLUListElement,
    StatusItemType
  >(items, { group, dragHandle: '.dnd-handle' })

  const prev = useRef<StatusItemType[] | null>(null)

  useEffect(() => {
    if (prev.current !== orderedItems) {
      prev.current = orderedItems
      onItemsChange(orderedItems)
    }
  }, [orderedItems, onItemsChange])

  const handleLocalAliasChange = (itemName: string, newAlias: string) => {
    setOrderedItems((prevItems) =>
      prevItems.map((item) =>
        item.name === itemName ? { ...item, alias: newAlias } : item,
      ),
    )
    onChangeAlias(itemName, newAlias)
  }

  return (
    <div className="rounded-xl border border-line">
      <div
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer bg-surface-muted rounded-t-xl"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3">
          {open ? (
            <ChevronDownIcon className="size-5" />
          ) : (
            <ChevronRightIcon className="size-5" />
          )}
          <div onClick={(e) => e.stopPropagation()}>
            <StatusLabel
              group={name}
              label={name}
              alias={alias}
              onChangeAlias={onRename}
              isGroupLabel
            />
          </div>
          <span className="text-sm text-muted">
            ({orderedItems.length} resource
            {orderedItems.length !== 1 ? 's' : ''})
          </span>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <Button
            className="p-0 tooltip tooltip-left ml-2 flex-shrink-0"
            size="sm"
            variant="outline-secondary"
            onClick={onRemove}
            data-tip="Remove group"
          >
            <TrashIcon className="size-4 text-subtle hover:text-muted" />
          </Button>
        </div>
      </div>

      <div
        className={`border-t border-line rounded-b-xl overflow-hidden${open ? '' : ' hidden'}`}
      >
        <ul
          ref={listRef}
          className={columns === 'two' ? 'grid grid-cols-2' : ''}
        >
          {orderedItems.map((item, index) => (
            <li
              key={item.name}
              className={`border-b border-line bg-white ${
                columns === 'two'
                  ? index % 2 === 0
                    ? 'border-r border-line'
                    : ''
                  : 'last:border-b-0'
              }`}
            >
              <div className="dnd-handle cursor-grab flex items-center gap-3 px-8 py-3 w-full">
                <GripVertical className="text-subtle h-4 w-4 flex-shrink-0" />
                <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                  <StatusLabel
                    group={name}
                    label={item.name}
                    alias={item.alias || ''}
                    onChangeAlias={(newAlias) =>
                      handleLocalAliasChange(item.name, newAlias)
                    }
                  />
                  <StatusIcon
                    status={item.status}
                    iconMode={iconMode}
                    textMode={textMode}
                  />
                </div>
              </div>
            </li>
          ))}
          {orderedItems.length === 0 && (
            <li className="text-xs text-subtle px-3 py-4 border border-dashed border-line-strong text-center mx-5 my-2 rounded">
              Drop items here
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}

export default BuildExpandableGroup
