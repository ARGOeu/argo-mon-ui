interface BadgeProps {
  children: React.ReactNode
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses: Record<string, string> = {
  xs: 'px-2 py-0.5 text-xs font-medium',
  sm: 'px-2.5 py-0.5 text-xs font-medium',
  md: 'px-2.5 py-1 text-xs font-semibold',
  lg: 'px-3 py-1 text-sm font-semibold',
  xl: 'px-3.5 py-1.5 text-sm font-semibold',
}

const Badge = ({ children, size = 'md', className = '' }: BadgeProps) => {
  return (
    <span
      className={`inline-flex items-center rounded-full whitespace-nowrap ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  )
}

export default Badge
