import { ArrowRightIcon } from '@heroicons/react/16/solid'
import PageHeader from '@/components/PageHeader'
import Badge from '@/components/Badge'
import CopyButton from '@/components/CopyButton'
import type { EndpointWithGroups } from '@/types/topology'

const reservedTagKeys = new Set([
  'monitored',
  'labels',
  'info_ID',
  'info_URL',
  'info_fname',
  'hostname',
  'last_updated_userid',
  'last_updated_username',
])

interface ViewTopologyEndpointProps {
  tenantId: string
  endpoint: EndpointWithGroups
  onClose: () => void
}

const ViewTopologyEndpoint = ({
  tenantId,
  endpoint,
  onClose,
}: ViewTopologyEndpointProps) => {
  const infoUrl = endpoint.tags?.info_URL
  const hostname = endpoint.tags?.hostname
  const url = infoUrl ?? hostname ?? endpoint.hostname
  const isMonitored = endpoint.tags?.monitored === '1'
  const friendlyName = endpoint.tags?.info_fname
  const endpointId = endpoint.tags?.info_ID
  const lastUpdatedUserId = endpoint.tags?.last_updated_userid
  const lastUpdatedUsername = endpoint.tags?.last_updated_username
  const metaItems = [
    endpointId && {
      label: 'Endpoint ID',
      value: endpointId,
      mono: true,
      copyable: true,
    },
    infoUrl &&
      hostname && {
        label: 'Hostname',
        value: hostname,
        mono: true,
        copyable: true,
      },
    friendlyName && {
      label: 'Friendly Name',
      value: friendlyName,
      mono: false,
      copyable: false,
    },
  ].filter(
    (
      item,
    ): item is {
      label: string
      value: string
      mono: boolean
      copyable: boolean
    } => Boolean(item),
  )
  const labels = endpoint.tags?.labels
    ? endpoint.tags.labels
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : []
  const metadata = Object.entries(endpoint.tags ?? {}).filter(
    ([key]) => !reservedTagKeys.has(key),
  )
  const contacts = (endpoint.notifications?.contacts ?? []).filter(Boolean)
  const notificationsEnabled =
    !!endpoint.notifications?.enabled && contacts.length > 0

  return (
    <div className="page-container">
      <PageHeader
        title="Topology Endpoint Details"
        subtitle="View the configuration for this topology endpoint"
        navigateTo={{
          label: 'Back to Topology',
          to: `/tenants/${tenantId}/topology#endpoints`,
          onClick: onClose,
        }}
      />
      <div className="flex flex-col gap-4 mt-4 max-w-5xl animate-fade-in">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            {url && (
              <div className="flex items-center gap-1">
                <h2 className="font-mono text-base font-medium text-foreground break-all">
                  {url}
                </h2>
                <CopyButton value={url} label="Copy URL" size="md" />
              </div>
            )}
            <Badge
              size="md"
              className={
                isMonitored
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-surface-strong text-muted'
              }
            >
              {isMonitored ? 'Monitored' : 'Not Monitored'}
            </Badge>
          </div>

          <p className="text-sm text-muted mt-1">
            <span className="font-semibold text-body">Service:</span>{' '}
            {endpoint.service}
          </p>

          <p className="text-sm text-muted mt-1">
            <span className="font-semibold text-body">Groups:</span>{' '}
            {endpoint.groups.join(', ')}
          </p>

          {metaItems.length > 0 && (
            <p className="text-xs text-subtle mt-2 flex flex-col gap-y-2 md:flex-row md:flex-wrap md:items-center md:gap-y-0 md:gap-x-1.5">
              {metaItems.map((item, index) => (
                <span key={item.label} className="flex items-center gap-x-1">
                  {index > 0 && <span className="hidden md:inline">·</span>}
                  <span>
                    {item.label}:{' '}
                    <span
                      className={
                        item.mono
                          ? 'font-mono text-body'
                          : 'text-body font-medium'
                      }
                    >
                      {item.value}
                    </span>
                  </span>
                  {item.copyable && (
                    <CopyButton
                      value={item.value}
                      label={`Copy ${item.label}`}
                      size="xs"
                    />
                  )}
                </span>
              ))}
            </p>
          )}

          {(lastUpdatedUsername || lastUpdatedUserId) && (
            <p className="text-xs text-subtle mt-2 flex flex-col gap-y-2 md:flex-row md:flex-wrap md:items-center md:gap-y-0 md:gap-x-1.5">
              {lastUpdatedUsername && (
                <span>
                  Last Updated By:{' '}
                  <span className="text-body font-medium">
                    {lastUpdatedUsername}
                  </span>
                </span>
              )}
              {lastUpdatedUserId && (
                <span className="flex items-start gap-x-1">
                  {lastUpdatedUsername && (
                    <span className="hidden md:inline">·</span>
                  )}
                  <span>
                    Last Updated User ID:{' '}
                    <span className="font-mono text-body break-all">
                      {lastUpdatedUserId}
                    </span>
                  </span>
                </span>
              )}
            </p>
          )}
        </div>

        {/* Notifications */}
        <div>
          <div className="flex items-center gap-2">
            <h3 className="section-title">Notifications</h3>
            <Badge
              size="sm"
              className={
                notificationsEnabled
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-red-50 text-red-600'
              }
            >
              {notificationsEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
          {notificationsEnabled && (
            <ul className="flex flex-col gap-0.5 mt-1">
              {contacts.map((email) => (
                <li key={email} className="text-sm text-muted">
                  {email}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Metadata */}
        {metadata.length > 0 && (
          <div>
            <h3 className="section-title">Metadata</h3>
            <div className="flex flex-col gap-2 mt-1.5">
              {metadata.map(([key, value]) => (
                <div
                  key={key}
                  className="inline-flex items-center self-start rounded-md border border-line-strong overflow-hidden text-sm"
                >
                  <span className="bg-surface-strong text-body font-medium px-2.5 py-1">
                    {key}
                  </span>
                  <ArrowRightIcon className="size-4 text-subtle mx-1.5 flex-shrink-0" />
                  <span className="bg-white text-muted px-2.5 py-1 break-all">
                    {value || <span className="italic text-subtle">empty</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Labels */}
        {labels.length > 0 && (
          <div>
            <h3 className="section-title">Labels</h3>
            <div className="flex flex-wrap gap-3 mt-1.5">
              {labels.map((label) => (
                <Badge
                  key={label}
                  size="md"
                  className="bg-surface-strong text-body"
                >
                  {label}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ViewTopologyEndpoint
