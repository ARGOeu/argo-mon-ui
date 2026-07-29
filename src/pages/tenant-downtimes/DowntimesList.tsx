import { useEffect, useRef } from 'react'
import ErrorDisplay from '@/components/ErrorDisplay'
import LoadingSpinner from '@/components/LoadingSpinner'
import Tabs from '@/components/Tabs'
import IconButton from '@/components/IconButton'
import { XMarkIcon } from '@heroicons/react/16/solid'
import DowntimeCard from './DowntimeCard'
import {
  groupByDate,
  groupDowntimesByTimeStatus,
  sectionLabels,
} from './utils/downtimeGrouping'
import type { DowntimeTimeStatus, DowntimeTab } from './utils/downtimeGrouping'
import type { Downtime } from '@/types/downtimes'

interface DowntimesListProps {
  downtimes: Downtime[]
  isLoading: boolean
  error: Error | null
  canManage: boolean
  activeTab: DowntimeTab
  onTabChange: (tab: DowntimeTab) => void
  hasMoreCompleted: boolean
  isFetchingMoreCompleted: boolean
  onLoadMoreCompleted: () => void
  dateFilter: string
  onDateFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClearDateFilter: () => void
  showDateSelector: boolean
  onEdit: (downtime: Downtime) => void
  onDeleteClick: (downtime: Downtime) => void
}

const sectionDotClass: Record<DowntimeTimeStatus, string> = {
  active: 'bg-emerald-500',
  upcoming: 'bg-brand',
  completed: 'bg-gray-400',
}

const tabs = [
  { id: 'active-upcoming', label: 'Active & Upcoming' },
  { id: 'completed', label: 'Completed' },
]

const DowntimesList = ({
  downtimes,
  isLoading,
  error,
  canManage,
  activeTab,
  onTabChange,
  hasMoreCompleted,
  isFetchingMoreCompleted,
  onLoadMoreCompleted,
  dateFilter,
  onDateFilterChange,
  onClearDateFilter,
  showDateSelector,
  onEdit,
  onDeleteClick,
}: DowntimesListProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null)

  const downtimesByStatus = groupDowntimesByTimeStatus(downtimes)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || activeTab !== 'completed' || !hasMoreCompleted) {
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingMoreCompleted) {
          onLoadMoreCompleted()
        }
      },
      { threshold: 0 },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [
    activeTab,
    hasMoreCompleted,
    isFetchingMoreCompleted,
    onLoadMoreCompleted,
  ])

  const dateSelector = (
    <div className="ml-auto flex items-center gap-1 shrink-0">
      <label className="text-sm text-muted">Select a specific date:</label>
      <input
        type="date"
        value={dateFilter}
        onChange={onDateFilterChange}
        onClick={(e) => e.currentTarget.showPicker?.()}
        className="text-sm"
      />
      {dateFilter && (
        <IconButton
          icon={<XMarkIcon className="size-4.5" />}
          label=""
          onClick={onClearDateFilter}
          className="text-muted hover:bg-surface-strong !p-1"
        />
      )}
    </div>
  )

  const renderSectionBody = (items: Downtime[]) =>
    items.length === 0 ? (
      <p className="text-sm text-subtle italic py-3 text-center">
        No completed downtimes for this date
      </p>
    ) : (
      groupByDate(items).map((group) => (
        <div key={group.dateKey}>
          <p className="text-sm font-medium text-muted mb-1">
            {group.dateLabel}
          </p>
          <div className="bg-white border border-line rounded-lg divide-y divide-gray-100">
            {group.downtimes.map((downtime) => (
              <DowntimeCard
                key={downtime.id}
                downtime={downtime}
                canManage={canManage}
                onEdit={onEdit}
                onDeleteClick={onDeleteClick}
              />
            ))}
          </div>
        </div>
      ))
    )

  const activeUpcomingSections: {
    status: DowntimeTimeStatus
    items: Downtime[]
  }[] = [
    { status: 'active' as const, items: downtimesByStatus.active },
    { status: 'upcoming' as const, items: downtimesByStatus.upcoming },
  ].filter((section) => section.items.length > 0)

  return (
    <div>
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(id) => onTabChange(id as DowntimeTab)}
        className="mb-4"
      />

      {activeTab === 'completed' ? (
        !showDateSelector ? (
          <p className="text-center text-base text-subtle italic py-8">
            No matching downtimes
          </p>
        ) : (
          <div className="rounded-xl bg-surface-muted p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <span
                className={`size-2.5 rounded-full ${sectionDotClass.completed}`}
              />
              <h2 className="text-base font-semibold text-foreground  tracking-wide">
                {sectionLabels.completed}
              </h2>
              {dateSelector}
            </div>

            <div className="flex flex-col gap-3">
              {isLoading ? (
                <div className="flex justify-center py-2">
                  <LoadingSpinner size="md" />
                </div>
              ) : error ? (
                <ErrorDisplay error={error} context="downtimes" />
              ) : (
                renderSectionBody(downtimesByStatus.completed)
              )}
            </div>

            {hasMoreCompleted && <div ref={sentinelRef} className="h-px" />}
          </div>
        )
      ) : isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="md" />
        </div>
      ) : error ? (
        <div className="py-6">
          <ErrorDisplay error={error} context="downtimes" />
        </div>
      ) : !activeUpcomingSections.length ? (
        <p className="text-center text-base text-subtle italic py-8">
          No matching downtimes
        </p>
      ) : (
        <div className="flex flex-col gap-7">
          {activeUpcomingSections.map((section) => (
            <div
              key={section.status}
              className="rounded-xl bg-surface-muted p-4"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <span
                  className={`size-2.5 rounded-full ${sectionDotClass[section.status]}`}
                />
                <h2 className="text-base font-semibold text-foreground  tracking-wide">
                  {sectionLabels[section.status]}
                </h2>
              </div>

              <div className="flex flex-col gap-3">
                {renderSectionBody(section.items)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DowntimesList
