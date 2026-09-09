import { useEffect, useState } from 'react'
import { ArrowUpRightFromSquare, Settings } from 'lucide-react'
import {
  useGetTenantReports,
  useSetTenantNodeMutation,
  useSetNodeReportMutation,
} from '@/hooks/useTenants'
import { toast } from 'sonner'
import SelectDropdown from '@/components/SelectDropdown'
import LoadingSpinner from '@/components/LoadingSpinner'

interface NodeConfigPanelProps {
  tenantId: string
  isNodeEnabled: boolean
  tenantName: string
  hasPublicNodeReport: boolean
}

const NodeConfigPanel = ({
  tenantId,
  isNodeEnabled,
  tenantName,
  hasPublicNodeReport,
}: NodeConfigPanelProps) => {
  const { data: reports, isLoading: reportsLoading } = useGetTenantReports(
    tenantId,
    undefined,
  )

  const setNodeMutation = useSetTenantNodeMutation()
  const setNodeReportMutation = useSetNodeReportMutation()

  const currentSavedReportId = reports?.find((r) => r.node_report)?.id ?? ''

  const [lastReportId, setLastReportId] = useState('')
  useEffect(() => {
    if (currentSavedReportId) {
      setLastReportId(currentSavedReportId)
    }
  }, [currentSavedReportId])

  const reportOptions =
    reports?.map((report) => ({ value: report.id, label: report.name })) ?? []
  const hasReports = reports && reports.length > 0
  const isPending = setNodeMutation.isPending || setNodeReportMutation.isPending

  const handleReportChange = async (reportId: string) => {
    if (!reportId) return
    const toastId = toast.loading('Saving node report...')
    try {
      await setNodeReportMutation.mutateAsync({
        tenantId,
        reportId,
      })
      toast.success('Node report assigned successfully', { id: toastId })
    } catch (error) {
      toast.error(
        `Failed to save report: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { id: toastId },
      )
    }
  }

  const handleToggleNode = async () => {
    const newValue = !isNodeEnabled
    const toastId = toast.loading(
      `${newValue ? 'Enabling' : 'Disabling'} node status...`,
    )
    try {
      // reassign the default selected report when node is re-enabled
      if (newValue) {
        const reportIdToAssign =
          currentSavedReportId || lastReportId || reportOptions[0]?.value
        if (reportIdToAssign) {
          await setNodeReportMutation.mutateAsync({
            tenantId,
            reportId: reportIdToAssign,
          })
        }
      }

      await setNodeMutation.mutateAsync({ id: tenantId, node: newValue })

      toast.success(`Node successfully ${newValue ? 'enabled' : 'disabled'}`, {
        id: toastId,
      })
    } catch (error) {
      toast.error(
        `Failed to update node status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { id: toastId },
      )
    }
  }

  return (
    <div className="max-w-xl bg-white border border-line rounded-lg py-3 px-4">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50">
          <Settings className="size-4 text-blue-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Node Configuration
          </h3>
          <p className="text-sm text-muted">
            Manage the default report and node status
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1">
          <span className="text-sm font-semibold text-body block">
            Node Status
          </span>
          <span className="text-xs text-muted">
            {isNodeEnabled
              ? 'Enable or disable this node'
              : 'This node is currently disabled'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-sm font-medium ${
              isNodeEnabled ? 'text-body' : 'text-red-600'
            }`}
          >
            {isNodeEnabled ? 'Enabled' : 'Disabled'}
          </span>
          <input
            type="checkbox"
            className={`toggle toggle-sm ${
              isNodeEnabled ? 'toggle-brand' : 'toggle-error'
            }`}
            checked={isNodeEnabled}
            onChange={handleToggleNode}
            disabled={isPending}
            aria-label="Enable or disable node status"
          />
        </div>
      </div>

      {isNodeEnabled && (
        <>
          <hr className="border-line my-4" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1">
              <span className="text-sm font-semibold text-body block">
                Node Report
              </span>
              <span className="text-xs text-muted">
                Assign the default report for this node
              </span>
            </div>
            <div className="w-full sm:w-52 flex items-center h-10">
              {reportsLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <SelectDropdown
                  value={currentSavedReportId}
                  onChange={handleReportChange}
                  options={reportOptions}
                  placeholder={
                    hasReports ? 'Select a report...' : 'No reports available'
                  }
                  disabled={isPending || !hasReports}
                />
              )}
            </div>
          </div>
        </>
      )}

      {hasPublicNodeReport && isNodeEnabled && (
        <>
          <hr className="border-line my-4" />
          <div className="flex justify-end">
            <a
              href={`/public/tenants/${encodeURIComponent(tenantName)}/capability`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-brand no-underline transition-colors hover:text-brand-strong hover:underline"
            >
              View public capability page
              <ArrowUpRightFromSquare className="size-3 shrink-0" />
            </a>
          </div>
        </>
      )}
    </div>
  )
}

export default NodeConfigPanel
