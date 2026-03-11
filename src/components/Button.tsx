import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline-primary'
  | 'outline-secondary'
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
  href?: string
}

const variantClassMap: Record<ButtonVariant, string> = {
  primary:
    'bg-brand text-white border-brand hover:bg-brand-strong hover:border-brand-strong',
  secondary:
    'bg-gray-600 text-white border-gray-600 hover:bg-gray-700 hover:border-gray-700',
  'outline-primary':
    'bg-white text-brand border-brand font-medium hover:bg-brand-subtle',
  'outline-secondary':
    'bg-white text-body border-line-strong font-medium hover:bg-surface-strong hover:border-gray-400',
}

const sizeClassMap: Record<ButtonSize, string> = {
  xs: 'px-2 py-1.5 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-[0.9375rem]',
  lg: 'px-6 py-2 text-base',
}

function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  href,
  children,
  ...props
}: ButtonProps) {
  const buttonClasses = [
    'inline-flex items-center justify-center gap-2 font-base rounded-md border transition-colors cursor-pointer',
    'focus:outline-none',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    variantClassMap[variant],
    sizeClassMap[size],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (href) {
    return (
      <Link to={href} className={buttonClasses}>
        {children}
      </Link>
    )
  }

  return (
    <button className={buttonClasses} disabled={disabled} {...props}>
      {children}
    </button>
  )
}

export default Button
