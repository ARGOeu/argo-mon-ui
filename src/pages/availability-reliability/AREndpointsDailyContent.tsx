import { useMemo } from 'react'
import {
  ArrowDownTrayIcon,
  DocumentTextIcon,
  TableCellsIcon,
} from '@heroicons/react/16/solid'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import ActionMenu from '@/components/ActionMenu'
import DailyAvailabilityTable from './DailyAvailabilityTable'
import { isNotFoundError } from '@/utils/isNotFoundError'
import { stripIdSuffix } from '@/utils/cleanup'
import { formatMonthLabel } from './utils/dateRanges'
import {
  buildCSV,
  downloadCSV,
  sanitizeFilename,
  type CsvField,
} from '@/utils/csvExport'
import type { EndpointsARResponse } from '@/types/availabilityReliability'

const noticeContainerClass = 'text-center bg-surface-muted rounded-lg my-4'
const noticeTextClass = 'text-sm text-subtle italic py-6 px-12'

export interface AREndpointsDailyContentProps {
  tenantName: string
  tenantLogoUrl?: string
  reportName: string
  serviceName: string
  endpointName: string
  month: string
  endpointData: EndpointsARResponse | undefined
  isLoading: boolean
  error: Error | null
  backTo: string
}

const AREndpointsDailyContent = ({
  tenantName,
  tenantLogoUrl,
  reportName,
  serviceName,
  endpointName,
  month,
  endpointData,
  isLoading,
  error,
  backTo,
}: AREndpointsDailyContentProps) => {
  const rows = useMemo(() => {
    if (!endpointData) {
      return []
    }
    return endpointData.results.flatMap((group) =>
      group['service-types'].flatMap((serviceType) =>
        serviceType.endpoints.flatMap((endpoint) =>
          endpoint.results.map((result) => ({
            date: result.timestamp,
            availability: parseFloat(result.availability),
            reliability: parseFloat(result.reliability),
            unknown: parseFloat(result.unknown),
            downtime: parseFloat(result.downtime),
          })),
        ),
      ),
    )
  }, [endpointData])

  const fname = useMemo(
    () =>
      endpointData?.results
        ?.flatMap((g) => g['service-types'])
        .flatMap((st) => st.endpoints)[0]
        ?.info?.fname?.trim() || undefined,
    [endpointData],
  )

  const decodedService = decodeURIComponent(serviceName || '')
  const decodedEndpoint = decodeURIComponent(endpointName || '')
  const cleanedEndpoint = stripIdSuffix(decodedEndpoint)
  const endpointLabel = fname ?? cleanedEndpoint

  const handleExport = () => {
    const fields: CsvField<(typeof rows)[number]>[] = [
      { label: 'Timestamp', value: 'date' },
      { label: 'Availability', value: 'availability' },
      { label: 'Reliability', value: 'reliability' },
      { label: 'Unknown', value: 'unknown' },
      { label: 'Downtime', value: 'downtime' },
    ]

    downloadCSV(
      `${sanitizeFilename(decodedService)}-${sanitizeFilename(decodedEndpoint)}-${month}-AR-Daily.csv`,
      buildCSV(rows, fields),
    )
  }

  const handleExportPdf = async () => {
    const { exportEndpointDailyArPdf } = await import('./utils/exportArPdf')
    await exportEndpointDailyArPdf({
      rows,
      serviceName: decodedService,
      endpointName: endpointLabel,
      month,
      tenantName,
      reportName: decodeURIComponent(reportName),
      tenantLogoUrl,
      filename: `${sanitizeFilename(decodedService)}-${sanitizeFilename(decodedEndpoint)}-${month}-AR-Daily.pdf`,
    })
  }

  return (
    <div className="page-container">
      <PageHeader
        title={`${decodedService} - ${month ? formatMonthLabel(month, 'long') : ''}`}
        subtitle={
          <>
            Service <strong>{decodedService}</strong>, Endpoint{' '}
            <strong>{endpointLabel}</strong>
            {fname && <span className="text-subtle"> ({cleanedEndpoint})</span>}
          </>
        }
        className="items-end pb-2 mb-1"
        navigateTo={{
          label: 'Back to Monthly Endpoints Results',
          to: backTo,
        }}
      >
        <ActionMenu
          label="Export"
          icon={ArrowDownTrayIcon}
          disabled={!rows.length}
          items={[
            { label: 'CSV', icon: TableCellsIcon, onClick: handleExport },
            { label: 'PDF', icon: DocumentTextIcon, onClick: handleExportPdf },
          ]}
          menuClassName="w-32"
        />
      </PageHeader>

      {isLoading ? (
        <div className="loading-container">
          <LoadingSpinner size="md" />
        </div>
      ) : isNotFoundError(error) ? (
        <div className={noticeContainerClass}>
          <p className={noticeTextClass}>
            This endpoint has no data for the selected date
          </p>
        </div>
      ) : error ? (
        <ErrorDisplay error={error} context="daily endpoint results" />
      ) : (
        <DailyAvailabilityTable rows={rows} showUnknownAndDowntime />
      )}
    </div>
  )
}

export default AREndpointsDailyContent
