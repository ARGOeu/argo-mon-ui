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
import ExpandableGroup from '@/components/ExpandableGroup'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

export const ExpandableStatus = () => {
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
            <header
              className="flex items-center gap-4 px-8 py-5 border-b border-line"
              style={{ backgroundColor: statusData.theming?.color || '#FFFFFF' }}
            >
              {statusData.theming?.logo && (
                <img
                  alt="Logo"
                  className="h-10 object-contain shrink-0"
                  src={
                    statusData.theming.logo.startsWith('http') ||
                    statusData.theming.logo.startsWith('data:')
                      ? statusData.theming.logo
                      : `${BACKEND_API}${statusData.theming.logo}`
                  }
                />
              )}
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {statusData.title}
                </h1>
                {statusData.description && (
                  <p className="text-sm text-muted">{statusData.description}</p>
                )}
              </div>
            </header>

            <main
              className={`py-6 ${statusData?.theming?.columns === 'one' ? 'px-36' : 'px-18'}`}
            >
              <div className="flex flex-wrap items-center gap-6 mb-6 text-sm">
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
              {statusData.groups && statusData.groups.length > 0 ? (
                <div className="space-y-4">
                  {statusData.groups.map((group) => (
                    <ExpandableGroup
                      key={group.name}
                      name={group.name}
                      alias={group.alias || ''}
                      items={group.list}
                      iconMode={statusData?.theming?.status.icon || 'led'}
                      textMode={statusData?.theming?.status.text || 'none'}
                      columns={statusData?.theming?.columns || 'one'}
                    />
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
