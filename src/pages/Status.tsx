import ViewGroup from '@/components/ViewGroup'
import StatusLegend from '@/components/StatusLegend'
import type { PageConfig } from '@/types/pages'

interface StatusProps {
  statusData: PageConfig
  logo?: string
}

export const Status = ({ statusData, logo }: StatusProps) => {
  const iconMode = statusData.theming?.status.icon || 'led'

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <header className="relative">
        <div className="relative h-64">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'url(/background-image-public-status-pages.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        </div>

        {logo && (
          <div className="relative flex justify-center -mt-20">
            <div className="bg-white rounded-full p-2 shadow-xl">
              <img
                alt="Logo"
                className="h-32 w-32 object-contain"
                src={logo}
                style={{
                  borderRadius: '50%',
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                }}
              />
            </div>
          </div>
        )}

        <div
          className={`text-center pt-2 pb-3 px-24 ${logo ? 'mt-4' : 'mt-8'}`}
          style={{ backgroundColor: statusData.theming?.color || '#FFFFFF' }}
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
          <StatusLegend iconMode={iconMode} />
        </div>
      </header>

      <main
        className={`py-2 ${statusData.theming?.columns === 'one' ? 'px-36' : 'px-18'}`}
      >
        {statusData.groups && statusData.groups.length > 0 ? (
          <div className="space-y-4">
            {statusData.groups.map((group) => (
              <div key={group.name}>
                <ViewGroup
                  columns={statusData.theming?.columns || 'one'}
                  name={group.name}
                  alias={group.alias || ''}
                  items={group.list}
                  iconMode={iconMode}
                  textMode={statusData.theming?.status.text || 'none'}
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
  )
}
