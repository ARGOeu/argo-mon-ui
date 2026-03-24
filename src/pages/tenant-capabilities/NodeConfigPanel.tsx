import { useState, useEffect } from 'react'
import {
  useGetTenantReports,
  useSetTenantNodeMutation,
  useSetNodeReportMutation,
} from '@/hooks/useTenants'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/16/solid'
import { toast } from 'sonner'
import SelectDropdown from '@/components/SelectDropdown'
import Button from '@/components/Button'
import LoadingSpinner from '@/components/LoadingSpinner'

interface NodeConfigPanelProps {
  tenantId: string
  currentNode: boolean
}

const NodeConfigPanel = ({ tenantId, currentNode }: NodeConfigPanelProps) => {
  const [isOpen, setIsOpen] = useState(true)
  const [nodeEnabled, setNodeEnabled] = useState(currentNode)
  const [selectedReportId, setSelectedReportId] = useState('')
  const [reportError, setReportError] = useState('')

  const { data: reports, isLoading: reportsLoading } = useGetTenantReports(
    tenantId,
    undefined,
    isOpen,
  )

  useEffect(() => {
    setNodeEnabled(currentNode)
  }, [currentNode])

  useEffect(() => {
    if (reports) {
      setSelectedReportId(reports.find((r) => r.node_report)?.id ?? '')
    }
  }, [reports])

  const setNodeMutation = useSetTenantNodeMutation()
  const setNodeReportMutation = useSetNodeReportMutation()

  const reportOptions =
    reports?.map((r) => ({ value: r.id, label: r.name })) ?? []
  const hasReports = reports && reports?.length > 0
  const isPending = setNodeMutation.isPending || setNodeReportMutation.isPending

  const handleCancel = () => {
    setNodeEnabled(currentNode)
    setSelectedReportId(reports?.find((r) => r.node_report)?.id ?? '')
    setReportError('')
    setIsOpen(false)
  }

  const handleSave = async () => {
    if (nodeEnabled && !selectedReportId) {
      setReportError('A report is required when node is enabled')
      return
    }
    setReportError('')

    const toastId = toast.loading('Saving node configuration...')

    try {
      await setNodeMutation.mutateAsync({ id: tenantId, node: nodeEnabled })

      if (selectedReportId) {
        await setNodeReportMutation.mutateAsync({
          tenantId,
          reportId: selectedReportId,
        })
      }

      toast.dismiss(toastId)
      toast.success('Node configuration saved')
      setIsOpen(false)
    } catch (error) {
      toast.dismiss(toastId)
      toast.error(
        `Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  return (
    <div className={isOpen ? 'mb-8' : 'mb-5'}>
      <p className="text-sm text-muted mb-1">
        Enable this tenant as a node and assign a default node report
      </p>
      <div className="max-w-lg bg-white border border-line rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center justify-between w-full px-3 py-2 text-sm bg-surface-muted font-semibold text-muted hover:text-body hover:bg-surface-muted transition-colors cursor-pointer"
        >
          Configure Node
          {isOpen ? (
            <ChevronUpIcon className="size-5" />
          ) : (
            <ChevronDownIcon className="size-5" />
          )}
        </button>

        {isOpen && (
          <div className="px-4 py-3 animate-fade-in">
            {reportsLoading ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : !hasReports ? (
              <p className="text-sm text-amber-600 font-medium mb-3">
                There are no available reports to select.
              </p>
            ) : null}

            {!reportsLoading && (
              <>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="toggle toggle-brand"
                      checked={nodeEnabled}
                      onChange={() => setNodeEnabled((prev) => !prev)}
                      disabled={isPending}
                    />
                    <span className="text-sm font-semibold text-body">
                      {nodeEnabled ? 'Node enabled' : 'Node disabled'}
                    </span>
                  </label>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-muted px-1">
                      Node report <span className="required">*</span>
                    </label>
                    <SelectDropdown
                      value={selectedReportId}
                      onChange={(value) => {
                        setSelectedReportId(value)
                        if (value) setReportError('')
                      }}
                      options={reportOptions}
                      placeholder="Select a report"
                      disabled={!hasReports || isPending}
                    />
                    {reportError && (
                      <span className="text-xs text-red-500 mt-1 px-1">
                        {reportError}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 justify-end mt-4">
                  <Button
                    onClick={handleCancel}
                    size="sm"
                    variant="outline-secondary"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave} size="sm" disabled={isPending}>
                    Save
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default NodeConfigPanel
