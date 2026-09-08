import { useEffect, useRef, useState } from 'react'
import { ArrowRightIcon } from '@heroicons/react/16/solid'
import { Check, Copy } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import Badge from '@/components/Badge'
import type { EndpointTopologyItem } from '@/types/topology'

const reservedTagKeys = new Set([
  'monitored',
  'labels',
  'info_ID',
  'info_URL',
  'info_fname',
  'hostname',
])

interface ViewTopologyEndpointProps {
  tenantId: string
  endpoint: EndpointTopologyItem
  onClose: () => void
}

const ViewTopologyEndpoint = ({
  tenantId,
  endpoint,
  onClose,
}: ViewTopologyEndpointProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current)
      }
    }
  }, [])

  const infoUrl = endpoint.tags?.info_URL
  const hostname = endpoint.tags?.hostname
  const url = infoUrl ?? hostname ?? endpoint.hostname
  const isMonitored = endpoint.tags?.monitored === '1'
  const friendlyName = endpoint.tags?.info_fname
  const endpointId = endpoint.tags?.info_ID
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

  const handleCopy = (field: string, value: string) => {
    if (!value) {
      return
    }
    void navigator.clipboard?.writeText(value)
    setCopiedField(field)
    if (copyTimerRef.current) {
      clearTimeout(copyTimerRef.current)
    }
    copyTimerRef.current = setTimeout(() => setCopiedField(null), 1500)
  }

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
                <button
                  type="button"
                  onClick={() => handleCopy('url', url)}
                  className={`flex-shrink-0 rounded p-1 transition-colors ${
                    copiedField === 'url'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-subtle hover:bg-surface-strong hover:text-body'
                  }`}
                  aria-label={copiedField === 'url' ? 'Copied' : 'Copy URL'}
                  title={copiedField === 'url' ? 'Copied!' : 'Copy URL'}
                >
                  {copiedField === 'url' ? (
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  ) : (
                    <Copy className="h-4 w-4" strokeWidth={2} />
                  )}
                </button>
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
            <span className="font-semibold text-body">Group:</span>{' '}
            {endpoint.group}
          </p>

          {metaItems.length > 0 && (
            <p className="text-xs text-subtle mt-2 flex flex-wrap items-center gap-x-1.5">
              {metaItems.map((item, index) => (
                <span key={item.label} className="flex items-center gap-x-1">
                  {index > 0 && <span>·</span>}
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
                    <button
                      type="button"
                      onClick={() => handleCopy(item.label, item.value)}
                      className={`flex-shrink-0 rounded p-0.5 transition-colors ${
                        copiedField === item.label
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'text-subtle hover:bg-surface-strong hover:text-body'
                      }`}
                      aria-label={
                        copiedField === item.label
                          ? 'Copied'
                          : `Copy ${item.label}`
                      }
                      title={
                        copiedField === item.label
                          ? 'Copied!'
                          : `Copy ${item.label}`
                      }
                    >
                      {copiedField === item.label ? (
                        <Check className="h-3 w-3" strokeWidth={2.5} />
                      ) : (
                        <Copy className="h-3 w-3" strokeWidth={2} />
                      )}
                    </button>
                  )}
                </span>
              ))}
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
