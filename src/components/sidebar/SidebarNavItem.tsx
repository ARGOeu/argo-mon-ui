import { NavLink } from 'react-router'

interface SidebarNavItemProps {
  to: string
  exactPathMatch?: boolean
  children: React.ReactNode
  onClick?: () => void
}

export default function SidebarNavItem({
  to,
  children,
  exactPathMatch,
  onClick,
}: SidebarNavItemProps) {
  return (
    <NavLink
      to={to}
      end={exactPathMatch}
      onClick={onClick}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 px-4 py-2 text-sm transition-colors rounded-md mx-2',
          isActive
            ? 'bg-brand-subtle text-brand font-medium border-l-4 border-brand'
            : 'text-body hover:bg-surface-strong hover:text-brand',
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  )
}
