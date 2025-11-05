import type { StatusItemType } from '@/types/common'
import { ViewItem } from './ViewItem'

type ViewGroupProps = {
  name: string
  items: StatusItemType[]
  alias: string
  iconMode: string
  textMode: string
  columns: string
}

export default function ViewGroup(props: ViewGroupProps) {
  return (
    <div className="border-neutral-200 border-2 rounded">
      <div className="flex flex-row justify-between align-middle bg-neutral-100 p-2 rounded-t">
        <div></div>
        <h6 className="font-bold">{props.alias ?? props.name}</h6>
        <div></div>
        {/* <button className="btn btn-outline btn-error" onClick={props.onRemove}><TrashIcon className="size-4" /></button> */}
      </div>
      <div className="min-h-[100px]">
        <div key={props.name} className="flex flex-col gap-0">
          <ul
            className={`grid gap-0 ${props.columns === 'two' ? 'grid-cols-2' : 'grid-cols-1'}`}
          >
            {props.items.map((item) => (
              <li className="border-gray-100 border" key={item.name}>
                <ViewItem
                  name={item.name}
                  alias={item.alias || ''}
                  status={item.status}
                  iconMode={props.iconMode}
                  textMode={props.textMode}
                />
              </li>
            ))}
          </ul>
          {props.items.length === 0 && (
            <li className="text-xs text-neutral-500 max-h-[300px] px-2 py-3 rounded border border-dashed m-2">
              Nothing to see here...
            </li>
          )}
        </div>
      </div>
    </div>
  )
}
