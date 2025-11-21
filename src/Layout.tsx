import { Link, NavLink, Outlet } from 'react-router'
import { useAuth } from './auth/useAuth'
import {
  ArrowLeftStartOnRectangleIcon,
  ServerStackIcon,
  WrenchScrewdriverIcon,
  RectangleStackIcon,
  DocumentPlusIcon,
} from '@heroicons/react/16/solid'
import { squishEmail } from './utils/profile'
import { Button } from './components/Button'

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
          'flex items-center gap-3 px-4 py-3 text-sm transition-colors rounded-md mx-2',
          isActive
            ? 'bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-600'
            : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600',
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
        <div className="px-3 border-b border-gray-200">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => window.location.replace('/')}
          >
            <img
              src="/ARGO_LOGO_COLOR_ENG_TITLE.png"
              alt="ARGO Logo"
              className="h-18 w-auto"
            />
          </div>
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-y-1">
          <SidebarNavItem to="/tenants/view">
            <ServerStackIcon className="size-5" aria-hidden />
            Tenants
          </SidebarNavItem>
          <SidebarNavItem to="/tenants/create">
            <DocumentPlusIcon className="size-5" aria-hidden />
            Create a Tenant
          </SidebarNavItem>
          <SidebarNavItem to="/status-pages/view">
            <RectangleStackIcon className="size-5" aria-hidden />
            Status Pages
          </SidebarNavItem>
          <SidebarNavItem to="/status-pages/build">
            <WrenchScrewdriverIcon className="size-5" aria-hidden />
            Build a Status Page
          </SidebarNavItem>
        </nav>

        <div className="border-t border-gray-200">
          {authenticated && (profile?.username || profile?.sub) ? (
            <div className="p-4">
              <div className="flex items-center justify-between text-sm text-gray-700">
                <Link to="/profile">
                  <div className="flex items-center gap-2 min-w-0 flex-1 hover:opacity-90">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      {(profile.username || profile.sub || 'U')
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div className="truncate font-medium">
                      {profile.username || squishEmail(profile.sub || '')}
                    </div>
                  </div>
                </Link>
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
              <Button
                variant="primary"
                size="sm"
                onClick={login}
                className="w-full"
              >
                Login
              </Button>
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
