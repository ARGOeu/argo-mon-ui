import { Info } from 'lucide-react'
import { useGetPublicTenantReports } from '@/hooks/useTenants'
import { useGetResultsGroups, useGetStatusGroups } from '@/hooks/useData'
import { useTenantName } from '@/hooks/useTenantName'
import {
  computeAvailabilityStats,
  computeStatusStats,
} from '@/utils/capabilityStats'
import PageHeader from '@/components/PageHeader'
import CapabilitiesContent from '@/pages/tenant-capabilities/CapabilitiesContent'

const PublicCapabilitiesContainer = () => {
  const { tenantName } = useTenantName()

  const {
    data: reports,
    isLoading: reportsLoading,
    error: reportsError,
  } = useGetPublicTenantReports(tenantName ?? '', true)

  const nodeReport = reports?.find((r) => r.node === true)

  const {
    data: availabilityData,
    isLoading: isAvailabilityLoading,
    error: availabilityError,
  } = useGetResultsGroups(
    tenantName ?? '',
    'public',
    nodeReport?.name,
    undefined,
    undefined,
    !!nodeReport,
  )

  const {
    data: statusData,
    isLoading: isStatusLoading,
    error: statusError,
  } = useGetStatusGroups(
    tenantName ?? '',
    'public',
    nodeReport?.name ?? '',
    undefined,
    !!nodeReport,
  )

  const isLoading = reportsLoading || isAvailabilityLoading || isStatusLoading

  const availabilityStats = computeAvailabilityStats(
    availabilityData?.data?.flatMap((d) => d.results) ?? [],
  )

  const { statusStats, statusCounts } = computeStatusStats(
    statusData?.data?.flatMap((d) => d.results) ?? [],
  )

  return (
    <div className="page-container">
      <PageHeader
        title="Capabilities"
        subtitle={
          <>
            Explore capabilities for tenant{' '}
            <strong>{tenantName ?? '...'}</strong>
          </>
        }
        className="pb-2 mb-2"
      />

      {!isLoading && !nodeReport ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white px-12 py-4 mt-6 text-center shadow-sm">
          <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-brand-subtle">
            <Info className="h-6 w-6 text-brand" />
          </div>
          <h3 className="mb-1 text-lg font-medium text-neutral-900">
            Capabilities Not Available
          </h3>
          <p className="max-w-sm text-sm text-neutral-500">
            This tenant does not have capability data available publicly.
          </p>
        </div>
      ) : (
        <CapabilitiesContent
          tenantName={tenantName ?? ''}
          availabilityStats={availabilityStats}
          statusStats={statusStats}
          statusCounts={statusCounts}
          isLoading={isLoading}
          error={reportsError || availabilityError || statusError}
        />
      )}
    </div>
  )
}

export default PublicCapabilitiesContainer
