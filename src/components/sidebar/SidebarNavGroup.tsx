import { useEffect, useId, useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import { ChevronDownIcon } from '@heroicons/react/16/solid'
import SidebarNavItem from './SidebarNavItem'

interface SidebarNavGroupChild {
  to: string
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  exactPathMatch?: boolean
}

interface SidebarNavGroupProps {
  to: string
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  items: SidebarNavGroupChild[]
  onNavigate?: () => void
}

export default function SidebarNavGroup({
  to,
  label,
  icon: Icon,
  items,
  onNavigate,
}: SidebarNavGroupProps) {
  const { pathname } = useLocation()
  const hasActiveChild = items.some((item) => pathname === item.to)
  const [expanded, setExpanded] = useState(hasActiveChild)
  const menuId = useId()

  useEffect(() => {
    if (hasActiveChild) {
      setExpanded(true)
    }
  }, [hasActiveChild])

  return (
    <div>
      <div className="flex items-center gap-1 mx-2">
        <NavLink
          to={to}
          end
          onClick={() => {
            setExpanded(true)
            onNavigate?.()
          }}
          className="flex-1 flex items-center gap-3 px-4 py-2 text-sm transition-colors rounded-md text-body hover:bg-surface-strong hover:text-brand"
        >
          <Icon className="size-4" aria-hidden />
          {label}
        </NavLink>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-label={
            expanded ? `Collapse ${label} menu` : `Expand ${label} menu`
          }
          aria-expanded={expanded}
          aria-controls={menuId}
          className="p-1.5 rounded-md text-muted hover:bg-surface-strong hover:text-brand cursor-pointer flex-shrink-0"
        >
          <ChevronDownIcon
            className={`size-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </button>
      </div>

      {expanded && (
        <div id={menuId} className="ml-3 flex flex-col gap-px">
          {items.map((item) => (
            <SidebarNavItem
              key={item.to}
              to={item.to}
              exactPathMatch={item.exactPathMatch}
              onClick={onNavigate}
            >
              <item.icon className="size-4" aria-hidden />
              {item.label}
            </SidebarNavItem>
          ))}
        </div>
      )}
    </div>
  )
}
