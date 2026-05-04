import { Link } from 'react-router'
import { ArrowLeftStartOnRectangleIcon } from '@heroicons/react/16/solid'
import type { AuthContextType } from '@/auth/context'

interface SidebarFooterProps {
  profile: AuthContextType['profile']
  onCloseMobileMenu: () => void
  onLogout: () => void
}

export default function SidebarFooter({
  profile,
  onCloseMobileMenu,
  onLogout,
}: SidebarFooterProps) {
  return (
    <div className="border-t border-line">
      <div className="py-4 px-2 md:px-4">
        <div className="flex items-center justify-between gap-1 text-sm text-body">
          <Link
            to="/profile"
            onClick={onCloseMobileMenu}
            className="tooltip focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            data-tip="View Profile"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1 hover:bg-surface-strong p-2 -m-2 rounded-lg w-auto max-w-40 md:max-w-48">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                {(profile?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div
                className="truncate font-medium"
                title={profile?.name || 'User'}
              >
                {profile?.name || 'User'}
              </div>
            </div>
          </Link>
          <button
            className="p-1 -m-1 rounded-lg transition-colors flex-shrink-0 cursor-pointer tooltip hover:bg-surface-strong"
            data-tip="Logout"
            onClick={onLogout}
            type="button"
          >
            <ArrowLeftStartOnRectangleIcon className="size-5 text-muted" />
          </button>
        </div>
      </div>
    </div>
  )
}
