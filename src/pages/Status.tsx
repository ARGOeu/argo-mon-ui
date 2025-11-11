import { useParams } from 'react-router-dom'
import { ArrowPathIcon } from '@heroicons/react/16/solid'
import { useGetStatusQuery } from '@/hooks/useStatus'
import ViewGroup from '@/components/ViewGroup'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

export const Status = () => {
  const { slug } = useParams<{ slug: string }>()

  const { data: statusData, isLoading } = useGetStatusQuery(slug || '')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center mt-32">
            <ArrowPathIcon className="size-10 animate-spin text-blue-500 mb-4" />
            <div className="text-lg text-gray-600">Loading status page...</div>
          </div>
        ) : statusData ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <header
              className="p-6 border-b border-gray-200"
              style={{
                backgroundColor: statusData.theming?.color || '#F9FAFB',
              }}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                {statusData.theming?.logo && (
                  <img
                    alt="Logo"
                    className="h-20 w-auto object-contain"
                    src={
                      statusData.theming?.logo?.startsWith('http') ||
                      statusData.theming?.logo?.startsWith('data:')
                        ? statusData.theming?.logo
                        : `${BACKEND_API}${statusData.theming?.logo}`
                    }
                  />
                )}
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold text-gray-900">
                    {statusData.title}
                  </h1>
                  {statusData.description && (
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                      {statusData.description}
                    </p>
                  )}
                </div>
              </div>
            </header>
            <main className="py-6 px-16">
              {statusData.groups && statusData.groups.length > 0 ? (
                <div className="space-y-8">
                  {statusData.groups.map((group) => (
                    <div key={group.name}>
                      <ViewGroup
                        columns={statusData?.theming?.columns || 'one'}
                        name={group.name}
                        alias={group.alias || ''}
                        items={group.list}
                        iconMode={statusData?.theming?.status.icon || 'led'}
                        textMode={statusData?.theming?.status.text || 'none'}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No status information available
                </div>
              )}
            </main>
            <footer className="p-8 mt-10 bg-gray-50 border-t border-gray-200">
              <div className="text-center text-sm font-medium text-gray-500 tracking-wide">
                Last updated:{' '}
                {new Date().toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  timeZone: 'UTC',
                })}
                ,{' '}
                {new Date().toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'UTC',
                })}{' '}
                (UTC)
              </div>
            </footer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-32 bg-white rounded-xl shadow-lg p-12">
            <div className="text-red-600 text-xl font-semibold mb-2">
              Failed to load status page
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
