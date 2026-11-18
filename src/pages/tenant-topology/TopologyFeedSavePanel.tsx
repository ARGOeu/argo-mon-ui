import Badge from '@/components/Badge'
import Button from '@/components/Button'
import LoadingSpinner from '@/components/LoadingSpinner'
import { TOPOLOGY_FEED_TYPE_LABELS } from '@/utils/topologyFeedTypes'
import { TOPOLOGY_FEED_TYPE_INFO } from './topologyFeedTypeInfo'

const getTypeLabel = (type: string): string =>
  TOPOLOGY_FEED_TYPE_LABELS[type] ?? type

interface FeedTypeSummaryProps {
  type: string
}

const FeedTypeSummary = ({ type }: FeedTypeSummaryProps) => {
  const info = TOPOLOGY_FEED_TYPE_INFO[type]

  return (
    <span className="flex items-center gap-3">
      {info?.logo && (
        <span className="flex size-14 shrink-0 items-center justify-center rounded-md border border-line bg-white p-0.5">
          <img src={info.logo} alt="" className="size-full object-contain" />
        </span>
      )}
      <span className="text-base font-semibold text-foreground">
        {getTypeLabel(type)}
      </span>
    </span>
  )
}

interface TopologyFeedSavePanelProps {
  savedType: string
  selectedType: string
  isDirty: boolean
  isSaving: boolean
  isSaveDisabled: boolean
  onSave: () => void
}

const TopologyFeedSavePanel = ({
  savedType,
  selectedType,
  isDirty,
  isSaving,
  isSaveDisabled,
  onSave,
}: TopologyFeedSavePanelProps) => {
  const isChangingType = !!selectedType && selectedType !== savedType

  return (
    <aside
      aria-label="Topology feed summary"
      className="sticky bottom-0 z-10 -mx-4 border-t border-line bg-white px-4 py-3 md:-mx-6 md:px-6 xl:top-3 xl:bottom-auto xl:mx-0 xl:self-start xl:rounded-lg xl:border xl:px-6 xl:py-4"
    >
      <div className="flex items-center justify-between gap-3 xl:flex-col xl:items-stretch xl:gap-5">
        <div className="hidden space-y-3 xl:block">
          <div>
            <p className="text-sm font-medium text-muted">Current feed</p>
            <div className="mt-1">
              {savedType ? (
                <FeedTypeSummary type={savedType} />
              ) : (
                <span className="text-sm text-muted">Not set</span>
              )}
            </div>
          </div>
          {isChangingType && (
            <div>
              <p className="text-sm font-medium text-muted">New feed</p>
              <div className="mt-1">
                <FeedTypeSummary type={selectedType} />
              </div>
            </div>
          )}
        </div>

        <p className="flex min-w-0 flex-col text-sm sm:flex-row xl:hidden">
          <span className="shrink-0 text-muted sm:mr-1">Current feed:</span>
          <span className="truncate font-semibold text-foreground">
            {savedType ? getTypeLabel(savedType) : 'Not set'}
          </span>
        </p>

        <div className="ml-auto flex shrink-0 items-center gap-4 xl:ml-0 xl:flex-col xl:items-stretch xl:gap-3">
          {isDirty && (
            <Badge
              size="sm"
              className="bg-amber-100 text-amber-700 xl:self-start"
            >
              Unsaved changes
            </Badge>
          )}
          <Button
            variant="primary"
            size="md"
            onClick={onSave}
            disabled={isSaveDisabled}
            className="xl:py-2"
          >
            {isSaving ? (
              <>
                <LoadingSpinner size="xs" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </div>
    </aside>
  )
}

export default TopologyFeedSavePanel
