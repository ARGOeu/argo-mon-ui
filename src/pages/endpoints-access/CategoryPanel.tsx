import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/16/solid'
import EndpointListItem from './EndpointListItem'
import type { SecuredEndpoint } from '@/types/securedEndpoints'

export interface CategoryPanelProps {
  label: string
  endpoints: SecuredEndpoint[]
  isCollapsed: boolean
  onToggleCollapse: () => void
  selectedActionIds: Set<string>
  onToggleAction: (id: string, selectAll?: boolean, allIds?: string[]) => void
}

const CategoryPanel = ({
  label,
  endpoints,
  isCollapsed,
  onToggleCollapse,
  selectedActionIds,
  onToggleAction,
}: CategoryPanelProps) => {
  if (endpoints.length === 0) return null

  const endpointIds = endpoints.map((ep) => ep.secured_endpoint_id)
  const selectedCount = endpointIds.filter((id) =>
    selectedActionIds.has(id),
  ).length
  const isAllChecked =
    endpointIds.length > 0 && selectedCount === endpointIds.length
  const isIndeterminate = selectedCount > 0 && !isAllChecked

  const handleCategoryCheckboxChange = () => {
    onToggleAction('', !isAllChecked, endpointIds)
  }

  return (
    <div className="border border-line rounded-lg overflow-hidden bg-white shadow-sm ring-1 ring-black/5">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 bg-surface-strong border-b border-line cursor-pointer select-none"
        onClick={onToggleCollapse}
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center gap-3 shrink-0">
          <label
            className="cursor-pointer group p-1 -m-1"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`relative size-4 shrink-0 rounded border flex items-center justify-center transition-colors ${
                isAllChecked || isIndeterminate
                  ? 'bg-brand border-brand'
                  : 'border-line-strong bg-white group-hover:border-brand-muted'
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={isAllChecked || isIndeterminate}
                onChange={handleCategoryCheckboxChange}
              />
              {isAllChecked && <CheckIcon className="size-3 text-white" />}
              {isIndeterminate && !isAllChecked && (
                <div className="w-2.5 h-0.5 bg-white rounded-full" />
              )}
            </div>
          </label>
          <span className="font-bold text-sm text-foreground">{label}</span>
          <span className="text-xs text-muted font-normal">
            ({selectedCount}/{endpointIds.length})
          </span>
        </div>

        <div className="flex items-center gap-2 px-2 py-1 justify-end text-muted">
          {isCollapsed ? (
            <ChevronRightIcon className="size-5 shrink-0 transition-transform" />
          ) : (
            <ChevronDownIcon className="size-5 shrink-0 transition-transform" />
          )}
        </div>
      </button>

      {!isCollapsed && (
        <div className="flex flex-col bg-white">
          {endpoints.map((endpoint) => (
            <EndpointListItem
              key={endpoint.secured_endpoint_id}
              endpoint={endpoint}
              isChecked={selectedActionIds.has(endpoint.secured_endpoint_id)}
              onToggle={() => onToggleAction(endpoint.secured_endpoint_id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default CategoryPanel
