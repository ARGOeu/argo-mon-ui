import { CheckIcon } from '@heroicons/react/16/solid'
import type { SecuredEndpoint } from '@/types/securedEndpoints'
import Button from '@/components/Button'
import { AVAILABLE_RULES } from './constants/endpointRules'
import { METHOD_BADGE_COLORS } from './constants/methodBadges'

interface EndpointDetailsPanelProps {
  endpoint: SecuredEndpoint
  selectedRules: string[]
  onRuleToggle: (rule: string) => void
  onSubmit: () => void
  isMutating: boolean
}

const EndpointDetailsPanel = ({
  endpoint,
  selectedRules,
  onRuleToggle,
  onSubmit,
  isMutating,
}: EndpointDetailsPanelProps) => {
  const badgeColor =
    METHOD_BADGE_COLORS[endpoint.action.toUpperCase()] ||
    'bg-surface-strong text-foreground border-line'

  return (
    <div className="bg-white border border-line rounded-xl shadow-sm overflow-hidden flex flex-col h-full max-h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-line bg-surface-muted sticky top-0 z-10 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-3 mb-2">
              <div
                className={`mt-0.5 shrink-0 text-[0.65rem] font-bold px-2 py-0.5 rounded shadow-sm ${badgeColor} tracking-wider`}
              >
                {endpoint.action.toUpperCase()}
              </div>
              <h2 className="text-lg font-bold text-foreground font-mono break-all leading-tight">
                {endpoint.path}
              </h2>
            </div>
            {endpoint.description && (
              <p
                className="text-body text-sm line-clamp-2"
                title={endpoint.description}
              >
                {endpoint.description}
              </p>
            )}
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={onSubmit}
            disabled={selectedRules.length === 0 || isMutating}
          >
            {isMutating ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 bg-surface-strong/30">
        <div className="px-4 py-2 flex flex-col gap-6">
          {/* Permitted Users Section */}
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground mb-0.5">
              Permitted Users
            </h3>
            <p className="text-xs text-subtle mb-3">
              Configure who is permitted to access this endpoint.
            </p>

            <div className="grid grid-cols-1 gap-2">
              {AVAILABLE_RULES.map((rule) => {
                const isSelected = selectedRules.includes(rule.value)
                return (
                  <label
                    key={rule.value}
                    className={`flex items-start gap-4 px-3 py-2 rounded-xl border cursor-pointer hover:border-brand-muted hover:shadow-sm transition-all group ${
                      isSelected
                        ? 'bg-brand-subtle border-brand ring-1 ring-brand-strong'
                        : 'border-line bg-white'
                    }`}
                  >
                    <div
                      className={`relative mt-0.5 size-5 shrink-0 rounded border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-brand border-brand'
                          : 'border-line-strong bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={isSelected}
                        onChange={() => onRuleToggle(rule.value)}
                      />
                      {isSelected && (
                        <CheckIcon className="size-3.5 text-white" />
                      )}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <p className="text-sm leading-tight mb-1">
                        <span className="font-semibold text-foreground">
                          {rule.title}
                        </span>
                        <span className="text-muted mx-1.5">-</span>
                        <span className="text-muted text-xs">
                          {rule.description}
                        </span>
                      </p>
                      <div className="inline-flex mt-1">
                        <span className="inline-block font-normal font-mono text-[10px] text-subtle bg-surface-strong px-2 py-0.5 rounded break-all w-fit border border-line/50">
                          {rule.value}
                        </span>
                      </div>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EndpointDetailsPanel
