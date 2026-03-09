import type { ReactElement } from 'react'

interface IconButtonProps {
  icon: ReactElement
  label: string
  onClick: () => void
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const IconButton = ({
  icon,
  label,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
}: IconButtonProps) => (
  <button
    type={type}
    aria-label={label}
    data-tip={label}
    onClick={onClick}
    disabled={disabled}
    className={`p-1.5 rounded-lg transition-all cursor-pointer border-none bg-transparent tooltip disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {icon}
  </button>
)

export default IconButton
