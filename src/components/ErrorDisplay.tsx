import { ExclamationCircleIcon } from '@heroicons/react/16/solid'

interface ErrorDisplayProps {
  error: Error | { message: string } | string
  context?: string
}

const MAX_MESSAGE_LENGTH = 300

const ErrorDisplay = ({ error, context = 'data' }: ErrorDisplayProps) => {
  const errorMessage =
    typeof error === 'string' ? error : error?.message || 'An error occurred'

  const isUnauthorized =
    errorMessage.includes('401') ||
    errorMessage.toLowerCase().includes('unauthorized')
  const isForbidden =
    errorMessage.includes('403') ||
    errorMessage.toLowerCase().includes('forbidden')

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
    <div className="error-container">
      <ExclamationCircleIcon className="error-icon" />
      <h2 className="error-title">{getTitle()}</h2>
      <p className="error-message" title={isTruncated ? message : undefined}>
        {displayMessage}
      </p>
    </div>
  )
}

export default ErrorDisplay
