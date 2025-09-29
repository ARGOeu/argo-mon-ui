import StatusLabel from '@/components/StatusLabel'
import { GripVertical } from 'lucide-react'
import { StatusIcon } from './StatusIcon'

interface StatusItemProps {
  group: string
  name: string
  status?: string
  type?: string
  drag?: boolean
  dragHandle?: string
  alias?: string
  onChangeAlias: (itemName: string, newAlias: string) => void
}

export const StatusItem = (props: StatusItemProps) => {
  const handleLocalAliasChange = (newAlias: string) => {
    props.onChangeAlias(props.name, newAlias)
  }

  return (
    <div className="flex flex-row justify-between border rounded p-2 my-2 shadow align-middle">
      <div>
        {props.dragHandle && (
          <div className={`${props.dragHandle} cursor-grab`}>
            <GripVertical className="text-gray-400 h-4 w-4 inline-block" />
          </div>
        )}
      </div>
      <div>
        <StatusLabel
          group={props.group}
          label={props.name}
          alias={props.alias || ''}
          onChangeAlias={handleLocalAliasChange}
        />
      </div>
      <div>
        {props.status && (
          <div className="tooltip tooltip-left" data-tip={props.status}>
            <StatusIcon status={props.status} iconMode="icon" textMode="text" />
          </div>
        )}
      </div>
    </div>
  )
}
