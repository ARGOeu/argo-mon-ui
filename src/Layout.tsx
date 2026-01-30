import { Link, NavLink, Outlet } from 'react-router'
import { useAuth } from './auth/useAuth'
import { useRegisterUserMutation } from './hooks/useUsers'
import { useEffect, useRef } from 'react'
import {
  ArrowLeftStartOnRectangleIcon,
  ServerStackIcon,
  WrenchScrewdriverIcon,
  RectangleStackIcon,
  FolderIcon,
  UserGroupIcon,
  EnvelopeIcon,
} from '@heroicons/react/16/solid'
import { squishEmail } from './utils/profile'
import Button from './components/Button'
import LoginPrompt from './components/LoginPrompt'

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
  const registerMutation = useRegisterUserMutation()
  const hasRegistered = useRef(false)

  const isSuperAdmin = profile?.roles?.includes('super_admin')
  const isAdmin = profile?.roles?.includes('admin')
  const isViewer = profile?.roles?.includes('viewer')
  const hasTenantsAccess = isSuperAdmin || isAdmin || isViewer

  // Register user once when authenticated
  useEffect(() => {
    if (authenticated && !hasRegistered.current) {
      hasRegistered.current = true
      registerMutation.mutate()
    }
  }, [authenticated, registerMutation])

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
          {isSuperAdmin && (
            <SidebarNavItem to="/administration">
              <UserGroupIcon className="size-5" aria-hidden />
              Administration
            </SidebarNavItem>
          )}
          {authenticated && (
            <SidebarNavItem to="/my-invitations">
              <EnvelopeIcon className="size-5" aria-hidden />
              My Invitations
            </SidebarNavItem>
          )}
          {hasTenantsAccess && (
            <SidebarNavItem to="/tenants/view">
              <ServerStackIcon className="size-5" aria-hidden />
              Tenants
            </SidebarNavItem>
          )}
          {isSuperAdmin && (
            <SidebarNavItem to="/projects/view">
              <FolderIcon className="size-5" aria-hidden />
              Projects
            </SidebarNavItem>
          )}
          <SidebarNavItem to="/status-pages/view">
            <RectangleStackIcon className="size-5" aria-hidden />
            Status Pages
          </SidebarNavItem>
          <SidebarNavItem to="/status-pages/build">
            <WrenchScrewdriverIcon className="size-5" aria-hidden />
            Build Status Page
          </SidebarNavItem>
        </nav>

        <div className="border-t border-gray-200">
          {authenticated && (profile?.username || profile?.sub) ? (
            <div className="p-4">
              <div className="flex items-center justify-between gap-1 text-sm text-gray-700">
                <Link to="/profile">
                  <div className="flex items-center gap-2 min-w-0 flex-1 hover:opacity-90 w-50">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      {(profile.username || profile.sub || 'U')
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div
                      className="truncate font-medium"
                      title={profile.username || squishEmail(profile.sub || '')}
                    >
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
                onClick={() => login()}
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
