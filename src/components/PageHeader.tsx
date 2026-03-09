import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  children?: ReactNode
  className?: string
}

const PageHeader = ({
  title,
  subtitle,
  children,
  className = 'flex justify-between items-center mb-6',
}: PageHeaderProps) => (
  <div className={className}>
    <div>
      <h1 className="text-[1.75rem] leading-8 font-bold text-gray-800">
        {title}
      </h1>
      {subtitle && <p className="text-base text-muted">{subtitle}</p>}
    </div>
    {children && (
      <div className="flex items-center gap-2 shrink-0">{children}</div>
    )}
  </div>
)

export default PageHeader
