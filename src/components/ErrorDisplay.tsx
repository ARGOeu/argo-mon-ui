import { ExclamationCircleIcon } from '@heroicons/react/16/solid'

interface ErrorDisplayProps {
  error: Error | { message: string } | string
  context?: string
}

const MAX_MESSAGE_LENGTH = 300

const ErrorDisplay = ({ error, context = 'data' }: ErrorDisplayProps) => {
  const errorMessage =
    typeof error === 'string' ? error : error?.message || 'An error occurred'

  const errorMessageLower = errorMessage.toLowerCase()

  const isUnauthorized =
    errorMessageLower.includes('status code 401') ||
    errorMessageLower.includes('unauthorized')
  const isForbidden =
    errorMessageLower.includes('status code 403') ||
    errorMessageLower.includes('forbidden')

  const getTitle = () => {
    if (isUnauthorized) return 'Authentication Required'
    if (isForbidden) return 'Access Denied'
    return `Error Loading ${context.charAt(0).toUpperCase() + context.slice(1)}`
  }

  const getMessage = () => {
    if (isUnauthorized) {
      return 'Your session has expired or you are not authenticated. Please log in again'
    }
    if (isForbidden) {
      return `You do not have permission to view this ${context}`
    }
    return errorMessage
  }

  const message = getMessage()
  const isTruncated = message.length > MAX_MESSAGE_LENGTH
  const displayMessage = isTruncated
    ? `${message.substring(0, MAX_MESSAGE_LENGTH)}...`
    : message

  return (
    <div className="flex flex-col items-center justify-center gap-1 p-3 bg-red-50 border border-red-200 rounded-lg my-1 text-center">
      <ExclamationCircleIcon className="size-6 text-red-700" />
      <h2 className="text-base font-semibold text-red-800">{getTitle()}</h2>
      <p
        className="text-sm text-red-800 max-w-[600px] overflow-hidden text-ellipsis"
        title={isTruncated ? message : undefined}
      >
        {displayMessage}
      </p>
    </div>
  )
}

export default ErrorDisplay
