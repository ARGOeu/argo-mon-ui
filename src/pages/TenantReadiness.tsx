import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/16/solid'
import { useGetTenantReadiness, useGetUserTenantById } from '@/hooks/useTenants'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import Button from '@/components/Button'
import styles from './TenantReadiness.module.css'
import type { ReadinessCheckDetail } from '@/types/tenants'

const TenantReadiness = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: tenantData } = useGetUserTenantById(id || '')

  const {
    data: readinessData,
    isLoading: readinessLoading,
    error: readinessError,
    refetch: refetchReadiness,
    isFetching: isRefetching,
  } = useGetTenantReadiness(id || '')

  const handleBackClick = () => {
    navigate('/tenants')
  }

  const handleCheckReadiness = () => {
    refetchReadiness()
  }

  const readiness = readinessData?.data
  const hasError = readinessError || !tenantData

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

  const getReadinessClass = (ready: boolean) => {
    return ready ? styles['status-ready'] : styles['status-not-ready']
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
      <div className={styles['check-card']}>
        <div className={styles['check-header']}>
          <div className={styles['check-title-wrapper']}>
            <h3 className={styles['check-title']}>{title}</h3>
          </div>
          <span
            className={`${styles['status-badge']} ${getReadinessClass(detail.ready)}`}
          >
            {detail.ready ? 'Ready' : 'Not Ready'}
          </span>
        </div>
        <div
          className={`${styles['check-message']} ${
            !hasMessage ? styles['check-message-empty'] : ''
          }`}
        >
          {displayMessage}
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className={styles.header}>
        <div className={styles['title-section']}>
          <div>
            <h1 className="page-title">Tenant Readiness</h1>
            <p className="page-subtitle">
              View readiness checks for tenant
              <strong style={{ wordBreak: 'break-all' }}>
                {tenantData?.info.name ? ` ${tenantData.info.name}` : '...'}
              </strong>
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleBackClick}>
            <ArrowLeftIcon className="size-4" />
            Back to Tenants
          </Button>
        </div>
        <div className={styles['action-section']}>
          <Button
            variant="primary"
            onClick={handleCheckReadiness}
            disabled={isRefetching}
          >
            {isRefetching ? 'Checking...' : 'Check Readiness'}
          </Button>
        </div>
      </div>

      {readinessError && (
        <ErrorDisplay error={readinessError} context="readiness data" />
      )}

      {!tenantData && !readinessError && (
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
        <div className={styles.content}>
          <div className={styles['overall-status-card']}>
            <div className={styles['overall-status-header']}>
              <div className={styles['overall-status-title-wrapper']}>
                <h2 className={styles['overall-status-title']}>
                  Overall Tenant Status
                </h2>
              </div>
              <span
                className={`${styles['status-badge']} ${getReadinessClass(readiness.ready)}`}
              >
                {readiness.ready ? 'Ready' : 'Not Ready'}
              </span>
            </div>
            <div className={styles['overall-status-info']}>
              <div className={styles['info-row']}>
                <span className={styles['info-label']}>Tenant Name:</span>
                <span className={styles['info-value']}>{readiness.name}</span>
              </div>
              <div className={styles['info-row']}>
                <span className={styles['info-label']}>Last Check:</span>
                <span className={styles['info-value']}>
                  {formatDateTime(readiness.last_check)}
                </span>
              </div>
            </div>
          </div>

          <div className={styles['checks-grid']}>
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

export default TenantReadiness
