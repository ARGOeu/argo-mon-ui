import { useMemo, useState, useEffect, useRef } from 'react'
import { useGroupCollapse } from './hooks/useEndpointManagement'
import Button from '@/components/Button'
import ConfirmDialog from '@/components/ConfirmDialog'
import ErrorDisplay from '@/components/ErrorDisplay'
import LoadingSpinner from '@/components/LoadingSpinner'
import SearchInput from '@/components/SearchInput'
import SelectDropdown from '@/components/SelectDropdown'
import CategoryPanel from './CategoryPanel'
import { CATEGORY_MATCHERS } from './constants/endpointCategories'
import { getFriendlyLabel } from './utils/friendlyLabels'
import type { SecuredEndpoint } from '@/types/securedEndpoints'

interface RoleDetailsPanelProps {
  roleName: string
  endpointsList: SecuredEndpoint[]
  selectedActionIds: string[]
  onToggleAction: (
    actionId: string,
    selectAll?: boolean,
    allIds?: string[],
  ) => void
  onSubmit: () => void
  isMutating: boolean
  isDirty: boolean
  addedCount: number
  removedCount: number
  isLoadingActions: boolean
  error?: Error | null
}

const RoleDetailsPanel = ({
  roleName,
  endpointsList,
  selectedActionIds,
  onToggleAction,
  onSubmit,
  isMutating,
  isDirty,
  addedCount,
  removedCount,
  isLoadingActions,
  error,
}: RoleDetailsPanelProps) => {
  const [searchInput, setSearchInput] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isStuck, setIsStuck] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) {
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { threshold: 0 },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])
  const { collapsedGroups, handleToggleGroup, collapseAll, expandAll } =
    useGroupCollapse()

  const dynamicCategoryOptions = useMemo(() => {
    const categoriesWithEndpoints = new Set<string>()
    endpointsList.forEach((ep) => {
      const category =
        CATEGORY_MATCHERS.find((m) => m.match(ep.path))?.label ?? 'Other'
      categoriesWithEndpoints.add(category)
    })

    const options = [{ value: 'all', label: 'All' }]
    CATEGORY_MATCHERS.forEach(({ label }) => {
      if (categoriesWithEndpoints.has(label)) {
        options.push({ value: label, label })
      }
    })
    if (categoriesWithEndpoints.has('Other')) {
      options.push({ value: 'Other', label: 'Other' })
    }
    return options
  }, [endpointsList])

  const selectedActionIdsSet = useMemo(
    () => new Set(selectedActionIds),
    [selectedActionIds],
  )

  const groupedEndpoints = useMemo(() => {
    const query = searchInput.trim().toLowerCase()

    const grouped = endpointsList.reduce((acc, ep) => {
      const isSearchMatch =
        !query ||
        ep.path.toLowerCase().includes(query) ||
        ep.action.toLowerCase().includes(query) ||
        (ep.description?.toLowerCase() || '').includes(query) ||
        getFriendlyLabel(ep.action, ep.path).toLowerCase().includes(query)

      if (!isSearchMatch) return acc

      const category =
        CATEGORY_MATCHERS.find((m) => m.match(ep.path))?.label ?? 'Other'

      if (selectedCategory !== 'all' && selectedCategory !== category) {
        return acc
      }

      if (!acc.has(category)) acc.set(category, [])
      acc.get(category)!.push(ep)
      return acc
    }, new Map<string, SecuredEndpoint[]>())

    const knownGroups = CATEGORY_MATCHERS.map(({ label }) => ({
      label,
      endpoints: grouped.get(label) ?? [],
    })).filter((group) => group.endpoints.length > 0)

    const otherEndpoints = grouped.get('Other') ?? []
    return otherEndpoints.length > 0
      ? [...knownGroups, { label: 'Other', endpoints: otherEndpoints }]
      : knownGroups
  }, [endpointsList, searchInput, selectedCategory])

  const allLabels = groupedEndpoints.map((g) => g.label)
  const areAllCollapsed =
    allLabels.length > 0 && allLabels.every((l) => collapsedGroups.has(l))

  const handleToggleAll = () => {
    if (areAllCollapsed) {
      expandAll()
    } else {
      collapseAll(allLabels)
    }
  }

  const handleConfirmSave = () => {
    setConfirmOpen(false)
    onSubmit()
  }

  return (
    <div className="flex flex-col">
      <div ref={sentinelRef} className="h-px" />
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Confirm Role Permission Update"
        message={
          <>
            Are you sure you want to save the changes for the{' '}
            <strong>{roleName}</strong> role?
          </>
        }
        confirmLabel="Save"
        cancelLabel="Cancel"
        onConfirm={handleConfirmSave}
        onCancel={() => setConfirmOpen(false)}
      />

      <div
        className={`sticky top-0 z-10 px-1 bg-white transition-all ${isStuck ? 'py-3 border-b border-line' : 'pb-1'}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-foreground leading-tight">
              Configure Authorization Actions
            </h2>
            <p className="text-body text-sm">
              Select the actions this role is permitted to access
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {isDirty && (addedCount > 0 || removedCount > 0) && (
              <div className="flex flex-col items-end gap-0.5 text-xs">
                {addedCount > 0 && (
                  <span className="text-emerald-600">+{addedCount} added</span>
                )}
                {removedCount > 0 && (
                  <span className="text-red-500">-{removedCount} removed</span>
                )}
              </div>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={() => setConfirmOpen(true)}
              disabled={isMutating || !isDirty}
              className="shrink-0"
            >
              {isMutating ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-1 flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:flex-1">
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            onClear={() => setSearchInput('')}
            placeholder="Search by action, path or label..."
            className="w-full bg-white"
            maxWidth="max-w-full"
          />
        </div>
        <div className="flex gap-3 shrink-0">
          <div className="w-full sm:w-52">
            <SelectDropdown
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={dynamicCategoryOptions}
              className="w-full"
            />
          </div>
          {allLabels.length > 0 && (
            <button
              type="button"
              onClick={handleToggleAll}
              className="text-xs text-brand font-medium hover:text-brand-strong transition-colors focus:outline-none cursor-pointer whitespace-nowrap mb-1"
            >
              {areAllCollapsed ? 'Expand All' : 'Collapse All'}
            </button>
          )}
        </div>
      </div>

      <div className="p-1">
        {error ? (
          <ErrorDisplay error={error} context="endpoints" />
        ) : isLoadingActions ? (
          <div className="loading-container">
            <LoadingSpinner size="md" />
          </div>
        ) : groupedEndpoints.length === 0 ? (
          <div className="text-center bg-surface-muted rounded border border-line py-8">
            <p className="text-sm text-subtle italic">
              {searchInput ? 'No actions match search' : 'No actions found'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {groupedEndpoints.map(({ label, endpoints }) => (
              <CategoryPanel
                key={label}
                label={label}
                endpoints={endpoints}
                isCollapsed={collapsedGroups.has(label)}
                onToggleCollapse={() => handleToggleGroup(label)}
                selectedActionIds={selectedActionIdsSet}
                onToggleAction={onToggleAction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default RoleDetailsPanel
