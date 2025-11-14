import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { LoginPrompt } from '@/components/LoginPrompt'

export function Home() {
  const { authenticated, login, profile } = useAuth()

  if (!authenticated) {
    return (
      <LoginPrompt
        title="Welcome to Status Pages"
        description="Sign in to create and manage your status pages"
        onLogin={login}
      />
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">
        Welcome to Status Pages
        {profile?.username && (
          <span>
            ,{' '}
            <span className="text-amber-700">
              <Link to="/profile">{profile.username}</Link>
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
