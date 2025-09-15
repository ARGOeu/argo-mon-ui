import { UserCircleIcon } from '@heroicons/react/16/solid'
import { useAuth } from '../auth/useAuth'
import { squishEmail } from '@/utils/profile'

export const Profile = () => {
  const { profile } = useAuth()

  return (
    <div>
      <h1 className="text-2xl font-semibold">Profile</h1>
      {profile && (
        <div className="card w-96 bg-base-100 card-md shadow-sm ms-6 mt-4">
          <div className="card-body">
            <h2 className="card-title">
              <UserCircleIcon className="size-8" aria-hidden />
              {profile.username || squishEmail(profile.sub || "")} 
            </h2>
            <p>{profile.name}</p>
            <p>{profile.email}</p>
          </div>
        </div>
      )}
    </div>
  )
}
