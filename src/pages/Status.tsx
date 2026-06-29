import { useState, useEffect } from 'react'
import ViewGroup from '@/components/ViewGroup'
import StatusLegend from '@/components/StatusLegend'
import type { PageConfig } from '@/types/pages'

interface StatusProps {
  statusData: PageConfig
  logo?: string
}

export const Status = ({ statusData, logo }: StatusProps) => {
  const iconMode = statusData.theming?.status.icon || 'led'
  const [tenantImgError, setTenantImgError] = useState(false)

  useEffect(() => {
    setTenantImgError(false)
  }, [statusData.tenant_image])

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <header className="relative">
        <div className="relative h-66">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'url(/public-status-page-placeholder.svg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center bottom',
              backgroundRepeat: 'no-repeat',
            }}
          />
          {statusData.tenant_name && (
            <div className="absolute top-5 left-6 flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-xl">
              {statusData.tenant_image && !tenantImgError && (
                <img
                  src={statusData.tenant_image}
                  alt={statusData.tenant_name}
                  className="h-7 object-contain"
                  onError={() => setTenantImgError(true)}
                />
              )}
              <span className="text-base font-medium text-foreground">
                {statusData.tenant_name}
              </span>
            </div>
          )}
          <div className="absolute -bottom-8 right-6">
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
          className={`text-center py-2 px-24 ${logo ? 'mt-3' : 'mt-9'}`}
          style={{ backgroundColor: statusData.theming?.color || '#FFFFFF' }}
        >
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold text-muted mb-0">
              {statusData.title}
            </h1>
            {statusData.description && (
              <p className="text-base text-body max-w-2xl mx-auto">
                {statusData.description}
              </p>
            )}
          </div>
        </div>

        <div className="px-16 mt-3 flex justify-center">
          <StatusLegend iconMode={iconMode} />
        </div>
      </header>

      <main
        className={`py-3 ${statusData.theming?.columns === 'one' ? 'px-36' : 'px-18'}`}
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
    </div>
  )
}
