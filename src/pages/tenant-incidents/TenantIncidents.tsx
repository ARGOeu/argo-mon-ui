import { useEffect, useRef, useState } from 'react'
import { useSelectedTenant } from '@/contexts/selected-tenant'
import { useGetTenantIncidents } from '@/hooks/useIncidents'
import { useParams } from 'react-router-dom'
import Button from '@/components/Button'
import ErrorDisplay from '@/components/ErrorDisplay'
import LoadingSpinner from '@/components/LoadingSpinner'
import PageHeader from '@/components/PageHeader'
import SearchInput from '@/components/SearchInput'
import IncidentCard from './IncidentCard'
import { useCanManageIncidents } from './useCanManageIncidents'

const pageSize = 10

const TenantIncidents = () => {
  const { id: tenantId } = useParams<{ id: string }>()
  const { tenant: tenantData } = useSelectedTenant()
  const { canManage } = useCanManageIncidents()

  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchInput])

  const {
    data: incidentsData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetTenantIncidents(tenantId ?? '', {
    size: pageSize,
    search: searchQuery || undefined,
  })

  const incidents = incidentsData?.pages.flatMap((page) => page.content) ?? []

  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasNextPage) {
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0 },
    )
    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <div className="page-container mb-8">
      <PageHeader
        className="mb-4"
        title="Incidents"
        subtitle={
          <>
            View and manage reported incidents for tenant
            <strong className="break-all">
              {tenantData?.info.name ? ` ${tenantData.info.name}` : '...'}
            </strong>
          </>
        }
      >
        {canManage && (
          <Button
            variant="primary"
            size="md"
            href={`/tenants/${tenantId}/incidents/create`}
          >
            Report Incident
          </Button>
        )}
      </PageHeader>

      <SearchInput
        value={searchInput}
        onChange={setSearchInput}
        onClear={() => setSearchInput('')}
        placeholder="Search by incident title or service name"
      />

      {isLoading ? (
        <div className="loading-container">
          <LoadingSpinner size="md" />
        </div>
      ) : error ? (
        <ErrorDisplay error={error} context="incidents" />
      ) : !incidents.length ? (
        <p className="text-center text-base text-subtle italic py-8">
          No incidents found
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-8 mt-4 [@media(max-height:700px)]:gap-4">
            {incidents.map((incident) => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </div>

          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <LoadingSpinner size="md" />
            </div>
          )}

          {hasNextPage && <div ref={sentinelRef} className="h-px" />}
        </>
      )}
    </div>
  )
}

export default TenantIncidents
