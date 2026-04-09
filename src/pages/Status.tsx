import { useParams } from 'react-router-dom'
import {
  ArrowDownCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon,
  XCircleIcon,
} from '@heroicons/react/16/solid'
import { useGetStatusQuery } from '@/hooks/useStatus'
import ViewGroup from '@/components/ViewGroup'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

export const Status = () => {
  const { slug } = useParams<{ slug: string }>()

  const { data: statusData, isLoading } = useGetStatusQuery(slug || '')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6">
      <div className="container mx-auto max-w-5xl">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center mt-32">
            <LoadingSpinner />
            <div className="text-lg text-muted">Loading status page...</div>
          </div>
        ) : statusData ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <header className="relative">
              <div className="relative h-64">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      'url(/background-image-public-status-pages.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}
                />
              </div>

              {(statusData.theming?.option === 'theme_1' ||
                !statusData.theming?.option) &&
              statusData.theming?.logo ? (
                <div className="relative flex justify-center -mt-20">
                  <div className="bg-white rounded-full p-2 shadow-xl">
                    <img
                      alt="Logo"
                      className="h-32 w-32 object-contain"
                      src={
                        statusData.theming?.logo?.startsWith('http') ||
                        statusData.theming?.logo?.startsWith('data:')
                          ? statusData.theming?.logo
                          : `${BACKEND_API}${statusData.theming?.logo}`
                      }
                      style={{
                        borderRadius: '50%',
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                      }}
                    />
                  </div>
                </div>
              ) : null}

              <div
                className={`text-center pt-2 pb-3 px-24 ${
                  (statusData.theming?.option === 'theme_1' ||
                    !statusData.theming?.option) &&
                  statusData.theming?.logo
                    ? 'mt-4'
                    : 'mt-8'
                }`}
                style={{
                  backgroundColor: statusData.theming?.color || '#FFFFFF',
                }}
              >
                <div className="space-y-3">
                  <h1 className="text-4xl font-semibold text-muted mb-1">
                    {statusData.title}
                  </h1>
                  {statusData.description && (
                    <p className="text-lg text-body max-w-2xl mx-auto">
                      {statusData.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="px-16 mt-6 mb-2 flex justify-center">
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    {statusData?.theming?.status.icon === 'icon' ? (
                      <CheckCircleIcon className="size-4 text-success" />
                    ) : (
                      <div className="status status-lg status-success"></div>
                    )}
                    <span className="text-muted font-medium">Operational</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusData?.theming?.status.icon === 'icon' ? (
                      <XCircleIcon className="size-4 text-error" />
                    ) : (
                      <div className="status status-lg status-error"></div>
                    )}
                    <span className="text-muted font-medium">Critical</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusData?.theming?.status.icon === 'icon' ? (
                      <ExclamationTriangleIcon className="size-4 text-warning" />
                    ) : (
                      <div className="status status-lg status-warning"></div>
                    )}
                    <span className="text-muted font-medium">Warning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusData?.theming?.status.icon === 'icon' ? (
                      <ExclamationCircleIcon className="size-4 text-info" />
                    ) : (
                      <div className="status status-lg status-info"></div>
                    )}
                    <span className="text-muted font-medium">Missing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusData?.theming?.status.icon === 'icon' ? (
                      <ArrowDownCircleIcon className="size-4 text-black" />
                    ) : (
                      <div className="status status-lg status-neutral"></div>
                    )}
                    <span className="text-muted font-medium">Downtime</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusData?.theming?.status.icon === 'icon' ? (
                      <QuestionMarkCircleIcon className="size-4 text-subtle" />
                    ) : (
                      <div className="status status-lg status-unknown"></div>
                    )}
                    <span className="text-muted font-medium">Unknown</span>
                  </div>
                </div>
              </div>
            </header>
            <main
              className={`py-2 ${statusData?.theming?.columns === 'one' ? 'px-36' : 'px-18'}`}
            >
              {statusData.groups && statusData.groups.length > 0 ? (
                <div className="space-y-4">
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
                <div className="text-center py-12 text-muted">
                  No status information available
                </div>
              )}
            </main>
            <footer className="p-8 mt-8 bg-surface-muted border-t border-line">
              <div className="text-center text-sm font-medium text-muted tracking-wide">
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
          <div className="page-container">
            <ErrorDisplay
              error="Failed to load status page"
              context="status page"
            />
          </div>
        )}
      </div>
    </div>
  )
}
