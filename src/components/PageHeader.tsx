import { ArrowLeftIcon } from '@heroicons/react/16/solid'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

interface NavigateTo {
  label: string
  to: string
  onClick?: () => void
}

interface PageHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  children?: ReactNode
  className?: string
  navigateTo?: NavigateTo
}

const PageHeader = ({
  title,
  subtitle,
  children,
  className,
  navigateTo,
}: PageHeaderProps) => (
  <div className={`flex justify-between items-center ${className ?? ''}`}>
    <div>
      {navigateTo && (
        <Link
          to={navigateTo.to}
          onClick={navigateTo.onClick}
          className="inline-flex items-center gap-1.5 text-base text-subtle hover:text-foreground no-underline mb-1 transition-colors"
        >
          <ArrowLeftIcon className="size-4" />
          {navigateTo.label}
        </Link>
      )}
      <h1 className="text-[1.6rem] leading-8 font-bold text-gray-800">
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
