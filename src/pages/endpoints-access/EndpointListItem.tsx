import type { SecuredEndpoint } from '@/types/securedEndpoints'
import { METHOD_BADGE_COLORS } from './constants/methodBadges'

interface EndpointListItemProps {
  endpoint: SecuredEndpoint
  isSelected: boolean
  onClick: () => void
}

const EndpointListItem = ({
  endpoint,
  isSelected,
  onClick,
}: EndpointListItemProps) => {
  const badgeColor =
    METHOD_BADGE_COLORS[endpoint.action.toUpperCase()] ||
    'bg-surface-strong text-foreground border-line'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 text-left cursor-pointer transition-colors border-l-2 ${
        isSelected
          ? 'bg-brand-subtle border-brand-strong'
          : 'border-transparent hover:bg-surface-muted'
      }`}
    >
      <div
        className={`text-[0.65rem] font-bold px-1.5 py-0.5 rounded border ${badgeColor} shrink-0 w-14 text-center tracking-wider`}
      >
        {endpoint.action.toUpperCase()}
      </div>
      <div className="flex flex-col min-w-0">
        <span
          className={`text-sm truncate ${isSelected ? 'text-brand-strong font-semibold' : 'text-foreground'}`}
        >
          {endpoint.path}
        </span>
      </div>
    </button>
  )
}

export default EndpointListItem
