import { useState, Fragment } from 'react'
import {
  useGetUserTenantStatus,
  useUpdateTenantStatusMutation,
  useNotifyAmsMutation,
} from '@/hooks/useTenants'
import { useAuth } from '@/auth/useAuth'
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/16/solid'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import SelectDropdown from '@/components/SelectDropdown'
import { formatDateTime } from '@/utils/formatDateTime'
import type { Job, JobStatus } from '@/types/tenants'

const JOB_NAMES: Record<string, string> = {
  INIT_AMS: 'ARGO Messaging Service (AMS) Status',
  INIT_MONGO: 'MongoDB Status',
  CREATE_DOMAIN_NAMES: 'Domain Names Creation Status',
}

const JOB_STATUS_BADGE_CLASS: Record<string, string> = {
  UNKNOWN: 'bg-surface-strong text-muted',
  INITIALISING: 'bg-indigo-100 text-indigo-700',
  INITIALISED: 'bg-brand-muted text-blue-600',
  FAILED_INITIALISATION: 'bg-red-100 text-red-800',
  IN_PROGRESS: 'bg-brand-muted text-brand',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  FAILED: 'bg-red-100 text-red-800',
}

const getStatusIcon = (status: JobStatus) => {
  if (status === 'COMPLETED')
    return <CheckCircleIcon className="size-6 text-emerald-600" />
  if (status === 'FAILED' || status === 'FAILED_INITIALISATION')
    return <XCircleIcon className="size-6 text-red-600" />
  if (status === 'INITIALISING')
    return <ClockIcon className="size-6 text-violet-600" />
  if (status === 'INITIALISED')
    return <ClockIcon className="size-6 text-blue-500" />
  if (status === 'IN_PROGRESS')
    return <ClockIcon className="size-6 text-blue-600" />

  return <QuestionMarkCircleIcon className="size-6 text-subtle" />
}

const STATUS_OPTIONS: { value: JobStatus; label: string }[] = [
  { value: 'UNKNOWN', label: 'Unknown' },
  { value: 'INITIALISING', label: 'Initialising' },
  { value: 'INITIALISED', label: 'Initialised' },
  { value: 'FAILED_INITIALISATION', label: 'Failed Initialisation' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'FAILED', label: 'Failed' },
]

interface TenantStatusTabProps {
  tenantId: string
}

