import { getStatusClass } from "../utils/status"

interface StatusItemProps {
    name: string
    status?: string
    type?: string
    drag?: boolean
    dragHandle?: string
    alias?: string
}



export const StatusItem = (props: StatusItemProps) => {



    return (
        <div className="flex flex-row justify-between border rounded p-2 my-2 shadow align-middle">
            <div>
                {props.dragHandle &&
                    <div>::</div>
                }
            </div>
            <div>{props.alias ?? props.name}</div>
            <div>
                {props.status &&
                    <div className="tooltip tooltip-left" data-tip={props.status}>
                        <div aria-label="status" className={`status status-lg ${getStatusClass(props.status)}`}></div>
                    </div>
                }
            </div>
        </div>
    )
}