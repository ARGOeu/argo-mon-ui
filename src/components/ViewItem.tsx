import { StatusIcon } from './StatusIcon'

interface ViewItemProps {
  name: string
  status?: string
  type?: string
  alias?: string
  iconMode: string
  textMode: string
}

export const ViewItem = (props: ViewItemProps) => {
  return (
    <div className="p-2">
      <div className="flex flew-row justify-between px-4 py-2">
        <div>
          <h6>{props.alias || props.name}</h6>
        </div>
        <div>
          {props.status && (
            <div className="tooltip tooltip-left" data-tip={props.status}>
              <StatusIcon
                status={props.status}
                iconMode={props.iconMode}
                textMode={props.textMode}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
