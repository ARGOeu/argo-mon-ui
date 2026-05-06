import { CheckIcon } from '@heroicons/react/16/solid'
import type { SecuredEndpoint } from '@/types/securedEndpoints'
import { getFriendlyLabel } from './utils/friendlyLabels'

interface EndpointListItemProps {
  endpoint: SecuredEndpoint
  isChecked: boolean
  onToggle: () => void
}

const EndpointListItem = ({
  endpoint,
  isChecked,
  onToggle,
}: EndpointListItemProps) => {
  const friendlyLabel = getFriendlyLabel(endpoint.action, endpoint.path)
  const method = endpoint.action.toUpperCase()

  return (
    <label
      className={`w-full flex items-center justify-between gap-8 px-4 py-2 text-left cursor-pointer transition-colors border-t border-line ${
        isChecked ? 'bg-brand-subtle' : 'hover:bg-surface-muted'
      }`}
    >
      <div className="flex items-center gap-3 w-5/12 min-w-0">
        <div
          className={`relative size-4 shrink-0 rounded border flex items-center justify-center transition-colors mt-0.5 self-start ${
            isChecked ? 'bg-brand border-brand' : 'border-line-strong bg-white'
          }`}
        >
          <input
            type="checkbox"
            className="sr-only"
            checked={isChecked}
            onChange={onToggle}
          />
          {isChecked && <CheckIcon className="size-3 text-white" />}
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span
            className={`text-sm font-medium break-words ${isChecked ? 'text-foreground' : 'text-foreground/90'}`}
          >
            {friendlyLabel}
          </span>
          <div className="flex gap-1.5 mt-0.5">
            <span className="text-xs text-subtle font-mono shrink-0">
              {method}
            </span>
            <span className="text-xs text-subtle font-mono break-all">
              {endpoint.path}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col min-w-0 flex-1 text-left">
        <span
          className="text-sm text-subtle line-clamp-3"
          title={endpoint.description}
        >
          {endpoint.description}
        </span>
      </div>
    </label>
  )
}

export default EndpointListItem
