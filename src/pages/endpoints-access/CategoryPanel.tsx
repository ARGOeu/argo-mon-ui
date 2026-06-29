import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/16/solid'
import EndpointListItem from './EndpointListItem'
import type {
  SecuredEndpoint,
  EndpointAssignment,
} from '@/types/securedEndpoints'

export interface CategoryPanelProps {
  label: string
  endpoints: SecuredEndpoint[]
  isCollapsed: boolean
  onToggleCollapse: () => void
  selectedAssignments: Map<string, EndpointAssignment>
  onToggleAction: (id: string) => void
  onSetScope: (endpointId: string, scope: string) => void
}

const CategoryPanel = ({
  label,
  endpoints,
  isCollapsed,
  onToggleCollapse,
  selectedAssignments,
  onToggleAction,
  onSetScope,
}: CategoryPanelProps) => {
  if (endpoints.length === 0) return null

  const selectedCount = endpoints.filter((ep) =>
    selectedAssignments.has(ep.secured_endpoint_id),
  ).length

  return (
    <div className="border border-line rounded-lg overflow-hidden bg-white shadow-sm ring-1 ring-black/5">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 bg-surface-strong border-b border-line cursor-pointer select-none"
        onClick={onToggleCollapse}
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-bold text-sm text-foreground">{label}</span>
          <span className="text-xs text-muted font-normal">
            ({selectedCount}/{endpoints.length})
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
              assignment={selectedAssignments.get(endpoint.secured_endpoint_id)}
              onToggle={() => onToggleAction(endpoint.secured_endpoint_id)}
              onSetScope={(scope: string) =>
                onSetScope(endpoint.secured_endpoint_id, scope)
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default CategoryPanel
