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
      <div className="flex flex-row flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2">
        <div className="flex-1 min-w-0">
          <h6
            style={{
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            {props.alias || props.name}
          </h6>
        </div>
        <div className="flex-shrink-0">
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
