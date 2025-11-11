import type { StatusItemType } from '@/types/common'
import StatusGroup from './StatusGroup'
import { getStatusClass } from '@/utils/status'

type ViewGroupProps = {
  name: string
  alias: string
  items: StatusItemType[]
  iconMode: string
  textMode: string
  columns: string
}

export default function ViewGroup(props: ViewGroupProps) {
  return (
    <StatusGroup
      name={props.name}
      alias={props.alias}
      items={props.items}
      group=""
      iconMode={props.iconMode}
      textMode={props.textMode}
      columns={props.columns}
      getStatusClass={getStatusClass}
      onItemsChange={() => {}}
      onRename={() => {}}
      onRemove={() => {}}
      onChangeAlias={() => {}}
      readOnly
    />
  )
}
