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
        return <CheckCircleIcon className="size-4 text-green-700" />
      case 'CRITICAL':
        return <XCircleIcon className="size-4 text-red-700" />
      case 'WARNING':
        return <ExclamationTriangleIcon className="size-4 text-amber-300" />
      case 'MISSING':
        return <ExclamationCircleIcon className="size-4 text-blue-300" />
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
        return (
          <span className="text-white text-sm bg-text-green-700 rounded-2xl">
            {status}
          </span>
        )
      case 'CRITICAL':
        return (
          <span className="text-white text-sm  bg-text-red-700 rounded-2xl ">
            {status}
          </span>
        )
      case 'WARNING':
        return (
          <span className="text-white text-sm  bg-text-amber-700 rounded-2xl">
            {status}
          </span>
        )
      case 'MISSING':
        return (
          <span className="text-whitebg-text-blue-700  text-sm  rounded-2xl">
            {status}
          </span>
        )
      case 'UNKNOWN':
        return (
          <span className="text-white bg-text-gray-700 text-sm  rounded-2xl">
            {status}
          </span>
        )
      case 'DOWNTIME':
        return (
          <span className="text-white bg-text-black text-sm  rounded-2xl">
            {status}
          </span>
        )
    }
  }

  let iconElement = null
  let textElement = null

  if (props.iconMode == 'icon') {
    iconElement = <div aria-label="status">{getStatusIcon(props.status)}</div>
  } else if (props.iconMode == 'status') {
    ;<div
      aria-label="status"
      className={`status status-lg ${getStatusClass(props.status)}`}
    ></div>
  }

  if (props.textMode == 'text') {
    textElement = <div aria-label="status">{getText(props.status)}</div>
  } else if (props.textMode == 'badge') {
    textElement = <div aria-label="status">{getBadge(props.status)}</div>
  }

  return (
    <div className="flex flex-row items-center  gap-2">
      {textElement}
      {iconElement}
    </div>
  )
}
