import { useEffect, useRef, useState } from 'react'
import ErrorDisplay from '@/components/ErrorDisplay'
import LoadingSpinner from '@/components/LoadingSpinner'
import Tabs from '@/components/Tabs'
import DowntimeCard from './DowntimeCard'
import {
  groupByDate,
  groupDowntimesByTimeStatus,
  sectionLabels,
} from './utils/downtimeGrouping'
import type { DowntimeTimeStatus } from './utils/downtimeGrouping'
import type { DowntimeResponse } from '@/types/downtimes'

interface DowntimesListProps {
  downtimes: DowntimeResponse[]
  isLoading: boolean
  error: Error | null
  canManage: boolean
  onEdit: (downtime: DowntimeResponse) => void
  onDeleteClick: (downtime: DowntimeResponse) => void
}

const sectionDotClass: Record<DowntimeTimeStatus, string> = {
  active: 'bg-emerald-500',
  upcoming: 'bg-brand',
  completed: 'bg-gray-400',
}

const completedPageSize = 10

type ListTab = 'active-upcoming' | 'completed'

const DowntimesList = ({
  downtimes,
  isLoading,
  error,
  canManage,
  onEdit,
  onDeleteClick,
}: DowntimesListProps) => {
  const [activeTab, setActiveTab] = useState<ListTab>('active-upcoming')
  const [visibleCompletedCount, setVisibleCompletedCount] =
    useState(completedPageSize)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const buckets = groupDowntimesByTimeStatus(downtimes)
  const visibleCompleted = buckets.completed.slice(0, visibleCompletedCount)
  const hasMoreCompleted = buckets.completed.length > visibleCompleted.length

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMoreCompleted) {
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCompletedCount((prev) => prev + completedPageSize)
        }
      },
      { threshold: 0 },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMoreCompleted, activeTab])

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="md" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-6">
        <ErrorDisplay error={error} context="downtimes" />
      </div>
    )
  }

  const activeUpcomingCount = buckets.active.length + buckets.upcoming.length
  const tabs = [
    {
      id: 'active-upcoming',
      label: `Active & Upcoming (${activeUpcomingCount})`,
    },
    { id: 'completed', label: `Completed (${buckets.completed.length})` },
  ]

  const sections: {
    status: DowntimeTimeStatus
    items: DowntimeResponse[]
    totalCount: number
  }[] =
    activeTab === 'active-upcoming'
      ? [
          {
            status: 'active' as const,
            items: buckets.active,
            totalCount: buckets.active.length,
          },
          {
            status: 'upcoming' as const,
            items: buckets.upcoming,
            totalCount: buckets.upcoming.length,
          },
        ].filter((section) => section.items.length > 0)
      : [
          {
            status: 'completed' as const,
            items: visibleCompleted,
            totalCount: buckets.completed.length,
          },
        ].filter((section) => section.items.length > 0)

  return (
    <div>
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as ListTab)}
        className="mb-4"
      />

      {!sections.length ? (
        <p className="text-center text-base text-subtle italic py-8">
          No matching downtimes
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          {sections.map((section) => (
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
                <span className="text-sm text-subtle">
                  ({section.totalCount})
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {groupByDate(section.items).map((group) => (
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
                ))}
              </div>

              {section.status === 'completed' && hasMoreCompleted && (
                <div ref={sentinelRef} className="h-px" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DowntimesList
