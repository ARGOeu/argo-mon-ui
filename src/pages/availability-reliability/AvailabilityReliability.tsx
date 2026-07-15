import { useState, useMemo, useEffect } from 'react'
import { useGetGroupsAvailabilityReliability } from '@/hooks/useAvailabilityReliability'
import { useGetTenantReports } from '@/hooks/useTenants'
import { useSelectedTenant } from '@/contexts/selected-tenant'
import { useParams, useSearchParams } from 'react-router-dom'
import PageHeader from '@/components/PageHeader'
import SearchInput from '@/components/SearchInput'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import SelectDropdown from '@/components/SelectDropdown'
import MonthlyAvailabilityTable from './MonthlyAvailabilityTable'

const toW3CTimestamp = (date: Date): string =>
  date.toISOString().replace(/\.\d{3}Z$/, 'Z')

const getLastThreeMonthsRange = (): { startTime: string; endTime: string } => {
  const now = new Date()
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 2, 1, 0, 0, 0),
  )
  return { startTime: toW3CTimestamp(start), endTime: toW3CTimestamp(now) }
}

const AvailabilityReliability = () => {
  const { id } = useParams<{ id: string }>()
  const tenantId = id || ''
  const [searchParams, setSearchParams] = useSearchParams()
  const { tenant: tenantData } = useSelectedTenant()

  const [search, setSearch] = useState('')

  const { data: reports } = useGetTenantReports(tenantId)

  const selectedReportName = searchParams.get('report') || reports?.[0]?.name

  useEffect(() => {
    if (!searchParams.get('report') && reports?.[0]?.name) {
      setSearchParams({ report: reports[0].name }, { replace: true })
    }
  }, [reports, searchParams, setSearchParams])

  const { startTime, endTime } = useMemo(() => getLastThreeMonthsRange(), [])

  const {
    data: groupsData,
    isLoading,
    error,
  } = useGetGroupsAvailabilityReliability(
    tenantId,
    selectedReportName || '',
    'monthly',
    startTime,
    endTime,
    !!selectedReportName,
  )

  const groups = useMemo(() => {
    if (!groupsData) {
      return []
    }
    return groupsData.results.flatMap((projectGroup) =>
      projectGroup.groups.map((group) => ({
        name: group.name,
        monthly: group.results.map((result) => ({
          month: result.timestamp,
          availability: parseFloat(result.availability),
          reliability: parseFloat(result.reliability),
        })),
      })),
    )
  }, [groupsData])

  const months = useMemo(
    () => groups[0]?.monthly.map((m) => m.month) ?? [],
    [groups],
  )

  const filteredGroups = useMemo(
    () =>
      groups.filter((group) =>
        group.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [groups, search],
  )

  return (
    <div className="page-container">
      <PageHeader
        title="Availability & Reliability"
        subtitle={
          <>
            Monthly availability and reliability results for tenant{' '}
            <strong>
              {tenantData?.info.name ? tenantData.info.name : '...'}
            </strong>
          </>
        }
        className="pb-2 mb-4"
      />

      <div className="flex items-start justify-between gap-4 mb-1.5 flex-wrap">
        <SearchInput
          value={search}
          onChange={setSearch}
          onClear={() => setSearch('')}
          placeholder="Search groups..."
        />

        {reports && reports.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold text-body">
              Select a report:
            </span>
            <SelectDropdown
              value={selectedReportName || ''}
              onChange={(value) =>
                setSearchParams({ report: value }, { replace: true })
              }
              options={reports.map((report) => ({
                value: report.name,
                label: report.name,
              }))}
              className="w-[220px]"
            />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="loading-container">
          <LoadingSpinner size="md" />
        </div>
      ) : error ? (
        <ErrorDisplay
          error={error}
          context="loading availability and reliability results"
        />
      ) : (
        <MonthlyAvailabilityTable groups={filteredGroups} months={months} />
      )}
    </div>
  )
}

export default AvailabilityReliability
