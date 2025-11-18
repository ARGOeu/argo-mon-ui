import { useDragAndDrop } from '@formkit/drag-and-drop/react'

import { useEffect, useRef } from 'react'
import { TrashIcon } from '@heroicons/react/16/solid'
import type { StatusItemType } from '@/types/common'
import { StatusItem } from './StatusItem'
import StatusLabel from './StatusLabel'
import { Button } from './Button'

type StatusGroupProps = {
  name: string
  items: StatusItemType[]
  alias: string
  group: string
  iconMode: string
  textMode: string
  columns: string
  getStatusClass: (s: string) => string
  onItemsChange: (nextItems: StatusItemType[]) => void
  onRename: (nextName: string) => void
  onRemove: () => void
  onChangeAlias: (groupName: string, itemName: string, newAlias: string) => void
  readOnly?: boolean
}

export default function StatusGroup(props: StatusGroupProps) {
  const [listRef, orderedItems, setOrderedItems] = useDragAndDrop<
    HTMLUListElement,
    StatusItemType
  >(props.items, { group: props.group, dragHandle: '.dnd-handle' })

  // notify parent when drag and drop changes this column's content/order
  const prev = useRef<StatusItemType[] | null>(null)

  const handleLocalAliasChange = (itemName: string, newAlias: string) => {
    setOrderedItems((prevOrderedItems) =>
      prevOrderedItems.map((item) =>
        item.name === itemName ? { ...item, alias: newAlias } : item,
      ),
    )
    props.onChangeAlias(props.name, itemName, newAlias)
  }

  const { onItemsChange } = props

  useEffect(() => {
    if (prev.current !== orderedItems) {
      prev.current = orderedItems
      onItemsChange(orderedItems)
    }
  }, [orderedItems, onItemsChange])

  return (
    <div className="mb-5">
      <div className="flex flex-row justify-center items-center px-0 py-2 relative">
        <StatusLabel
          group={props.name}
          label={props.name}
          alias={props.alias}
          onChangeAlias={props.onRename}
          isGroupLabel
          readOnly={props.readOnly}
        />
        {!props.readOnly && (
          <Button
            className="p-0 absolute right-0 tooltip"
            size="sm"
            variant="outline-secondary"
            onClick={props.onRemove}
            data-tip="Remove group"
          >
            <TrashIcon className="size-4 text-gray-400 hover:text-gray-600" />
          </Button>
        )}
      </div>
      <div className="min-h-[50px]">
        <ul
          key={props.name}
          ref={listRef}
          className={`grid ${props.columns === 'two' ? 'grid-cols-2 gap-4' : 'grid-cols-1 gap-2'}`}
        >
          {orderedItems.map((sitem) => (
            <li key={sitem.name}>
              <StatusItem
                group={props.name}
                drag={!props.readOnly}
                dragHandle={props.readOnly ? undefined : 'dnd-handle'}
                name={sitem.name}
                alias={sitem.alias || ''}
                status={sitem.status}
                onChangeAlias={handleLocalAliasChange}
                iconMode={props.iconMode}
                textMode={props.textMode}
                readOnly={props.readOnly}
              />
            </li>
          ))}
          {orderedItems.length === 0 && !props.readOnly && (
            <li className="text-xs text-gray-400 max-h-[300px] px-3 py-4 rounded border border-dashed border-gray-300 text-center">
              Drop items here
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
