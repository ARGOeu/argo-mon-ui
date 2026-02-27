import { Link, NavLink, Outlet, useMatch } from 'react-router'
import { useAuth } from './auth/useAuth'
import { useState } from 'react'
import {
  ArrowLeftStartOnRectangleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  FolderIcon,
  UserGroupIcon,
  EnvelopeIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/16/solid'
import LoginPrompt from './components/LoginPrompt'

function SidebarNavItem({
  to,
  children,
  end,
  onClick,
}: {
  to: string
  end?: boolean
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isSuperAdmin = profile?.roles?.includes('super_admin')
  // check to see if we are on tenant details route
  const tDetsRoute = useMatch('/tenants/:id/details')

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <div className="h-screen flex overflow-hidden">
      {!isMobileMenuOpen && (
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden sticky w-10 h-10 top-6 left-3 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
          aria-label="Open menu"
        >
          <Bars3Icon className="size-6 text-gray-700" />
        </button>
      )}

      {isMobileMenuOpen && (
        <div
          className="md:hidden sticky w-10 h-10 inset-0 bg-black/40 z-30 "
          onClick={closeMobileMenu}
        />
      )}

      <aside
        className={`
          w-56 md:w-64 bg-gray-50 border-r border-gray-200 flex flex-col overflow-y-auto overflow-x-hidden
          fixed md:static inset-y-0 left-0 z-40
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="px-1 md:px-3 border-b border-gray-200 flex items-center justify-between gap-1">
          <div
            className="flex items-center gap-2 cursor-pointer py-1"
            onClick={() => window.location.replace('/')}
          >
            <img
              src="/ARGO_LOGO_COLOR_ENG_TITLE.png"
              alt="tenant logo"
              className="h-18 w-auto"
            />
          </div>

          <button
            aria-label="Close menu"
            className="fixed left-45 z-100 md:hidden p-[4px] bg-white border-1 border-gray-300 rounded-lg shadow-xs hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={closeMobileMenu}
          >
            <XMarkIcon className="size-6 text-gray-600" />
          </button>
        </div>

        {authenticated ? (
          <nav className="flex-1 py-4 flex flex-col gap-y-1">
            {isSuperAdmin && (
              <SidebarNavItem to="/administration" onClick={closeMobileMenu}>
                <UserGroupIcon className="size-5" aria-hidden />
                Administration
              </SidebarNavItem>
            )}
            <SidebarNavItem to="/my-invitations" onClick={closeMobileMenu}>
              <EnvelopeIcon className="size-5" aria-hidden />
              My Invitations
            </SidebarNavItem>
            <SidebarNavItem to="/tenants" onClick={closeMobileMenu}>
              <ServerStackIcon className="size-5" aria-hidden />
              Tenants
            </SidebarNavItem>
            {isSuperAdmin && (
              <SidebarNavItem to="/projects" onClick={closeMobileMenu}>
                <FolderIcon className="size-5" aria-hidden />
                Projects
              </SidebarNavItem>
            )}
            <SidebarNavItem to="/status-pages/view" onClick={closeMobileMenu}>
              <RectangleStackIcon className="size-5" aria-hidden />
              Status Pages
            </SidebarNavItem>
          </nav>
        ) : (
          <div className="flex-1 flex items-start justify-center px-6 pt-20">
            <div className="text-center text-gray-500 text-sm">
              <ServerStackIcon className="size-12 mx-auto mb-3 text-blue-700" />
              <p className="font-medium text-gray-700 mb-1">
                Status Pages Management
              </p>
              <p>Please login to access the application</p>
            </div>
          </div>
        )}

        <div className="border-t border-gray-200">
          {authenticated && profile?.name ? (
            <div className="py-4 px-2 md:px-4">
              <div className="flex items-center justify-between gap-1 text-sm text-gray-700">
                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="tooltip"
                  data-tip="View Profile"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1 hover:bg-gray-100 p-2 -m-2 rounded-lg w-auto max-w-40 md:max-w-48">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      {(profile.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate font-medium" title={profile.name}>
                      {profile.name || 'User'}
                    </div>
                  </div>
                </Link>
                <button
                  className="me-2 p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 cursor-pointer tooltip"
                  data-tip="Logout"
                  onClick={logout}
                  type="button"
                >
                  <ArrowLeftStartOnRectangleIcon className="size-5 text-gray-600" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </aside>

      {/* Page content */}
      <main className="flex-1 bg-white overflow-auto">
        <div
          className={`${tDetsRoute ? '' : 'container mx-2 md:mx-auto py-6 px-4 md:px-6'}`}
        >
          {!authenticated ? (
            <LoginPrompt
              title="Authentication Required"
              description="Please login to access the status pages management"
              onLogin={login}
            />
          ) : (
            <Outlet />
          )}
        </div>
      </main>
    </div>
  )
}
