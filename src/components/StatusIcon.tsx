import { getStatusClass } from '@/utils/status'
import {
  ArrowDownCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon,
  XCircleIcon,
} from '@heroicons/react/16/solid'

interface StatusIconProps {
  status: string
  iconMode?: string
  textMode?: string
}

export const StatusIcon = (props: StatusIconProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OK':
        return <CheckCircleIcon className="size-4 text-success" />
      case 'CRITICAL':
        return <XCircleIcon className="size-4 text-error" />
      case 'WARNING':
        return <ExclamationTriangleIcon className="size-4 text-warning" />
      case 'MISSING':
        return <ExclamationCircleIcon className="size-4 text-info" />
      case 'UNKNOWN':
        return <QuestionMarkCircleIcon className="size-4 text-gray-400" />
      case 'DOWNTIME':
        return <ArrowDownCircleIcon className="size-4 text-black" />
    }
  }

  const getText = (status: string) => {
    switch (status) {
      case 'OK':
        return <span className="text-green-700 text-sm bold">{status}</span>
      case 'CRITICAL':
        return <span className="text-red-700 text-sm ">{status}</span>
      case 'WARNING':
        return <span className="text-amber-700 text-sm ">{status}</span>
      case 'MISSING':
        return <span className="text-blue-700 text-sm ">{status}</span>
      case 'UNKNOWN':
        return <span className="text-gray-700 text-sm ">{status}</span>
      case 'DOWNTIME':
        return <span className="text-black text-sm ">{status}</span>
    }
  }

  const getBadge = (status: string) => {
    switch (status) {
      case 'OK':
        return <span className="badge badge-success text-sm">{status}</span>
      case 'CRITICAL':
        return (
          <span className="badge badge-error text-white text-sm ">
            {status}
          </span>
        )
      case 'WARNING':
        return <span className="badge badge-warning text-sm">{status}</span>
      case 'MISSING':
        return <span className="badge badge-info  text-sm">{status}</span>
      case 'UNKNOWN':
        return <span className="badge  bg-gray-300 text-sm ">{status}</span>
      case 'DOWNTIME':
        return <span className="badge badge-neutral text-sm ">{status}</span>
    }
  }

  let iconElement = null
  let textElement = null

  if (props.iconMode === 'icon') {
    iconElement = <div aria-label="status">{getStatusIcon(props.status)}</div>
  } else if (props.iconMode === 'led') {
    iconElement = (
      <div
        aria-label="status"
        className={`status status-lg ${getStatusClass(props.status)}`}
      ></div>
    )
  }

  if (props.textMode === 'text') {
    textElement = <div aria-label="status">{getText(props.status)}</div>
  } else if (props.textMode === 'badge') {
    textElement = <div aria-label="status">{getBadge(props.status)}</div>
  }

  return (
    <div className="flex flex-row flex-wrap items-center gap-2">
      {textElement}
      {iconElement}
    </div>
  )
}
