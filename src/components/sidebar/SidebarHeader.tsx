import { Link } from 'react-router'
import { XMarkIcon } from '@heroicons/react/16/solid'

interface SidebarHeaderProps {
  onCloseMobileMenu: () => void
}

export default function SidebarHeader({
  onCloseMobileMenu,
}: SidebarHeaderProps) {
  return (
    <div className="px-1 md:px-3 border-b border-line flex items-center justify-between gap-1">
      <Link to="/" className="flex items-center gap-2 py-1">
        <img
          src="/ARGO_LOGO_COLOR_ENG_TITLE.png"
          alt="tenant logo"
          className="h-18 w-auto"
        />
      </Link>

      <button
        aria-label="Close menu"
        className="fixed left-45 z-100 md:hidden p-[4px] bg-white border border-line-strong rounded-lg shadow-xs hover:bg-surface-muted transition-colors cursor-pointer"
        onClick={onCloseMobileMenu}
      >
        <XMarkIcon className="size-6 text-muted" />
      </button>
    </div>
  )
}
