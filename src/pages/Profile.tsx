import { UserCircleIcon } from '@heroicons/react/16/solid'
import { useAuth } from '../auth/useAuth'
import { squishEmail } from '@/utils/profile'

export const Profile = () => {
  const { profile } = useAuth()

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="max-w-4xl w-full">
        <div className="pb-1 mb-6">
          <h1 className="text-3xl font-semibold text-gray-800">Profile</h1>
          <p className="text-md text-gray-500">View your account information</p>
        </div>

        {profile && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-full p-3 shadow-sm">
                  <UserCircleIcon className="size-12 text-blue-600" />
                </div>
                <div>
                  <label className="text-md font-medium text-gray-500">
                    Username
                  </label>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {profile.username || squishEmail(profile.sub || '')}
                  </h2>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 space-y-6">
              <div className="grid grid-cols-[200px_1fr] gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Account Details
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-500">
                      First Name
                    </label>
                    <p
                      className={`text-sm ${profile?.given_name ? 'text-gray-800 font-medium' : 'text-gray-400 italic'}`}
                    >
                      {profile?.given_name || 'Not available'}
                    </p>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-500">
                      Last Name
                    </label>
                    <p
                      className={`text-sm ${profile?.family_name ? 'text-gray-800 font-medium' : 'text-gray-400 italic'}`}
                    >
                      {profile?.family_name || 'Not available'}
                    </p>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <p
                      className={`text-sm ${profile?.email ? 'text-gray-800 font-medium' : 'text-gray-400 italic'}`}
                    >
                      {profile?.email || 'Not available'}
                    </p>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-500">
                      User ID
                    </label>
                    <p
                      className={`text-sm break-all ${profile?.sub ? 'text-gray-800 font-medium' : 'text-gray-400 italic'}`}
                    >
                      {profile?.sub || 'Not available'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
