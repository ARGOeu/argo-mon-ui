import { Link, NavLink, Outlet } from 'react-router'
import { useAuth } from './auth/useAuth'
import {
  ChartBarSquareIcon,
  EyeIcon,
  PaintBrushIcon,
  UserIcon,
} from '@heroicons/react/16/solid'
import { squishEmail } from './utils/profile'

function NavItem({
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
          'inline-flex items-center gap-2 px-3 py-2 rounded-md',
          isActive ? 'bg-base-200 font-semibold' : 'hover:bg-base-200',
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
    <div className="min-h-screen flex flex-col dot-pattern">
      <header className="navbar bg-base-100 sticky  top-0 z-40">
        <div className="flex-1 flex items-center gap-6">
          <Link to="/" className="btn btn-ghost text-xl">
            <ChartBarSquareIcon
              className="size-8 text-orange-600"
              aria-hidden
            />
            Argo Status Pages
          </Link>

          <nav className="flex items-center gap-2">
            {authenticated && (
              <>
                <NavItem to="/build">
                  <PaintBrushIcon className="size-4" aria-hidden />
                  Build
                </NavItem>
                <NavItem to="/view">
                  <EyeIcon className="size-4" aria-hidden />
                  View
                </NavItem>
              </>
            )}
          </nav>
        </div>

        <div className="flex-none gap-2 pr-3 flex items-center">
          {authenticated && (profile?.username || profile?.sub) && (
            <NavItem to="/about">
              <UserIcon className="size-4" aria-hidden />
              {profile.username || squishEmail(profile.sub || '') || 'unknown'}
            </NavItem>
          )}

          {!authenticated ? (
            <button
              type="button"
              className="btn btn-neutral btn-sm"
              onClick={login}
            >
              Login
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={logout}
            >
              Logout
            </button>
          )}
        </div>
      </header>

      {/* Page content */}
      <main className="container bg-white rounded border mt-4 mx-auto w-full p-4">
        <Outlet />
      </main>
    </div>
  )
}
