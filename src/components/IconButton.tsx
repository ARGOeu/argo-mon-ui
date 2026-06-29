import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'

interface IconButtonProps {
  icon: ReactElement
  label: string
  onClick?: () => void
  href?: string
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const IconButton = ({
  icon,
  label,
  onClick,
  href,
  className = '',
  disabled = false,
  type = 'button',
}: IconButtonProps) => {
  const baseClasses = `p-1.5 rounded-lg transition-all cursor-pointer border-none bg-transparent tooltip focus:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50 disabled:cursor-not-allowed ${className}`

  if (href) {
    return (
      <Link
        to={href}
        aria-label={label}
        data-tip={label}
        className={baseClasses}
      >
        {icon}
      </Link>
    )
  }

  return (
    <button
      type={type}
      aria-label={label}
      data-tip={label}
      onClick={onClick}
      disabled={disabled}
      className={baseClasses}
    >
      {icon}
    </button>
  )
}

export default IconButton
