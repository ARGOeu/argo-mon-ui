import { getStatusClass } from '@/utils/status'

interface ViewItemProps {
  name: string
  status?: string
  type?: string
  alias?: string
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
              <div></div>
              <div
                aria-label="status"
                className={`status status-lg ${getStatusClass(props.status)}`}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
