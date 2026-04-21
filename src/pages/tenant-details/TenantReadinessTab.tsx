import { useState, useEffect, useRef } from 'react'
import {
  useGetTenantReadiness,
  useCheckReadinessMutation,
  useGetUserTenantStatus,
} from '@/hooks/useTenants'
import { useSelectedTenant } from '@/contexts/selected-tenant'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import Button from '@/components/Button'
import Badge from '@/components/Badge'
import { formatDateTime } from '@/utils/formatDateTime'
import type { ReadinessCheckDetail, JobStatus } from '@/types/tenants'
import { toast } from 'sonner'

const READINESS_CHECK_INTERVAL_MS = 10000

interface TenantReadinessTabProps {
  tenantId: string
}

const TenantReadinessTab = ({ tenantId }: TenantReadinessTabProps) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isRecentlyChecked, setIsRecentlyChecked] = useState(false)

  const { tenant: tenantData, isTenantLoading: tenantLoading } =
    useSelectedTenant()

  const {
    data: readinessData,
    isLoading: readinessLoading,
    error: readinessError,
  } = useGetTenantReadiness(tenantId, true, READINESS_CHECK_INTERVAL_MS)

  const { data: statusData } = useGetUserTenantStatus(
    tenantId,
    READINESS_CHECK_INTERVAL_MS,
  )

  const notifyCheckReadinessMutation = useCheckReadinessMutation()

  const checkReadinessJob = statusData?.status?.jobs?.find(
    (job) => job.name === 'CHECK_READINESS',
  )

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleCheckReadiness = () => {
    if (!tenantId || !tenantData?.info.name) {
      toast.error('Tenant information is not available')
      return
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setIsRecentlyChecked(true)

    timeoutRef.current = setTimeout(() => {
      setIsRecentlyChecked(false)
      timeoutRef.current = null
    }, READINESS_CHECK_INTERVAL_MS)

    notifyCheckReadinessMutation.mutate(
      {
        tenantId,
        tenantName: tenantData.info.name,
      },
      {
        onSuccess: (data) => {
          const job = data.jobs?.find((j) => j.name === 'CHECK_READINESS')
          const message = job?.message
          if (message) {
            toast.success(message)
          }
        },
        onError: (error: Error) => {
          toast.error(`Failed to check readiness: ${error.message}`)
        },
      },
    )
  }

  const readiness = readinessData?.data
  const hasError = readinessError || !tenantData

  const getJobStatusDisplay = (status: JobStatus): string => {
    if (status === 'UNKNOWN') return 'Unknown'
    if (status === 'INITIALISING') return 'Initialising'
    if (status === 'INITIALISED') return 'Initialised'
    if (status === 'FAILED_INITIALISATION') return 'Failed Initialisation'
    if (status === 'IN_PROGRESS') return 'In Progress'
    if (status === 'COMPLETED') return 'Completed'
    if (status === 'FAILED') return 'Failed'
    return status
  }

  const getJobStatusClass = (status: JobStatus): string => {
    if (status === 'COMPLETED') return 'bg-emerald-100 text-emerald-800'
    if (status === 'IN_PROGRESS') return 'bg-brand-muted text-brand'
    if (status === 'INITIALISING') return 'bg-indigo-100 text-indigo-700'
    if (status === 'INITIALISED') return 'bg-brand-muted text-blue-600'
    if (status === 'FAILED') return 'bg-red-100 text-red-800'
    if (status === 'FAILED_INITIALISATION') return 'bg-red-100 text-red-800'
    return 'bg-surface-strong text-muted'
  }

  const shouldShowJobStatus = (status?: JobStatus): boolean => {
    if (!status) return false
    return status !== 'UNKNOWN'
  }

  const renderCheckDetail = (
    title: string,
    detail: ReadinessCheckDetail | undefined,
  ) => {
    if (!detail) return null

    const hasMessage = detail.message && detail.message.trim().length > 0
    const displayMessage = hasMessage
      ? detail.message
      : 'No additional details provided'

    return (
      <div className="bg-white border border-line rounded-lg p-4 shadow-sm transition-all hover:shadow-md">
        <div className="flex flex-col items-start gap-2 md:flex-row md:justify-between md:items-center md:gap-0 mb-3">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-semibold text-foreground m-0">
              {title}
            </h3>
          </div>
          <Badge
            size="lg"
            className={
              detail.ready
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-600'
            }
          >
            {detail.ready ? 'Ready' : 'Not Ready'}
          </Badge>
        </div>
        <div
          className={`text-sm leading-relaxed ${hasMessage ? 'text-muted' : 'text-subtle italic'}`}
        >
          {displayMessage}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1240px] flex flex-col gap-2 mx-auto mb-6">
      <div className="flex items-center">
        <div className="flex flex-col gap-2 mb-2">
          <div className="flex flex-col gap-1 max-w-full">
            <p className="text-[0.9375rem] text-muted leading-relaxed m-0">
              Trigger a manual readiness check to verify tenant status
            </p>
          </div>
          <Button
            variant="primary"
            onClick={handleCheckReadiness}
            className="w-fit min-w-[200px]"
            disabled={
              notifyCheckReadinessMutation.isPending ||
              checkReadinessJob?.status === 'IN_PROGRESS' ||
              checkReadinessJob?.status === 'INITIALISING' ||
              checkReadinessJob?.status === 'INITIALISED' ||
              isRecentlyChecked
            }
          >
            {notifyCheckReadinessMutation.isPending
              ? 'Checking...'
              : 'Check Readiness'}
          </Button>
          {checkReadinessJob &&
            checkReadinessJob.status &&
            shouldShowJobStatus(checkReadinessJob.status) && (
              <div className="flex flex-col gap-2 p-3 bg-surface-muted border border-line rounded-lg my-2 max-w-[500px] min-w-[320px] shadow-sm">
                <Badge
                  size="lg"
                  className={`w-fit shadow-sm ${getJobStatusClass(checkReadinessJob.status)}`}
                >
                  {getJobStatusDisplay(checkReadinessJob.status)}
                </Badge>
                {checkReadinessJob.message &&
                  checkReadinessJob.message.trim().length > 0 && (
                    <span className="text-sm text-muted leading-relaxed break-words">
                      {checkReadinessJob.message}
                    </span>
                  )}
              </div>
            )}
        </div>
      </div>

      {readinessError && !readinessLoading && (
        <ErrorDisplay error={readinessError} context="readiness data" />
      )}

      {!tenantData && !readinessError && !tenantLoading && (
        <ErrorDisplay
          error="The tenant you are looking for does not exist or has been removed."
          context="tenant"
        />
      )}

      {readinessLoading && (
        <div className="loading-container">
          <LoadingSpinner />
        </div>
      )}

      {!hasError && readiness && (
        <div className="max-w-[1240px] flex flex-col gap-3">
          <div>
            <h2 className="section-title">Readiness Check Results</h2>
            <p className="section-description">
              Current readiness status for the tenant based on the latest
              checks.
            </p>
          </div>
          <div className="bg-white border-2 border-line rounded-xl p-6 shadow-md">
            <div className="flex flex-col items-start gap-3 md:flex-row md:justify-between md:items-center md:gap-0 mb-3 pb-3 border-b-2 border-gray-100">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-foreground m-0">
                  Overall Tenant Status
                </h2>
              </div>
              <Badge
                size="lg"
                className={
                  readiness.ready
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-600'
                }
              >
                {readiness.ready ? 'Ready' : 'Not Ready'}
              </Badge>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-muted min-w-[120px]">
                  Tenant Name:
                </span>
                <span className="text-sm text-foreground font-medium">
                  {readiness.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-muted min-w-[120px]">
                  Last Check:
                </span>
                <span className="text-sm text-foreground font-medium">
                  {formatDateTime(readiness.last_check)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderCheckDetail('Data Availability', readiness.data)}
            {renderCheckDetail('Topology Configuration', readiness.topology)}
            {renderCheckDetail('Reports', readiness.reports)}
          </div>
        </div>
      )}

      {!hasError && !readiness && !readinessLoading && (
        <ErrorDisplay
          error="No readiness information is currently available for this tenant."
          context="readiness information"
        />
      )}
    </div>
  )
}

export default TenantReadinessTab
