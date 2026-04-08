import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import {
  useGetSecuredEndpoints,
  useAddEndpointRulesMutation,
  useGetAuthorizationRules,
} from '@/hooks/useSecuredEndpoints'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import SearchInput from '@/components/SearchInput'
import SelectDropdown from '@/components/SelectDropdown'
import CategoryPanel from './CategoryPanel'
import EndpointDetailsPanel from './EndpointDetailsPanel'
import type { SecuredEndpoint } from '@/types/securedEndpoints'
import { CATEGORY_OPTIONS } from './constants/endpointCategories'
import {
  useEndpointGrouping,
  useAutoSelectEndpoint,
  useEndpointRulesManager,
  useGroupCollapse,
} from './hooks/useEndpointManagement'

const EndpointsAccess = () => {
  const [searchInput, setSearchInput] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { collapsedGroups, handleToggleGroup } = useGroupCollapse()

  const {
    data: endpointsPagesData,
    isLoading,
    error,
    fetchNextPage: fetchNextEndpointsPage,
    hasNextPage: hasNextEndpointsPage,
  } = useGetSecuredEndpoints()

  useEffect(() => {
    if (hasNextEndpointsPage) {
      fetchNextEndpointsPage()
    }
  }, [endpointsPagesData, hasNextEndpointsPage, fetchNextEndpointsPage])

  const endpointsList = useMemo(() => {
    return (
      endpointsPagesData?.pages?.flatMap((page) => page.content || []) || []
    )
  }, [endpointsPagesData])

  const { data: endpointRules } = useGetAuthorizationRules(
    selectedId,
    !!selectedId,
  )
  const { mutate: addRules, isPending: isMutating } =
    useAddEndpointRulesMutation()

  const groupedEndpoints = useEndpointGrouping(
    endpointsList,
    searchInput,
    selectedCategory,
  )
  useAutoSelectEndpoint(groupedEndpoints, selectedId, setSelectedId)

  const { toggleRule, getRulesForEndpoint, clearPendingRules } =
    useEndpointRulesManager(selectedId, endpointRules)

  const selectedEndpoint = useMemo(() => {
    return (
      endpointsList.find((ep) => ep.secured_endpoint_id === selectedId) ?? null
    )
  }, [selectedId, endpointsList])

  const handleSubmitRules = (endpoint: SecuredEndpoint) => {
    const rules = getRulesForEndpoint()

    addRules(
      { endpointId: endpoint.secured_endpoint_id, body: { rules } },
      {
        onSuccess: (response) => {
          toast.success(response.message || 'Rules saved successfully')
          clearPendingRules()
        },
        onError: (err) => {
          toast.error(`Failed to save rules: ${err.message}`)
        },
      },
    )
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Endpoints Access"
        subtitle="Manage authorization rules for protected API endpoints"
        className="mb-4"
      />

      {isLoading ? (
        <div className="loading-container">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <ErrorDisplay error={error} context="endpoints access" />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 w-full mb-1">
            <div className="w-full sm:w-[400px]">
              <SearchInput
                value={searchInput}
                onChange={(value) => {
                  setSearchInput(value)
                }}
                onClear={() => {
                  setSearchInput('')
                }}
                placeholder="Search by path or method..."
                className="w-full"
                maxWidth="max-w-full"
              />
            </div>
            <div className="w-full sm:w-64">
              <SelectDropdown
                value={selectedCategory}
                onChange={setSelectedCategory}
                options={CATEGORY_OPTIONS}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 items-start">
            {/* Left Column: Endpoints List */}
            <div className="max-h-[calc(100vh-150px)] overflow-y-auto pr-1 pb-4 min-w-0">
              {groupedEndpoints.length === 0 ? (
                <div className="text-center bg-surface-muted rounded border border-line py-8 mt-2">
                  <p className="text-sm text-subtle italic">
                    {searchInput
                      ? 'No endpoints match your search'
                      : 'No endpoints found'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 mt-1">
                  {groupedEndpoints.map(({ label, endpoints }) => (
                    <CategoryPanel
                      key={label}
                      label={label}
                      endpoints={endpoints}
                      isCollapsed={collapsedGroups.has(label)}
                      onToggleCollapse={() => handleToggleGroup(label)}
                      selectedId={selectedId}
                      onSelectEndpoint={setSelectedId}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Endpoint Details Panel */}
            <div className="sticky top-6 min-w-0">
              {selectedEndpoint && (
                <EndpointDetailsPanel
                  endpoint={selectedEndpoint}
                  selectedRules={getRulesForEndpoint()}
                  onRuleToggle={(rule: string) => toggleRule(rule)}
                  onSubmit={() => handleSubmitRules(selectedEndpoint)}
                  isMutating={isMutating}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default EndpointsAccess
