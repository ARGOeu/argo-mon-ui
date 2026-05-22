import {
  ArrowDownCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon,
  XCircleIcon,
} from '@heroicons/react/16/solid'

interface StatusLegendProps {
  iconMode: string
}

const StatusLegend = ({ iconMode }: StatusLegendProps) => (
  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
    <div className="flex items-center gap-2">
      {iconMode === 'icon' ? (
        <CheckCircleIcon className="size-4 text-success" />
      ) : (
        <div className="status status-lg status-success"></div>
      )}
      <span className="text-muted font-medium">Operational</span>
    </div>
    <div className="flex items-center gap-2">
      {iconMode === 'icon' ? (
        <XCircleIcon className="size-4 text-error" />
      ) : (
        <div className="status status-lg status-error"></div>
      )}
      <span className="text-muted font-medium">Critical</span>
    </div>
    <div className="flex items-center gap-2">
      {iconMode === 'icon' ? (
        <ExclamationTriangleIcon className="size-4 text-warning" />
      ) : (
        <div className="status status-lg status-warning"></div>
      )}
      <span className="text-muted font-medium">Warning</span>
    </div>
    <div className="flex items-center gap-2">
      {iconMode === 'icon' ? (
        <ExclamationCircleIcon className="size-4 text-info" />
      ) : (
        <div className="status status-lg status-info"></div>
      )}
      <span className="text-muted font-medium">Missing</span>
    </div>
    <div className="flex items-center gap-2">
      {iconMode === 'icon' ? (
        <ArrowDownCircleIcon className="size-4 text-black" />
      ) : (
        <div className="status status-lg status-neutral"></div>
      )}
      <span className="text-muted font-medium">Downtime</span>
    </div>
    <div className="flex items-center gap-2">
      {iconMode === 'icon' ? (
        <QuestionMarkCircleIcon className="size-4 text-subtle" />
      ) : (
        <div className="status status-lg status-unknown"></div>
      )}
      <span className="text-muted font-medium">Unknown</span>
    </div>
  </div>
)

export default StatusLegend
