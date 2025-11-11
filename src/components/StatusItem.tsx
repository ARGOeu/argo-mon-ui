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
  textMode: string
  iconMode: string
  onChangeAlias: (itemName: string, newAlias: string) => void
  readOnly?: boolean
}

export const StatusItem = (props: StatusItemProps) => {
  const handleLocalAliasChange = (newAlias: string) => {
    props.onChangeAlias(props.name, newAlias)
  }

  return (
    <div
      className={`${props.dragHandle || ''} ${!props.readOnly ? 'cursor-grab' : ''} flex flex-row justify-between items-center border border-gray-200 rounded-lg px-3 py-2 ${!props.readOnly ? 'shadow-sm' : ''} align-middle bg-white ${!props.readOnly ? 'hover:bg-gray-50 hover:shadow' : ''} transition-all`}
    >
      {props.dragHandle && !props.readOnly && (
        <GripVertical className="text-gray-400 h-4 w-4 inline-block mr-2" />
      )}
      <div className="flex-1 cursor-text">
        <StatusLabel
          group={props.group}
          label={props.name}
          alias={props.alias || ''}
          onChangeAlias={handleLocalAliasChange}
          readOnly={props.readOnly}
        />
      </div>
      <div>
        {props.status && (
          <div
            className={props.readOnly ? '' : 'tooltip tooltip-left'}
            data-tip={props.readOnly ? '' : props.status}
          >
            <StatusIcon
              status={props.status}
              iconMode={props.iconMode}
              textMode={props.textMode}
            />
          </div>
        )}
      </div>
    </div>
  )
}
