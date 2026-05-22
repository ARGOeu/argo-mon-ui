import ExpandableGroup from '@/components/ExpandableGroup'
import StatusLegend from '@/components/StatusLegend'
import type { PageConfig } from '@/types/pages'

interface ExpandableStatusProps {
  statusData: PageConfig
  logo?: string
}

export const ExpandableStatus = ({
  statusData,
  logo,
}: ExpandableStatusProps) => {
  const iconMode = statusData.theming?.status.icon || 'led'

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <header
        className="flex items-center gap-4 px-8 py-5 border-b border-line"
        style={{ backgroundColor: statusData.theming?.color || '#FFFFFF' }}
      >
        {logo && (
          <img alt="Logo" className="h-10 object-contain shrink-0" src={logo} />
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
        className={`py-6 ${statusData.theming?.columns === 'one' ? 'px-36' : 'px-18'}`}
      >
        <div className="mb-6">
          <StatusLegend iconMode={iconMode} />
        </div>

        {statusData.groups && statusData.groups.length > 0 ? (
          <div className="space-y-4">
            {statusData.groups.map((group) => (
              <ExpandableGroup
                key={group.name}
                name={group.name}
                alias={group.alias || ''}
                items={group.list}
                iconMode={iconMode}
                textMode={statusData.theming?.status.text || 'none'}
                columns={statusData.theming?.columns || 'one'}
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
  )
}
