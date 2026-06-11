import { useState, useEffect } from 'react'
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
  const [tenantImgError, setTenantImgError] = useState(false)

  useEffect(() => {
    setTenantImgError(false)
  }, [statusData.tenant_image])

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <header>
        {statusData.tenant_name && (
          <div className="flex items-center gap-3 px-8 py-3 border-b border-line">
            {statusData.tenant_image && !tenantImgError && (
              <img
                src={statusData.tenant_image}
                alt={statusData.tenant_name}
                className="h-9 object-contain"
                onError={() => setTenantImgError(true)}
              />
            )}
            <span className="text-lg font-medium text-foreground">
              {statusData.tenant_name}
            </span>
          </div>
        )}
        <div
          className="flex items-start justify-between gap-4 px-8 py-5"
          style={{ backgroundColor: statusData.theming?.color || '#FFFFFF' }}
        >
          <div className="flex items-center gap-4">
            {logo && (
              <img
                alt="Logo"
                className="h-10 object-contain shrink-0"
                src={logo}
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
          </div>
          <span className="text-sm font-medium text-muted shrink-0">
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
          </span>
        </div>
      </header>

      <main
        className={`pt-2 pb-6 ${statusData.theming?.columns === 'one' ? 'px-36' : 'px-18'}`}
      >
        <div className="mb-4">
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
    </div>
  )
}
