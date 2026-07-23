import { useCallback, useEffect, useMemo, useState } from 'react'
import { useGetTopologyEndpoints } from '@/hooks/useTopology'
import { CheckIcon, XMarkIcon } from '@heroicons/react/16/solid'
import LoadingSpinner from '@/components/LoadingSpinner'
import SearchInput from '@/components/SearchInput'
import type { DowntimeServiceRequest } from '@/types/downtimes'
import type { EndpointTopologyItem } from '@/types/topology'

export type SelectedEndpoint = DowntimeServiceRequest & {
  index?: number
}

interface ServicesPickerProps {
  tenantId: string
  selected: SelectedEndpoint[]
  onChange: (services: SelectedEndpoint[]) => void
}

const ServicesPicker = ({
  tenantId,
  selected,
  onChange,
}: ServicesPickerProps) => {
  const [searchInput, setSearchInput] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const {
    data: endpoints,
    isLoading,
    error,
  } = useGetTopologyEndpoints(tenantId)

  const isSelected = useCallback(
    (hostname: string, service: string, index?: number) =>
      selected.some(
        (s) =>
          s.hostname === hostname &&
          s.service === service &&
          (s.index === undefined || s.index === index),
      ),
    [selected],
  )

  const groups = useMemo(() => {
    const names = new Set((endpoints ?? []).map((endpoint) => endpoint.group))
    return Array.from(names).sort((a, b) => a.localeCompare(b))
  }, [endpoints])

  const query = searchInput.trim().toLowerCase()

  const endpointMatchesQuery = useCallback(
    (endpoint: EndpointTopologyItem) => {
      if (!query) {
        return true
      }
      return (
        endpoint.hostname.toLowerCase().includes(query) ||
        endpoint.service.toLowerCase().includes(query) ||
        endpoint.group.toLowerCase().includes(query)
      )
    },
    [query],
  )

  const visibleGroups = useMemo(() => {
    if (!query) {
      return groups
    }
    const groupsWithMatch = new Set(
      (endpoints ?? [])
        .filter(endpointMatchesQuery)
        .map((endpoint) => endpoint.group),
    )
    return groups.filter((group) => groupsWithMatch.has(group))
  }, [groups, endpoints, query, endpointMatchesQuery])

  useEffect(() => {
    if (visibleGroups.length === 0) {
      return
    }
    if (!selectedGroup || !visibleGroups.includes(selectedGroup)) {
      setSelectedGroup(visibleGroups[0])
    }
  }, [visibleGroups, selectedGroup])

  const groupsByTagsHostnameAndService = useMemo(() => {
    const map = new Map<string, Set<string>>()
    ;(endpoints ?? []).forEach((endpoint) => {
      const tagsHostname = endpoint.tags?.hostname
      if (!tagsHostname) {
        return
      }
      const key = `${tagsHostname}|${endpoint.service}`
      if (!map.has(key)) {
        map.set(key, new Set())
      }
      map.get(key)!.add(endpoint.group)
    })
    return map
  }, [endpoints])

  const selectedCountByGroup = useMemo(() => {
    const counts = new Map<string, number>()
    ;(endpoints ?? []).forEach((endpoint, index) => {
      if (isSelected(endpoint.hostname, endpoint.service, index)) {
        counts.set(endpoint.group, (counts.get(endpoint.group) ?? 0) + 1)
      }
    })
    return counts
  }, [endpoints, isSelected])

  const groupEndpoints = useMemo(() => {
    return (endpoints ?? [])
      .map((endpoint, index) => ({ endpoint, index }))
      .filter(
        ({ endpoint }) =>
          endpoint.group === selectedGroup && endpointMatchesQuery(endpoint),
      )
  }, [endpoints, selectedGroup, endpointMatchesQuery])

  const handleRemove = (hostname: string, service: string, index?: number) => {
    onChange(
      selected.filter(
        (s) =>
          !(
            s.hostname === hostname &&
            s.service === service &&
            (s.index === undefined || s.index === index)
          ),
      ),
    )
  }

  const handleToggle = (hostname: string, service: string, index?: number) => {
    if (isSelected(hostname, service, index)) {
      handleRemove(hostname, service, index)
    } else {
      onChange([...selected, { hostname, service, index }])
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((s, chipIndex) => {
            const matchedEndpoint =
              s.index !== undefined ? endpoints?.[s.index] : undefined
            const chipHostname = s.hostname || matchedEndpoint?.tags?.hostname
            const chipLabel = `${chipHostname} · ${s.service}`

            return (
              <span
                key={`${s.hostname}-${s.service}-${s.index ?? chipIndex}`}
                className="inline-flex items-center gap-1 bg-brand-muted text-brand text-xs font-medium px-2 py-0.5 rounded-full"
              >
                <span className="truncate max-w-48" title={chipLabel}>
                  {chipLabel}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onChange(selected.filter((_, i) => i !== chipIndex))
                  }
                  className="text-brand/70 hover:text-brand-strong hover:bg-brand/20 rounded-full p-px transition-colors cursor-pointer shrink-0"
                  aria-label={`Remove ${s.hostname} ${s.service}`}
                >
                  <XMarkIcon className="size-4" />
                </button>
              </span>
            )
          })}
        </div>
      )}

      <SearchInput
        value={searchInput}
        onChange={setSearchInput}
        onClear={() => setSearchInput('')}
        placeholder="Search by group, hostname or service"
        className="!mb-0"
      />

      {isLoading ? (
        <div className="flex justify-center py-6 border border-line-strong rounded-lg bg-white">
          <LoadingSpinner size="sm" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-600 px-4 py-3 border border-line-strong rounded-lg bg-white">
          Failed to load topology endpoints
        </p>
      ) : !groups.length ? (
        <p className="text-sm text-subtle italic px-4 py-3 border border-line-strong rounded-lg bg-white">
          No topology endpoints found
        </p>
      ) : (
        <div className="flex border border-line-strong rounded-lg bg-white overflow-hidden max-h-72">
          <div className="w-2/5 border-r border-line flex flex-col min-h-0">
            <p className="px-3 py-1.5 bg-surface-strong border-b border-line text-xs font-semibold text-muted tracking-wide shrink-0">
              Groups
            </p>
            <div className="overflow-y-auto flex-1 min-h-0">
              {!visibleGroups.length ? (
                <p className="text-sm text-subtle italic px-3 py-3">
                  No groups match search
                </p>
              ) : (
                visibleGroups.map((group) => {
                  const isActive = group === selectedGroup
                  const selectedCount = selectedCountByGroup.get(group) ?? 0
                  return (
                    <button
                      key={group}
                      type="button"
                      onClick={() => setSelectedGroup(group)}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 text-left border-b border-line last:border-b-0 cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-brand-subtle text-brand font-medium'
                          : 'hover:bg-surface-muted text-foreground'
                      }`}
                    >
                      <span className="text-sm break-all">{group}</span>
                      {selectedCount > 0 && (
                        <span className="text-xs text-subtle shrink-0">
                          {selectedCount}
                        </span>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <p className="px-3 py-1.5 bg-surface-strong border-b border-line text-xs font-semibold text-muted tracking-wide shrink-0">
              Endpoints
            </p>
            <div className="overflow-y-auto flex-1 min-h-0">
              {!groupEndpoints.length ? (
                <p className="text-sm text-subtle italic px-4 py-3">
                  {searchInput
                    ? 'No endpoints match search'
                    : 'No endpoints in this group'}
                </p>
              ) : (
                groupEndpoints.map(({ endpoint, index }) => {
                  const infoUrl = endpoint.tags?.info_URL
                  const infoId = endpoint.tags?.info_ID
                  const tagsHostname = endpoint.tags?.hostname
                  const isChecked = isSelected(
                    endpoint.hostname,
                    endpoint.service,
                    index,
                  )
                  const otherGroups = tagsHostname
                    ? Array.from(
                        groupsByTagsHostnameAndService.get(
                          `${tagsHostname}|${endpoint.service}`,
                        ) ?? [],
                      ).filter((group) => group !== endpoint.group)
                    : []
                  const displayName =
                    infoUrl || tagsHostname || endpoint.hostname

                  return (
                    <label
                      key={`${infoUrl ?? ''}-${endpoint.group}-${endpoint.hostname}-${endpoint.service}-${index}`}
                      className={`flex items-start gap-3 px-3 py-1.5 border-t border-line first:border-t-0 cursor-pointer transition-colors ${
                        isChecked ? 'bg-brand-subtle' : 'hover:bg-surface-muted'
                      }`}
                    >
                      <div
                        className={`relative size-4 shrink-0 rounded border flex items-center justify-center transition-colors mt-0.5 ${
                          isChecked
                            ? 'bg-brand border-brand'
                            : 'border-line-strong bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={isChecked}
                          onChange={() =>
                            handleToggle(
                              endpoint.hostname,
                              endpoint.service,
                              index,
                            )
                          }
                        />
                        {isChecked && (
                          <CheckIcon className="size-3 text-white" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm text-foreground break-all">
                          {displayName}
                        </span>
                        <span className="text-xs text-subtle">
                          {infoId
                            ? `${infoId} · ${endpoint.service}`
                            : endpoint.service}
                        </span>
                        {isChecked && otherGroups.length > 0 && (
                          <span className="text-sm text-amber-600 mt-0.5">
                            This hostname also exists in group
                            {otherGroups.length > 1 ? 's' : ''}:{' '}
                            {otherGroups
                              .map((group) => `"${group}"`)
                              .join(', ')}
                            . <br />
                            It will be marked as affected in all of them, not
                            just in group "{endpoint.group}".
                          </span>
                        )}
                      </div>
                    </label>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ServicesPicker
