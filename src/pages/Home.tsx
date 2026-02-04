import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export function Home() {
  const { profile } = useAuth()

  return (
    <div className="page-container">
      <h1 className="text-2xl font-semibold text-gray-900 mb-3">
        Welcome to Status Pages
        {profile?.name && (
          <span>
            ,{' '}
            <span className="text-amber-700">
              <Link to="/profile">{profile.name}</Link>
            </span>
            !
          </span>
        )}
      </h1>

      <p className="text-gray-600 mb-6">
        Create and manage your status pages to monitor your services
      </p>
    </div>
  )
}
