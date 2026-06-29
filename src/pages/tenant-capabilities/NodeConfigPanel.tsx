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
}

const NodeConfigPanel = ({ tenantId, isNodeEnabled }: NodeConfigPanelProps) => {
  const { data: reports, isLoading: reportsLoading } = useGetTenantReports(
    tenantId,
    undefined,
  )

  const setNodeMutation = useSetTenantNodeMutation()
  const setNodeReportMutation = useSetNodeReportMutation()

  const currentSavedReportId = reports?.find((r) => r.node_report)?.id ?? ''

  const reportOptions =
    reports?.map((report) => ({ value: report.id, label: report.name })) ?? []
  const hasReports = reports && reports.length > 0
  const isPending = setNodeMutation.isPending || setNodeReportMutation.isPending

  const hasSavedReport = !!currentSavedReportId

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
    <div className="mb-6 max-w-3xl bg-white border border-line rounded-lg py-3 px-4">
      <h3 className="text-base font-semibold text-foreground mb-3">
        Node Configuration
      </h3>

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

      <hr className="border-line my-4" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1">
          <span
            className={`text-sm font-semibold block ${
              hasSavedReport ? 'text-body' : 'text-muted'
            }`}
          >
            Node Status
          </span>
          <span className="text-xs text-muted">
            {!hasSavedReport
              ? 'A report must be selected first'
              : 'Enable or disable this node'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-sm font-medium ${
              !hasSavedReport ? 'text-muted' : 'text-body'
            }`}
          >
            {isNodeEnabled ? 'Enabled' : 'Disabled'}
          </span>
          <input
            type="checkbox"
            className="toggle toggle-sm toggle-brand"
            checked={isNodeEnabled}
            onChange={handleToggleNode}
            disabled={isPending || !hasSavedReport}
            aria-label="Enable or disable node status"
          />
        </div>
      </div>
    </div>
  )
}

export default NodeConfigPanel
