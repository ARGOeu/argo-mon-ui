import { useState, useEffect } from 'react'
import {
  useGetTenantReports,
  useGetTenantReportById,
  useSetReportPublicMutation,
  useSetReportPrivateMutation,
} from '@/hooks/useTenants'
import { useSelectedTenant } from '@/contexts/selected-tenant'
import { useAuth } from '@/auth/useAuth'
import {
  CheckCircleIcon,
  GlobeAltIcon,
  LockClosedIcon,
  XCircleIcon,
} from '@heroicons/react/16/solid'
import { toast } from 'sonner'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import ErrorDisplay from '@/components/ErrorDisplay'
import LoadingSpinner from '@/components/LoadingSpinner'
import MetricProfileItem from '@/pages/tenant-reports/MetricProfileItem'
import type { ReportListItem } from '@/types/tenants'

const cardClass =
  'bg-white border border-line rounded-lg px-4 py-3 flex flex-col gap-2'
const simpleItemClass =
  'flex items-center justify-between px-3 py-2 bg-surface-muted border border-line rounded-md gap-2'
const simpleItemTitleClass =
  'text-sm font-semibold text-body leading-[1.4] flex-1 break-words'

interface TenantReportsTabProps {
  tenantId: string
}

const TenantReportsTab = ({ tenantId }: TenantReportsTabProps) => {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [expandedServices, setExpandedServices] = useState<
    Record<string, Set<string>>
  >({})
  const [pendingReportId, setPendingReportId] = useState<string | null>(null)

  const { isSuperAdmin } = useAuth()
  const { roleInSelectedTenant } = useSelectedTenant()

  const canManageVisibility =
    isSuperAdmin || roleInSelectedTenant === 'tenant_admin'

  const {
    data: reports,
    isLoading: reportsLoading,
    error: reportsError,
  } = useGetTenantReports(tenantId)

  const {
    data: reportDetail,
    isLoading: reportDetailLoading,
    error: reportDetailError,
  } = useGetTenantReportById(
    tenantId,
    selectedReportId || '',
    !!selectedReportId,
  )

  const setPublicMutation = useSetReportPublicMutation()
  const setPrivateMutation = useSetReportPrivateMutation()

  useEffect(() => {
    if (reports && reports.length > 0 && !selectedReportId) {
      setSelectedReportId(reports[0].id)
    }
  }, [reports, selectedReportId])

  const toggleService = (profileId: string, serviceName: string) => {
    setExpandedServices((prev) => {
      const profileServices = prev[profileId] || new Set()
      const newServices = new Set(profileServices)
      if (newServices.has(serviceName)) {
        newServices.delete(serviceName)
      } else {
        newServices.add(serviceName)
      }
      return { ...prev, [profileId]: newServices }
    })
  }

  const toggleAllServices = (
    profileId: string,
    allServices: string[],
    expand: boolean,
  ) => {
    setExpandedServices((prev) => ({
      ...prev,
      [profileId]: expand ? new Set(allServices) : new Set(),
    }))
  }

  const handleVisibilityClick = (report: ReportListItem) => {
    const mutation =
      report.public === true ? setPrivateMutation : setPublicMutation
    setPendingReportId(report.id)
    mutation.mutate(
      { tenantId, reportId: report.id },
      {
        onSuccess: (message) => {
          setPendingReportId(null)
          toast.success(message)
        },
        onError: (error) => {
          setPendingReportId(null)
          toast.error(error.message || 'Failed to update report visibility')
        },
      },
    )
  }

  const selectedReport = reports?.find((r) => r.id === selectedReportId)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 lg:gap-10 lg:min-h-[500px]">
      <div className="bg-surface-muted rounded-lg p-4 h-fit max-h-[400px] lg:max-h-[calc(100vh-300px)] overflow-y-auto">
        <h3 className="text-base font-semibold text-foreground mb-2">
          Available Reports
        </h3>
        {reportsError ? (
          <ErrorDisplay error={reportsError} context="reports" />
        ) : reportsLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="sm" />
          </div>
        ) : (reports?.length ?? 0) > 0 ? (
          <ul className="flex flex-col gap-2">
            {reports!.map((report) => (
              <li
                key={report.id}
                className={`p-3 bg-white border rounded-md cursor-pointer transition-all ${
                  selectedReportId === report.id
                    ? 'border-blue-500 bg-brand-subtle hover:opacity-85'
                    : 'border-line hover:border-line-strong hover:bg-surface-muted'
                }`}
                onClick={() => setSelectedReportId(report.id)}
              >
                <div className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="tooltip tooltip-right shrink-0"
                      data-tip={
                        report.disabled ? 'Report disabled' : 'Report enabled'
                      }
                    >
                      {report.disabled ? (
                        <XCircleIcon className="size-4 text-red-400" />
                      ) : (
                        <CheckCircleIcon className="size-4 text-emerald-500" />
                      )}
                    </span>
                    <span className="text-sm font-semibold text-foreground break-words">
                      {report.name}
                    </span>
                  </div>
                  <Badge
                    className={
                      report.public === true
                        ? 'bg-brand-muted text-brand border border-blue-300'
                        : 'bg-surface-strong text-subtle border border-line-strong'
                    }
                  >
                    {report.public === true ? 'Public' : 'Private'}
                  </Badge>
                </div>
                {report.description && (
                  <p className="text-xs text-muted leading-[1.4]">
                    {report.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-subtle italic text-center">
            No reports available
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {reportDetailError ? (
          <ErrorDisplay error={reportDetailError} context="report details" />
        ) : reportDetailLoading ? (
          <div className="loading-container">
            <LoadingSpinner />
          </div>
        ) : reportDetail ? (
          <>
            {/* Info Header */}
            <div className="mb-1 pb-1">
              <div className="flex justify-between items-start gap-4 mb-2.5">
                <div className="min-w-0">
                  <h1 className="text-xl font-bold text-foreground leading-[1.3]">
                    {reportDetail.info.name}
                  </h1>
                  <p className="text-base text-muted leading-normal">
                    {reportDetail.info.description || (
                      <span className="text-sm text-subtle italic">
                        No description available
                      </span>
                    )}
                  </p>
                </div>
                {canManageVisibility &&
                  selectedReport &&
                  !reportDetail.disabled && (
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      <span className="text-sm font-medium text-muted">
                        Set report visibility:
                      </span>
                      <Button
                        variant={
                          selectedReport.public === true
                            ? 'outline-secondary'
                            : 'outline-primary'
                        }
                        size="sm"
                        onClick={() => handleVisibilityClick(selectedReport)}
                        disabled={pendingReportId === selectedReport.id}
                      >
                        {selectedReport.public === true ? (
                          <LockClosedIcon className="size-4" />
                        ) : (
                          <GlobeAltIcon className="size-4" />
                        )}
                        {selectedReport.public === true
                          ? 'Make private'
                          : 'Make public'}
                      </Button>
                    </div>
                  )}
              </div>
              <div className="flex flex-wrap gap-y-2 gap-x-4 items-center">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-muted">
                    Status:
                  </span>
                  {reportDetail.disabled ? (
                    <Badge className="bg-red-100 text-red-800 border border-red-300">
                      Inactive
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Active
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-muted">
                    Report ID:
                  </span>
                  <span className="text-sm text-foreground">
                    {reportDetail.id}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-muted">
                    Created:
                  </span>
                  <span className="text-sm text-foreground">
                    {new Date(reportDetail.info.created).toLocaleString(
                      'en-GB',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      },
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-muted">
                    Last Updated:
                  </span>
                  <span className="text-sm text-foreground">
                    {new Date(reportDetail.info.updated).toLocaleString(
                      'en-GB',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      },
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Metric Profile */}
            {reportDetail.profiles &&
              reportDetail.profiles.filter((p) => p.type === 'metric').length >
                0 && (
                <div className="mb-2">
                  <div className="mb-1">
                    <h2 className="text-lg font-semibold text-foreground">
                      Metric Profile
                    </h2>
                  </div>
                  <div className="flex flex-col gap-4">
                    {reportDetail.profiles
                      .filter((p) => p.type === 'metric')
                      .map((profile) => (
                        <MetricProfileItem
                          key={profile.id}
                          tenantId={tenantId}
                          profile={profile}
                          expandedServices={
                            expandedServices[profile.id] || new Set()
                          }
                          onToggleService={(serviceName) =>
                            toggleService(profile.id, serviceName)
                          }
                          onToggleAll={(allServices, expand) =>
                            toggleAllServices(profile.id, allServices, expand)
                          }
                        />
                      ))}
                  </div>
                </div>
              )}

            {/* Profiles - Aggregation & Operations */}
            {reportDetail.profiles &&
              (reportDetail.profiles.filter((p) => p.type === 'aggregation')
                .length > 0 ||
                reportDetail.profiles.filter((p) => p.type === 'operations')
                  .length > 0) && (
                <div className="mb-2">
                  <div className="mb-1">
                    <h2 className="text-lg font-semibold text-foreground">
                      Profiles
                    </h2>
                  </div>
                  <div className={cardClass}>
                    <div className="flex flex-wrap gap-6">
                      {/* Aggregation Profiles */}
                      {reportDetail.profiles.filter(
                        (p) => p.type === 'aggregation',
                      ).length > 0 && (
                        <div>
                          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
                            {reportDetail.profiles
                              .filter((p) => p.type === 'aggregation')
                              .map((profile) => (
                                <div
                                  key={profile.id}
                                  className={simpleItemClass}
                                >
                                  <span className={simpleItemTitleClass}>
                                    {profile.name}
                                  </span>
                                  <Badge
                                    size="lg"
                                    className="bg-brand-muted text-blue-800 border border-blue-300"
                                  >
                                    Aggregation
                                  </Badge>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Operations Profiles */}
                      {reportDetail.profiles.filter(
                        (p) => p.type === 'operations',
                      ).length > 0 && (
                        <div>
                          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
                            {reportDetail.profiles
                              .filter((p) => p.type === 'operations')
                              .map((profile) => (
                                <div
                                  key={profile.id}
                                  className={simpleItemClass}
                                >
                                  <span className={simpleItemTitleClass}>
                                    {profile.name}
                                  </span>
                                  <Badge
                                    size="lg"
                                    className="bg-brand-muted text-blue-800 border border-blue-300"
                                  >
                                    Operations
                                  </Badge>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            {/* Topology Schema */}
            <div className="mb-2">
              <div className="mb-1">
                <h2 className="text-lg font-semibold text-foreground">
                  Topology Schema
                </h2>
              </div>
              <div className={cardClass}>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <div className="text-base text-blue-500 leading-none shrink-0">
                      ●
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-semibold text-muted">
                        Group
                      </span>
                      <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-md bg-brand-muted text-blue-800 border border-blue-300">
                        {reportDetail.topology_schema.group.type}
                      </span>
                    </div>
                  </div>
                  {reportDetail.topology_schema.group.group && (
                    <div className="flex items-center ml-2">
                      <div className="w-6 h-8 border-l-2 border-b-2 border-line-strong rounded-bl-lg -mr-3 shrink-0"></div>
                      <div className="flex items-center gap-3">
                        <div className="text-base text-blue-500 leading-none shrink-0">
                          ●
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-sm font-semibold text-muted">
                            Subgroup
                          </span>
                          <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-md bg-brand-muted text-blue-800 border border-blue-300">
                            {reportDetail.topology_schema.group.group.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Computations */}
            <div className="mb-2">
              <div className="mb-1">
                <h2 className="text-lg font-semibold text-foreground">
                  Computations
                </h2>
              </div>
              <div className={cardClass}>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
                  {/* AR Computation */}
                  <div className={simpleItemClass}>
                    <span className={simpleItemTitleClass}>
                      Availability & Reliability
                    </span>
                    {reportDetail.computations.ar ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Enabled
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 border border-red-300">
                        Disabled
                      </Badge>
                    )}
                  </div>

                  {/* Status Computation */}
                  <div className={simpleItemClass}>
                    <span className={simpleItemTitleClass}>Status</span>
                    {reportDetail.computations.status ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Enabled
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 border border-red-300">
                        Disabled
                      </Badge>
                    )}
                  </div>

                  {/* Trends */}
                  {reportDetail.computations.trends &&
                    reportDetail.computations.trends.map((trend) => (
                      <div key={trend} className={simpleItemClass}>
                        <span className={simpleItemTitleClass}>
                          {trend.charAt(0).toUpperCase() + trend.slice(1)}
                        </span>
                        <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Enabled
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Thresholds */}
            <div className="mb-2">
              <div className="mb-1">
                <h2 className="text-lg font-semibold text-foreground">
                  Thresholds
                </h2>
              </div>
              <div className={cardClass}>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
                  <div className={simpleItemClass}>
                    <span className={simpleItemTitleClass}>Availability</span>
                    <Badge
                      size="lg"
                      className="bg-green-100 text-green-700 border border-green-300"
                    >
                      {reportDetail.thresholds.availability}%
                    </Badge>
                  </div>
                  <div className={simpleItemClass}>
                    <span className={simpleItemTitleClass}>Reliability</span>
                    <Badge
                      size="lg"
                      className="bg-green-100 text-green-700 border border-green-300"
                    >
                      {reportDetail.thresholds.reliability}%
                    </Badge>
                  </div>
                  <div className={simpleItemClass}>
                    <span className={simpleItemTitleClass}>Uptime</span>
                    <Badge
                      size="lg"
                      className="bg-green-100 text-green-700 border border-green-300"
                    >
                      {reportDetail.thresholds.uptime}
                    </Badge>
                  </div>
                  <div className={simpleItemClass}>
                    <span className={simpleItemTitleClass}>Unknown</span>
                    <Badge
                      size="lg"
                      className="bg-green-100 text-green-700 border border-green-300"
                    >
                      {reportDetail.thresholds.unknown}
                    </Badge>
                  </div>
                  <div className={simpleItemClass}>
                    <span className={simpleItemTitleClass}>Downtime</span>
                    <Badge
                      size="lg"
                      className="bg-green-100 text-green-700 border border-green-300"
                    >
                      {reportDetail.thresholds.downtime}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className={cardClass}>
            <p className="text-sm text-subtle italic text-center">
              {selectedReportId
                ? 'No details available'
                : 'Select a report from the list'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TenantReportsTab
