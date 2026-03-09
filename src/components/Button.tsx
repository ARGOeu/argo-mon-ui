import { type ButtonHTMLAttributes, type ReactNode } from 'react'

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
}

const variantClassMap: Record<ButtonVariant, string> = {
  primary:
    'bg-brand text-white border-brand hover:enabled:bg-blue-800 hover:enabled:border-blue-800',
  secondary:
    'bg-gray-600 text-white border-gray-600 hover:enabled:bg-gray-700 hover:enabled:border-gray-700',
  'outline-primary':
    'bg-white text-blue-600 border-blue-600 hover:enabled:bg-brand-subtle',
  'outline-secondary':
    'bg-white text-muted border-gray-600 hover:enabled:bg-surface-muted',
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
  children,
  ...props
}: ButtonProps) {
  const buttonClasses = [
    'inline-flex items-center justify-center gap-2 font-normal rounded-md border transition-colors cursor-pointer',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    variantClassMap[variant],
    sizeClassMap[size],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={buttonClasses} disabled={disabled} {...props}>
      {children}
    </button>
  )
}

export default Button
