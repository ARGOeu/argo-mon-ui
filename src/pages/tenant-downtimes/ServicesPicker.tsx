import { useCallback, useEffect, useMemo, useState } from 'react'
import { useGetTopologyEndpoints } from '@/hooks/useTopology'
import { CheckIcon, XMarkIcon } from '@heroicons/react/16/solid'
import LoadingSpinner from '@/components/LoadingSpinner'
import SearchInput from '@/components/SearchInput'
import { getEndpointHostname } from './utils/downtimeServices'
import type { DowntimeServiceRequest } from '@/types/downtimes'
import type { EndpointTopologyItem } from '@/types/topology'

interface ServicesPickerProps {
  tenantId: string
  selected: DowntimeServiceRequest[]
  onChange: (services: DowntimeServiceRequest[]) => void
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
    (hostname: string, service: string) =>
      selected.some((s) => s.hostname === hostname && s.service === service),
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
      const hostname = getEndpointHostname(endpoint)
      return (
        hostname.toLowerCase().includes(query) ||
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

  const groupsByHostname = useMemo(() => {
    const map = new Map<string, Set<string>>()
    ;(endpoints ?? []).forEach((endpoint) => {
      const hostname = getEndpointHostname(endpoint)
      if (!map.has(hostname)) {
        map.set(hostname, new Set())
      }
      map.get(hostname)!.add(endpoint.group)
    })
    return map
  }, [endpoints])

  const selectedCountByGroup = useMemo(() => {
    const counts = new Map<string, number>()
    ;(endpoints ?? []).forEach((endpoint) => {
      const hostname = getEndpointHostname(endpoint)
      if (isSelected(hostname, endpoint.service)) {
        counts.set(endpoint.group, (counts.get(endpoint.group) ?? 0) + 1)
      }
    })
    return counts
  }, [endpoints, isSelected])

  const groupEndpoints = useMemo(() => {
    return (endpoints ?? []).filter(
      (endpoint) =>
        endpoint.group === selectedGroup && endpointMatchesQuery(endpoint),
    )
  }, [endpoints, selectedGroup, endpointMatchesQuery])

  const handleRemove = (hostname: string, service: string) => {
    onChange(
      selected.filter(
        (s) => !(s.hostname === hostname && s.service === service),
      ),
    )
  }

  const handleToggle = (hostname: string, service: string) => {
    if (isSelected(hostname, service)) {
      handleRemove(hostname, service)
    } else {
      onChange([...selected, { hostname, service }])
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((s, index) => (
            <span
              key={`${s.hostname}-${s.service}-${index}`}
              className="inline-flex items-center gap-1 bg-brand-muted text-brand text-xs font-medium px-2 py-0.5 rounded-full"
            >
              {s.hostname} · {s.service}
              <button
                type="button"
                onClick={() => handleRemove(s.hostname ?? '', s.service ?? '')}
                className="text-brand/70 hover:text-brand-strong hover:bg-brand/20 rounded-full p-px transition-colors cursor-pointer"
                aria-label={`Remove ${s.hostname} ${s.service}`}
              >
                <XMarkIcon className="size-4" />
              </button>
            </span>
          ))}
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
          <div className="w-2/5 border-r border-line flex flex-col">
            <p className="px-3 py-1.5 bg-surface-strong border-b border-line text-xs font-semibold text-muted tracking-wide shrink-0">
              Groups
            </p>
            <div className="overflow-y-auto">
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

          <div className="flex-1 flex flex-col">
            <p className="px-3 py-1.5 bg-surface-strong border-b border-line text-xs font-semibold text-muted tracking-wide shrink-0">
              Hostname & Service
            </p>
            <div className="overflow-y-auto">
              {!groupEndpoints.length ? (
                <p className="text-sm text-subtle italic px-4 py-3">
                  {searchInput
                    ? 'No endpoints match search'
                    : 'No endpoints in this group'}
                </p>
              ) : (
                groupEndpoints.map((endpoint, index) => {
                  const hostname = getEndpointHostname(endpoint)
                  const isChecked = isSelected(hostname, endpoint.service)
                  const otherGroups = Array.from(
                    groupsByHostname.get(hostname) ?? [],
                  ).filter((group) => group !== endpoint.group)

                  return (
                    <label
                      key={`${endpoint.group}-${hostname}-${endpoint.service}-${index}`}
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
                            handleToggle(hostname, endpoint.service)
                          }
                        />
                        {isChecked && (
                          <CheckIcon className="size-3 text-white" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm text-foreground break-all">
                            {hostname}
                          </span>
                          <span className="text-xs text-subtle">
                            {endpoint.service}
                          </span>
                        </div>
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