const TenantStatusTab = ({ tenantId }: TenantStatusTabProps) => {
  const { profile } = useAuth()

  const isSuperAdmin = profile?.roles?.includes('super_admin')
  const [expandedJobs, setExpandedJobs] = useState<Record<string, boolean>>({})
  const [editingJob, setEditingJob] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<JobStatus | null>(null)
  const [jobMessage, setJobMessage] = useState<string>('')

  const {
    data: statusData,
    isLoading: statusLoading,
    error: statusError,
  } = useGetUserTenantStatus(tenantId, 10000) // Refetch every 10 seconds to keep status updated

  const updateStatusMutation = useUpdateTenantStatusMutation()
  const notifyAmsMutation = useNotifyAmsMutation()

  const jobs = statusData && statusData.status.jobs

  const toggleJob = (jobName: string) => {
    setExpandedJobs((prev) => ({
      ...prev,
      [jobName]: !prev[jobName],
    }))
  }

  const handleRerunJob = (e: React.MouseEvent, job: Job) => {
    e.stopPropagation()
    if (!tenantId || !statusData?.name) return

    toast.loading(`Notifying AMS to rerun ${job.name.toLowerCase()}...`)

    notifyAmsMutation.mutate(
      {
        tenantId,
        tenantName: statusData.name,
        jobName: job.name,
      },
      {
        onSuccess: () => {
          toast.dismiss()
          toast.success('Job execution triggered successfully')
        },
        onError: (error) => {
          toast.dismiss()
          toast.error(`Failed to rerun job: ${error.message}`)
        },
      },
    )
  }

  const handleEditClick = (job: Job) => {
    setEditingJob(job.name)
    setSelectedStatus(job.status)
    setJobMessage(job.message || '')
  }

  const handleCancelEdit = () => {
    setEditingJob(null)
    setSelectedStatus(null)
    setJobMessage('')
  }

  const handleSaveStatus = (job: Job) => {
    if (!tenantId || !selectedStatus) return

    if (!jobMessage.trim()) {
      toast.error('Message is required')
      return
    }

    const updatedJob = {
      ...job,
      status: selectedStatus,
      message: jobMessage.trim(),
      start: job.start || new Date().toISOString().split('.')[0] + 'Z',
      end: ['COMPLETED', 'FAILED', 'FAILED_INITIALISATION'].includes(
        selectedStatus,
      )
        ? new Date().toISOString().split('.')[0] + 'Z'
        : job.end,
    }

    toast.loading('Updating job status...')

    updateStatusMutation.mutate(
      {
        id: tenantId,
        data: { jobs: [updatedJob] },
      },
      {
        onSuccess: () => {
          toast.dismiss()
          toast.success('Job status updated successfully')
          setEditingJob(null)
          setSelectedStatus(null)
          setJobMessage('')
        },
        onError: (error) => {
          toast.dismiss()
          toast.error(`Failed to update status: ${error.message}`)
        },
      },
    )
  }

  const getStepStatus = (
    job: Job,
    step: string,
  ): 'active' | 'completed' | 'pending' | 'failed' => {
    const statusOrder = [
      'UNKNOWN',
      'INITIALISING',
      'INITIALISED',
      'FAILED_INITIALISATION',
      'IN_PROGRESS',
      'COMPLETED',
      'FAILED',
    ]
    const currentIndex = statusOrder.indexOf(job.status)
    const stepIndex = statusOrder.indexOf(step)

    if (job.status === 'FAILED') {
      if (step === 'FAILED') return 'failed'
      if (stepIndex < currentIndex) return 'completed'
      return 'pending'
    }

    if (job.status === 'FAILED_INITIALISATION') {
      if (step === 'FAILED_INITIALISATION') return 'failed'
      if (step === 'UNKNOWN' || step === 'INITIALISING') return 'completed'
      return 'pending'
    }

    if (job.status === 'COMPLETED' && step === 'COMPLETED') return 'completed'
    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'active'
    return 'pending'
  }

  const getProgressSteps = (job: Job) => {
    return [
      { key: 'UNKNOWN', label: 'Unknown' },
      { key: 'INITIALISING', label: 'Initialising' },
      {
        key:
          job.status === 'FAILED_INITIALISATION'
            ? 'FAILED_INITIALISATION'
            : 'INITIALISED',
        label:
          job.status === 'FAILED_INITIALISATION'
            ? 'Failed Initialisation'
            : 'Initialised',
      },
      { key: 'IN_PROGRESS', label: 'In Progress' },
      {
        key: job.status === 'FAILED' ? 'FAILED' : 'COMPLETED',
        label: job.status === 'FAILED' ? 'Failed' : 'Completed',
      },
    ]
  }

  if (statusLoading)
    return (
      <div className="loading-container">
        <LoadingSpinner />
      </div>
    )

  if (statusError)
    return <ErrorDisplay error={statusError} context="tenant status" />

  return (
    <div className="flex flex-col gap-6 max-w-[1040px] mx-auto py-1">
      {jobs && jobs.length > 0 ? (
        jobs
          .filter((job) => job.name !== 'CHECK_READINESS')
          .map((job) => (
            <div
              key={job.name}
              className="bg-white border border-line rounded-lg px-3 py-2 shadow-sm"
            >
              <div
                className="flex justify-between items-center p-1.5 rounded-xl transition-all hover:bg-surface-muted cursor-pointer"
                onClick={() => toggleJob(job.name)}
              >
                <div className="flex items-center gap-2 capitalize">
                  {getStatusIcon(job.status)}
                  <h2 className="text-lg font-semibold text-foreground">
                    {JOB_NAMES[job.name] ||
                      job.name?.toLowerCase().replaceAll('_', ' ')}
                  </h2>
                  {job.mode === 'MANUAL' && (
                    <Badge
                      size="xs"
                      className="bg-amber-100 text-amber-800 ml-2"
                    >
                      Manual
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    size="lg"
                    className={`capitalize ${JOB_STATUS_BADGE_CLASS[job.status] ?? 'bg-surface-strong text-muted'}`}
                  >
                    {job.status?.toLowerCase()}
                  </Badge>
                  {expandedJobs[job.name] ? (
                    <ChevronUpIcon className="size-5 text-muted transition-transform" />
                  ) : (
                    <ChevronDownIcon className="size-5 text-muted transition-transform" />
                  )}
                </div>
              </div>

              {expandedJobs[job.name] && (
                <>
                  <div className="mt-3 mb-4 px-4 bg-surface-muted rounded-lg border border-line">
                    <div className="flex items-center overflow-x-auto py-4 md:justify-between">
                      {getProgressSteps(job).map((step, index, array) => {
                        const stepStatus = getStepStatus(job, step.key)
                        return (
                          <Fragment key={step.key}>
                            <div className="flex flex-col items-center gap-2 shrink-0 min-w-[80px]">
                              <div
                                className={`w-7 h-7 rounded-full border-2 transition-all relative flex items-center justify-center ${
                                  stepStatus === 'active'
                                    ? 'border-blue-500 bg-blue-500 animate-pulse-ring'
                                    : stepStatus === 'completed'
                                      ? 'border-emerald-500 bg-emerald-500'
                                      : stepStatus === 'failed'
                                        ? 'border-red-500 bg-red-500'
                                        : 'border-line-strong bg-white'
                                }`}
                              >
                                {stepStatus === 'active' && (
                                  <span className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full animate-pulse-dot" />
                                )}
                                {stepStatus === 'completed' && (
                                  <span className="text-white text-sm font-bold leading-none">
                                    ✓
                                  </span>
                                )}
                                {stepStatus === 'failed' && (
                                  <span className="text-white text-sm font-bold leading-none">
                                    ✕
                                  </span>
                                )}
                              </div>
                              <span
                                className={`text-sm text-center whitespace-nowrap ${
                                  stepStatus === 'active'
                                    ? 'text-blue-500 font-semibold'
                                    : stepStatus === 'completed'
                                      ? 'text-emerald-500 font-semibold'
                                      : stepStatus === 'failed'
                                        ? 'text-red-500 font-semibold'
                                        : 'text-muted font-medium'
                                }`}
                              >
                                {step.label}
                              </span>
                            </div>
                            {index < array.length - 1 && (
                              <div
                                className={`flex-1 h-0.5 mx-2.5 relative -top-2 ${
                                  stepStatus === 'completed' ||
                                  stepStatus === 'active'
                                    ? 'bg-gray-300'
                                    : 'bg-gray-200'
                                }`}
                              />
                            )}
                          </Fragment>
                        )
                      })}
                    </div>
                  </div>

                  {job.mode === 'MANUAL' && editingJob === job.name && (
                    <div className="w-full flex flex-col gap-3 mb-3">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1 flex-1">
                          <label
                            htmlFor={`status-${job.name}`}
                            className="text-sm font-semibold text-muted px-1"
                          >
                            Change Status:
                          </label>
                          <SelectDropdown
                            value={selectedStatus || job.status}
                            onChange={(value) =>
                              setSelectedStatus(value as JobStatus)
                            }
                            options={STATUS_OPTIONS}
                          />
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                          <label
                            htmlFor={`message-${job.name}`}
                            className="text-sm font-semibold text-muted px-1"
                          >
                            Message:
                          </label>
                          <textarea
                            id={`message-${job.name}`}
                            value={jobMessage}
                            onChange={(e) => setJobMessage(e.target.value)}
                            placeholder="Enter a description for this status change"
                            className="w-full px-3 py-2 text-sm leading-[1.5]"
                            rows={2}
                          />
                        </div>
                      </div>
                      <div className="flex gap-4 justify-end">
                        <Button
                          onClick={handleCancelEdit}
                          variant="outline-secondary"
                        >
                          Cancel
                        </Button>
                        <Button onClick={() => handleSaveStatus(job)}>
                          Save
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    {isSuperAdmin && job.mode !== 'MANUAL' && (
                      <div className="flex flex-col items-start gap-1.5 border-b border-gray-50 pb-3 pt-1">
                        <label className="text-sm font-medium text-body">
                          Trigger manual notification to AMS
                        </label>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={(e) => handleRerunJob(e, job)}
                          disabled={notifyAmsMutation.isPending}
                        >
                          {notifyAmsMutation.isPending ? (
                            <LoadingSpinner size="xs" />
                          ) : (
                            'Rerun'
                          )}
                        </Button>
                      </div>
                    )}
                    <div className="flex justify-between items-center gap-4 py-1.5 pb-2 border-b border-gray-50 last:border-b-0">
                      <div className="grid grid-cols-1 gap-1 md:grid-cols-[120px_1fr] md:gap-3">
                        <span className="text-sm font-semibold text-muted px-1">
                          Start Time:
                        </span>
                        <span className="text-sm text-muted break-words">
                          {formatDateTime(job.start)}
                        </span>
                      </div>
                      {isSuperAdmin &&
                        job.mode === 'MANUAL' &&
                        editingJob !== job.name && (
                          <Button
                            onClick={() => handleEditClick(job)}
                            size="sm"
                            variant="outline-primary"
                          >
                            Edit Status
                          </Button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 gap-1 md:grid-cols-[120px_1fr] md:gap-3 py-1.5 border-b border-gray-50 last:border-b-0">
                      <span className="text-sm font-semibold text-muted px-1">
                        End Time:
                      </span>
                      <span className="text-sm text-muted break-words">
                        {formatDateTime(job.end)}
                      </span>
                    </div>
                    {job.message && (
                      <div className="grid grid-cols-1 gap-1 md:grid-cols-[120px_1fr] md:gap-3 py-1.5 border-b border-gray-50 last:border-b-0">
                        <span className="text-sm font-semibold text-muted px-1">
                          Message:
                        </span>
                        <span className="text-sm text-muted break-words">
                          {job.message}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
      ) : (
        <div className="bg-surface-muted border border-line rounded-lg p-12 text-center">
          <p className="text-muted">
            No status information available for this tenant.
          </p>
        </div>
      )}
    </div>
  )
}

export default TenantStatusTab
