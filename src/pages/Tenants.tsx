import { useGetTenants } from '@/hooks/useTenants'
import { useAuth } from '@/auth/useAuth'
import { LoginPrompt } from '@/components/LoginPrompt'
import {
  ArrowPathIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/16/solid'
import { Button } from '@/components/Button'
import { useNavigate } from 'react-router-dom'
import styles from './Tenants.module.css'

export const Tenants = () => {
  const { authenticated, login } = useAuth()
  const { data, isLoading } = useGetTenants()
  const navigate = useNavigate()

  const tenants =
    data?.content?.map((tenant) => ({
      ...tenant?.info,
      id: tenant?.id,
    })) || []

  if (!authenticated) {
    return (
      <LoginPrompt
        title="Manage Tenants"
        description="Login to view and manage your tenants"
        onLogin={login}
      />
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className="page-title">Tenants</h1>
          <p className="page-subtitle">
            Manage and create new tenants for the monitoring service
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/tenants/create')}
        >
          Create New Tenant
        </Button>
      </div>

      {isLoading ? (
        <div className={styles['loading-container']}>
          <ArrowPathIcon className="animate-spin size-10 text-blue-500" />
        </div>
      ) : (
        <div className={styles.grid}>
          {tenants && tenants?.length > 0 ? (
            tenants.map((tenant) => (
              <div key={tenant.id} className={styles.card}>
                <div className={styles['card-content']}>
                  <div className={styles['card-header']}>
                    <div className={styles['image-container']}>
                      {tenant.image ? (
                        <img
                          className={styles['tenant-image']}
                          src={tenant.image}
                        />
                      ) : (
                        <div className={styles['tenant-fallback']}>
                          <span className={styles['fallback-text']}>
                            {tenant.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className={styles['info-container']}>
                      <h3 className={styles['tenant-name']}>{tenant.name}</h3>
                      <p className={styles['tenant-email']}>{tenant.email}</p>
                    </div>
                  </div>
                  <p className={styles['tenant-description']}>
                    {tenant.description}
                  </p>
                </div>
                <div className={styles['card-footer']}>
                  <button
                    aria-label="Edit Tenant"
                    className={`${styles['action-button']} ${styles.edit} tooltip`}
                    data-tip="Edit"
                  >
                    <PencilSquareIcon className={styles['action-icon']} />
                  </button>
                  <button
                    aria-label="Delete Tenant"
                    className={`${styles['action-button']} ${styles.delete} tooltip`}
                    data-tip="Delete"
                  >
                    <TrashIcon className={styles['action-icon']} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className={styles['empty-state']}>
              <p className={styles['empty-text']}>No tenants found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
