import { ArrowPathIcon } from '@heroicons/react/24/outline'

type LoadingSpinnerProps = {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  inline?: boolean
}

const sizeClasses = {
  xs: 'size-6',
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-12',
  xl: 'size-14',
}

export default function LoadingSpinner({
  size = 'md',
  className = '',
  inline = false,
}: LoadingSpinnerProps) {
  const sizeClass = sizeClasses[size]
  const inlineClass = inline ? 'inline-block' : ''
  const combinedClassName =
    `animate-spin ${sizeClass} text-blue-400 ${inlineClass} ${className}`.trim()

  return <ArrowPathIcon className={combinedClassName} />
}
