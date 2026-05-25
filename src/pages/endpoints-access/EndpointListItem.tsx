import { CheckIcon } from '@heroicons/react/16/solid'
import type {
  SecuredEndpoint,
  EndpointAssignment,
} from '@/types/securedEndpoints'
import { getFriendlyLabel } from './utils/friendlyLabels'

const getScopeLabel = (scope: string): string => {
  if (scope === 'MINE') return 'Own Only'
  return scope.charAt(0).toUpperCase() + scope.slice(1).toLowerCase()
}

interface EndpointListItemProps {
  endpoint: SecuredEndpoint
  assignment: EndpointAssignment | undefined
  onToggle: () => void
  onSetScope: (scope: string) => void
}

const EndpointListItem = ({
  endpoint,
  assignment,
  onToggle,
  onSetScope,
}: EndpointListItemProps) => {
  const isChecked = assignment !== undefined
  const friendlyLabel = getFriendlyLabel(endpoint.action, endpoint.path)
  const method = endpoint.action.toUpperCase()
  const hasScopes = endpoint.scopes && endpoint.scopes.length > 0

  return (
    <div
      className={`border-t border-line transition-colors ${
        isChecked ? 'bg-brand-subtle' : 'hover:bg-surface-muted'
      }`}
    >
      <label className="w-full flex items-center justify-between gap-8 px-4 py-2 text-left cursor-pointer">
        <div className="flex items-center gap-3 w-5/12 min-w-0">
          <div
            className={`relative size-4 shrink-0 rounded border flex items-center justify-center transition-colors mt-0.5 self-start ${
              isChecked
                ? 'bg-brand border-brand'
                : 'border-line-strong bg-white'
            }`}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={isChecked}
              onChange={() => {
                onToggle()
                if (!isChecked && endpoint.scopes?.[0])
                  onSetScope(endpoint.scopes[0])
              }}
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

      {hasScopes && (
        <div
          className={`flex items-center gap-3 pl-11 pr-4 pb-2 ${
            !isChecked ? 'pointer-events-none opacity-40' : ''
          }`}
        >
          <span className="text-xs font-medium text-muted shrink-0">
            Scope:
          </span>
          <div className="flex items-center gap-4">
            {endpoint.scopes!.map((scope) => (
              <label
                key={scope}
                className={`inline-flex items-center gap-1.5 ${isChecked ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              >
                <input
                  type="radio"
                  name={`scope-${endpoint.secured_endpoint_id}`}
                  value={scope}
                  checked={assignment?.scope === scope}
                  onChange={() => onSetScope(scope)}
                  className="accent-brand"
                />
                <span
                  className={`text-xs select-none ${isChecked ? 'text-body' : 'text-subtle'}`}
                >
                  {getScopeLabel(scope)}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default EndpointListItem
