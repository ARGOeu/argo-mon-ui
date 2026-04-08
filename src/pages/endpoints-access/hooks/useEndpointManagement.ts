import { useState, useMemo, useEffect } from 'react'
import { CATEGORY_MATCHERS } from '../constants/endpointCategories'
import { AVAILABLE_RULES } from '../constants/endpointRules'
import type {
  SecuredEndpoint,
  AuthorizationRules,
} from '@/types/securedEndpoints'

export const useEndpointGrouping = (
  endpoints: SecuredEndpoint[],
  searchInput: string,
  selectedCategory: string,
) => {
  return useMemo(() => {
    const defaultSearch = searchInput.trim().toLowerCase()

    const grouped = endpoints.reduce((acc, ep) => {
      const isSearchMatch =
        !defaultSearch ||
        ep.path.toLowerCase().includes(defaultSearch) ||
        ep.action.toLowerCase().includes(defaultSearch) ||
        (ep.description?.toLowerCase() || '').includes(defaultSearch)

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

    return CATEGORY_MATCHERS.map(({ label }) => ({
      label,
      endpoints: grouped.get(label) ?? [],
    })).filter((group) => group.endpoints.length > 0)
  }, [endpoints, searchInput, selectedCategory])
}

export const useAutoSelectEndpoint = (
  groupedEndpoints: { label: string; endpoints: SecuredEndpoint[] }[],
  selectedId: string | null,
  setSelectedId: (id: string | null) => void,
) => {
  useEffect(() => {
    if (groupedEndpoints.length === 0) {
      if (selectedId !== null) {
        setSelectedId(null)
      }
      return
    }

    const firstEndpointId =
      groupedEndpoints[0].endpoints[0]?.secured_endpoint_id
    if (!selectedId) {
      setSelectedId(firstEndpointId)
      return
    }

    const isPresent = groupedEndpoints.some((g) =>
      g.endpoints.some((e) => e.secured_endpoint_id === selectedId),
    )

    if (!isPresent) {
      setSelectedId(firstEndpointId)
    }
  }, [groupedEndpoints, selectedId, setSelectedId])
}

export const useEndpointRulesManager = (
  selectedId: string | null,
  endpointRules: AuthorizationRules[] | undefined,
) => {
  const [selectedRules, setSelectedRules] = useState<string[] | null>(null)

  useEffect(() => {
    // Reset unsaved rule changes whenever the selected endpoint changes
    const validRules = new Set(AVAILABLE_RULES.map((r) => r.value))
    const defaultRules =
      endpointRules?.map((r) => r.rule).filter((r) => validRules.has(r)) ?? []
    setSelectedRules(defaultRules)
  }, [selectedId, endpointRules])

  const getRulesForEndpoint = () => {
    return selectedRules ?? []
  }

  const toggleRule = (rule: string) => {
    setSelectedRules((current) => {
      const activeRules = current ?? []
      return activeRules.includes(rule)
        ? activeRules.filter((r) => r !== rule)
        : [...activeRules, rule]
    })
  }

  const clearPendingRules = () => {
    const validRules = new Set(AVAILABLE_RULES.map((r) => r.value))
    const defaultRules =
      endpointRules?.map((r) => r.rule).filter((r) => validRules.has(r)) ?? []
    setSelectedRules(defaultRules)
  }

  return { toggleRule, getRulesForEndpoint, clearPendingRules }
}

export const useGroupCollapse = () => {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  const handleToggleGroup = (label: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  return { collapsedGroups, handleToggleGroup }
}
