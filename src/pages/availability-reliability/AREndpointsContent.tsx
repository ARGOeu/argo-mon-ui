import { useState, useMemo, useEffect } from 'react'
import PageHeader from '@/components/PageHeader'
import SearchInput from '@/components/SearchInput'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import Pagination from '@/components/Pagination'
import MonthlyEndpointsTable from './MonthlyEndpointsTable'
import { isNotFoundError } from '@/utils/isNotFoundError'
import type { EndpointsARResponse } from '@/types/availabilityReliability'

const pageSize = 20
const noticeContainerClass = 'text-center bg-surface-muted rounded-lg my-4'
const noticeTextClass = 'text-sm text-subtle italic py-6 px-12'

export interface AREndpointsContentProps {
  tenantName: string
  groupName: string
  reportName: string
  endpointsData: EndpointsARResponse | undefined
  isLoading: boolean
  error: Error | null
  onDrillDown: (
    serviceName: string,
    endpointName: string,
    month: string,
  ) => void
  backTo: string
}

const AREndpointsContent = ({
  tenantName,
  groupName,
  reportName,
  endpointsData,
  isLoading,
  error,
  onDrillDown,
  backTo,
}: AREndpointsContentProps) => {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const rows = useMemo(() => {
    if (!endpointsData) {
      return []
    }
    return endpointsData.results.flatMap((group) =>
      group['service-types'].flatMap((serviceType) =>
        serviceType.endpoints.map((endpoint) => ({
          serviceName: serviceType.name,
          endpointName: endpoint.name,
          url: endpoint.info?.URL,
          monthly: endpoint.results.map((result) => ({
            month: result.timestamp,
            availability: parseFloat(result.availability),
            reliability: parseFloat(result.reliability),
          })),
        })),
      ),
    )
  }, [endpointsData])

  const months = useMemo(
    () => rows[0]?.monthly.map((m) => m.month) ?? [],
    [rows],
  )

  const filteredRows = useMemo(
    () =>
      rows.filter(
        (row) =>
          row.serviceName.toLowerCase().includes(search.toLowerCase()) ||
          row.endpointName.toLowerCase().includes(search.toLowerCase()),
      ),
    [rows, search],
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const totalElements = filteredRows.length
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize))

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages))
  }, [totalPages])

  const paginatedRows = useMemo(
    () =>
      filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredRows, currentPage],
  )

  return (
    <div className="page-container mb-8">
      <PageHeader
        title={`Availability & Reliability for group ${decodeURIComponent(groupName || '')}`}
        subtitle={
          <>
            Monthly endpoint results for tenant{' '}
            <strong>{tenantName ? tenantName : '...'}</strong>
          </>
        }
        className="pb-2 mb-2"
        navigateTo={{
          label: 'Back to Monthly Group Results',
          to: backTo,
        }}
      />

      <div className="flex items-start justify-between gap-4 mb-1 flex-wrap">
        <SearchInput
          value={search}
          onChange={setSearch}
          onClear={() => setSearch('')}
          placeholder="Search services or endpoints..."
          className="max-w-[300px] w-full"
        />

        <span className="self-center text-[15px] font-medium text-body">
          Selected report:{' '}
          <strong className="text-muted">
            {decodeURIComponent(reportName || '')}
          </strong>
        </span>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <LoadingSpinner size="md" />
        </div>
      ) : isNotFoundError(error) ? (
        <div className={noticeContainerClass}>
          <p className={noticeTextClass}>
            This group has no data for the selected period
          </p>
        </div>
      ) : error ? (
        <ErrorDisplay
          error={error}
          context="loading endpoint availability and reliability results"
        />
      ) : (
        <>
          <MonthlyEndpointsTable
            rows={paginatedRows}
            months={months}
            onDrillDown={onDrillDown}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            itemLabel="endpoints"
            onPrev={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            onNext={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
          />
        </>
      )}
    </div>
  )
}

export default AREndpointsContent
