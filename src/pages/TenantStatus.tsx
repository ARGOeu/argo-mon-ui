import { useParams, useNavigate } from 'react-router-dom'
import { useGetTenantById, useGetTenantStatus } from '@/hooks/useTenants'
import { useAuth } from '@/auth/useAuth'
import { useState } from 'react'
import {
  ArrowPathIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/16/solid'
import Button from '@/components/Button'
import type { Job, JobStatus } from '@/types/tenants'
import styles from './TenantStatus.module.css'

const JOB_NAMES: Record<string, string> = {
  init_ams: 'ARGO Messaging Service (AMS) Status',
  init_mongo: 'MongoDB Status',
  create_domain_names: 'Domain Names Creation Status',
}

const getStatusDisplay = (status: JobStatus): string => {
  if (status === 'unknown') return 'Unknown'
  if (status === 'initialising') return 'Initialising'
  if (status === 'initialised') return 'Initialised'
  if (status === 'failed_initialisation') return 'Failed Initialisation'
  if (status === 'in_progress') return 'In Progress'
  if (status === 'completed') return 'Completed'
  if (status === 'failed') return 'Failed'
  return status
}

const getStatusIcon = (status: JobStatus) => {
  if (status === 'completed')
    return <CheckCircleIcon className={styles['status-icon-completed']} />
  if (status === 'failed' || status === 'failed_initialisation')
    return <XCircleIcon className={styles['status-icon-failed']} />
  if (status === 'initialising')
    return <ClockIcon className={styles[`status-icon-initialising`]} />
  if (status === 'initialised')
    return <ClockIcon className={styles['status-icon-initialised']} />
  if (status === 'in_progress')
    return <ClockIcon className={styles['status-icon-in-progress']} />

  return <QuestionMarkCircleIcon className={styles['status-icon-unknown']} />
}

const formatDateTime = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const TenantStatus = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = useAuth()

  const isSuperAdmin = profile?.roles?.includes('super_admin')
  const [expandedJobs, setExpandedJobs] = useState<Record<string, boolean>>({})

  const { data: tenantData, isLoading: tenantLoading } = useGetTenantById(
    id || '',
  )
  const { data: statusData } = useGetTenantStatus(id || '')
  const jobs = statusData && statusData.status.jobs

  if (!isSuperAdmin) {
    return (
      <div className={styles.container}>
        <div className={styles['access-denied']}>
          <p>Access denied. This page is only available for admins.</p>
        </div>
      </div>
    )
  }

  if (tenantLoading) {
    return (
      <div className="loading-container">
        <ArrowPathIcon className="animate-spin size-10 text-blue-400" />
      </div>
    )
  }

  if (!tenantData) {
    return (
      <div className={styles.container}>
        <div className={styles['not-found']}>
          <p>Tenant not found</p>
        </div>
      </div>
    )
  }

  const toggleJob = (jobName: string) => {
    setExpandedJobs((prev) => ({
      ...prev,
      [jobName]: !prev[jobName],
    }))
  }

  const getStepStatus = (
    job: Job,
    step: string,
  ): 'active' | 'completed' | 'pending' | 'failed' => {
    const statusOrder = [
      'unknown',
      'initialising',
      'initialised',
      'failed_initialisation',
      'in_progress',
      'completed',
      'failed',
    ]
    const currentIndex = statusOrder.indexOf(job.status)
    const stepIndex = statusOrder.indexOf(step)

    if (job.status === 'failed') {
      if (step === 'failed') return 'failed'
      if (stepIndex < currentIndex) return 'completed'
      return 'pending'
    }

    if (job.status === 'failed_initialisation') {
      if (step === 'failed_initialisation') return 'failed'
      if (step === 'unknown' || step === 'initialising') return 'completed'
      return 'pending'
    }

    if (job.status === 'completed' && step === 'completed') return 'completed'

    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'active'
    return 'pending'
  }

  const getProgressSteps = (job: Job) => {
    return [
      { key: 'unknown', label: 'Unknown' },
      { key: 'initialising', label: 'Initialising' },
      {
        key:
          job.status === 'failed_initialisation'
            ? 'failed_initialisation'
            : 'initialised',
        label:
          job.status === 'failed_initialisation'
            ? 'Failed Initialisation'
            : 'Initialised',
      },
      { key: 'in_progress', label: 'In Progress' },
      {
        key: job.status === 'failed' ? 'failed' : 'completed',
        label: job.status === 'failed' ? 'Failed' : 'Completed',
      },
    ]
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/tenants/view')}
          >
            <ArrowLeftIcon className={styles['back-icon']} />
            Back to Tenants
          </Button>
          <h1 className="page-title" style={{ marginTop: '1rem' }}>
            Tenant Status
          </h1>
          <p className="page-subtitle">
            View and manage status for {tenantData.info.name}
          </p>
        </div>
      </div>

      <div className={styles.content}>
        {jobs && jobs.length > 0 ? (
          jobs.map((job) => (
            <div key={job.name} className={styles['job-card']}>
              <div
                className={styles['job-header']}
                onClick={() => toggleJob(job.name)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles['job-title-wrapper']}>
                  {getStatusIcon(job.status)}
                  <h2 className={styles['job-title']}>
                    {JOB_NAMES[job.name] || job.name}
                  </h2>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span
                    className={`${styles['job-status-badge']} ${styles[`status-${job.status}`]}`}
                  >
                    {getStatusDisplay(job.status)}
                  </span>
                  {expandedJobs[job.name] ? (
                    <ChevronUpIcon className={styles['toggle-icon']} />
                  ) : (
                    <ChevronDownIcon className={styles['toggle-icon']} />
                  )}
                </div>
              </div>

              {expandedJobs[job.name] && (
                <>
                  <div className={styles['progress-container']}>
                    <div className={styles['step-wrapper']}>
                      {getProgressSteps(job).map((step, index, array) => (
                        <>
                          <div
                            key={step.key}
                            className={`${styles.step} ${styles[getStepStatus(job, step.key)]}`}
                          >
                            <div className={styles['step-indicator']} />
                            <span className={styles['step-label']}>
                              {step.label}
                            </span>
                          </div>
                          {index < array.length - 1 && (
                            <div className={styles['step-line']} />
                          )}
                        </>
                      ))}
                    </div>
                  </div>

                  <div className={styles['job-details']}>
                    <div className={styles['detail-row']}>
                      <span className={styles['detail-label']}>
                        Start Time:
                      </span>
                      <span className={styles['detail-value']}>
                        {formatDateTime(job.start)}
                      </span>
                    </div>
                    <div className={styles['detail-row']}>
                      <span className={styles['detail-label']}>End Time:</span>
                      <span className={styles['detail-value']}>
                        {formatDateTime(job.end)}
                      </span>
                    </div>
                    {job.message && (
                      <div className={styles['detail-row']}>
                        <span className={styles['detail-label']}>Message:</span>
                        <span className={styles['detail-value']}>
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
          <div className={styles['empty-state']}>
            <p>No status information available for this tenant.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TenantStatus
