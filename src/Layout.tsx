import { NavLink, Outlet } from 'react-router'
import { useAuth } from './auth/useAuth'
import {
  EyeIcon,
  PencilSquareIcon,
  ArrowLeftStartOnRectangleIcon,
} from '@heroicons/react/16/solid'
import { squishEmail } from './utils/profile'

function SidebarNavItem({
  to,
  children,
  end,
}: {
  to: string
  end?: boolean
  children: React.ReactNode
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 px-4 py-3 text-sm transition-colors',
          isActive
            ? 'bg-gray-200 text-gray-900 font-medium'
            : 'text-gray-700 hover:bg-gray-100',
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  )
}

export default function Layout() {
  const { authenticated, profile, login, logout } = useAuth()

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="px-3 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <img
              src="/ARGO_LOGO_b&w_ENG.svg"
              alt="ARGO Logo"
              className="h-10 w-auto"
            />
          </div>
        </div>

        <nav className="flex-1 py-4">
          <SidebarNavItem to="/build">
            <PencilSquareIcon className="size-5" aria-hidden />
            Build
          </SidebarNavItem>
          <SidebarNavItem to="/view">
            <EyeIcon className="size-5" aria-hidden />
            View
          </SidebarNavItem>
        </nav>

        <div className="border-t border-gray-200">
          {authenticated && (profile?.username || profile?.sub) ? (
            <div className="p-4">
              <div className="flex items-center justify-between text-sm text-gray-700">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {(profile.username || profile.sub || 'U')
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div className="truncate font-medium">
                    {profile.username || squishEmail(profile.sub || '')}
                  </div>
                </div>
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded transition-colors flex-shrink-0 cursor-pointer"
                  onClick={logout}
                  title="Logout"
                >
                  <ArrowLeftStartOnRectangleIcon className="size-5 text-gray-600" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <button
                type="button"
                className="w-full btn btn-neutral btn-sm"
                onClick={login}
              >
                Login
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Page content */}
      <main className="flex-1 bg-white overflow-auto">
        <div className="container mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
