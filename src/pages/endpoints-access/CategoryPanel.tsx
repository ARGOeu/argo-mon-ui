import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/16/solid'
import EndpointListItem from './EndpointListItem'
import type { SecuredEndpoint } from '@/types/securedEndpoints'

export interface CategoryPanelProps {
  label: string
  endpoints: SecuredEndpoint[]
  isCollapsed: boolean
  onToggleCollapse: () => void
  selectedId: string | null
  onSelectEndpoint: (id: string | null) => void
}

const CategoryPanel = ({
  label,
  endpoints,
  isCollapsed,
  onToggleCollapse,
  selectedId,
  onSelectEndpoint,
}: CategoryPanelProps) => {
  if (endpoints.length === 0) return null

  return (
    <div className="mb-2 border border-line rounded-lg overflow-hidden bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggleCollapse}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-surface-strong hover:bg-line/50 transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-2">
          {isCollapsed ? (
            <ChevronRightIcon className="size-4 text-muted shrink-0" />
          ) : (
            <ChevronDownIcon className="size-4 text-muted shrink-0" />
          )}
          <span className="font-medium text-sm text-foreground">{label}</span>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 bg-white text-muted rounded-full border border-line">
          {endpoints.length}
        </span>
      </button>

      {!isCollapsed && (
        <div className="flex flex-col py-1">
          {endpoints.map((endpoint) => (
            <EndpointListItem
              key={endpoint.secured_endpoint_id}
              endpoint={endpoint}
              isSelected={selectedId === endpoint.secured_endpoint_id}
              onClick={() => onSelectEndpoint(endpoint.secured_endpoint_id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default CategoryPanel
