import { useParams, useNavigate } from 'react-router-dom'
import { ArrowPathIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../auth/useAuth'
import { useGetTenantById, useGetUserTenantById } from '../hooks/useTenants'
import styles from './TenantDetails.module.css'
import Button from '@/components/Button'

const TenantDetails = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = useAuth()

  const isSuperAdmin = profile?.roles?.includes('super_admin')

  const { data: adminTenantData, isLoading: adminLoading } = useGetTenantById(
    id || '',
    isSuperAdmin,
  )
  const { data: userTenantData, isLoading: userLoading } = useGetUserTenantById(
    id || '',
    !isSuperAdmin,
  )

  const tenantData = isSuperAdmin ? adminTenantData : userTenantData
  const isLoading = isSuperAdmin ? adminLoading : userLoading

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <ArrowPathIcon className="animate-spin size-10 text-blue-400" />
        </div>
      </div>
    )
  }

  if (!tenantData) {
    return (
      <div className="page-container">
        <div className={styles.error}>
          <p>Tenant not found</p>
        </div>
      </div>
    )
  }

  const { info, contacts, metadata } = tenantData

  return (
    <div className="page-container">
      <div className={styles.header}>
        <div>
          <h1 className="page-title">Tenant Details</h1>
          <p className="page-subtitle">
            View detailed information about the tenant
            <strong style={{ wordBreak: 'break-all' }}>
              {tenantData?.info.name ? ` ${tenantData.info.name}` : '...'}
            </strong>
          </p>
        </div>
        <Button
          onClick={() => navigate('/tenants/view')}
          size="sm"
          variant="secondary"
        >
          <ArrowLeftIcon className="size-4" />
          Back to Tenants
        </Button>
      </div>

      {/* Tenant Information */}
      <div className={styles.section}>
        <div className={styles['section-header']}>
          <h2 className={styles['section-title']}>Tenant Information</h2>
        </div>
        <div className={styles.card}>
          <div className={styles['card-row']}>
            <div className={styles['info-group']}>
              <label className={styles.label}>Name</label>
              <p className={styles.value}>{info.name}</p>
            </div>
            <div className={styles['info-group']}>
              <label className={styles.label}>Email</label>
              <p className={styles.value}>{info.email}</p>
            </div>
          </div>

          <div className={styles['card-row']}>
            <div className={styles['info-group']}>
              <label className={styles.label}>Description</label>
              <p className={styles.value}>
                {info.description || (
                  <span className={styles['no-data']}>No description</span>
                )}
              </p>
            </div>
          </div>

          {(info.created_at || info.updated_at) && (
            <div className={styles['card-row']}>
              {info.created_at && (
                <div className={styles['info-group']}>
                  <label className={styles.label}>Created At</label>
                  <p className={styles.value}>
                    {new Date(info.created_at).toLocaleString()}
                  </p>
                </div>
              )}
              {info.updated_at && (
                <div className={styles['info-group']}>
                  <label className={styles.label}>Last Updated</label>
                  <p className={styles.value}>
                    {new Date(info.updated_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className={styles['card-row']}>
            <div className={styles['info-group']}>
              <label className={styles.label}>Website</label>
              <p className={styles.value}>
                {info.website ? (
                  <a
                    href={info.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    {info.website}
                  </a>
                ) : (
                  <span className={styles['no-data']}>Not provided</span>
                )}
              </p>
            </div>
            <div className={styles['info-group']}>
              <label className={styles.label}>Logo</label>
              {info.image ? (
                <img
                  src={info.image}
                  alt={`${info.name} logo`}
                  className={styles.logo}
                />
              ) : (
                <span className={styles['no-data']}>No logo</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contacts */}
      <div className={styles.section}>
        <div className={styles['section-header']}>
          <h2 className={styles['section-title']}>Contacts</h2>
        </div>
        {contacts && contacts.length > 0 ? (
          <div className={styles['contacts-grid']}>
            {contacts.map((contact, index) => (
              <div key={index} className={styles['card']}>
                <div className={styles['contact-info']}>
                  <p className={styles['contact-name']}>{contact.name}</p>
                  <p className={styles['contact-email']}>{contact.email}</p>
                  {contact.type && (
                    <span className={styles['contact-type']}>
                      {contact.type}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.card}>
            <p className={styles['no-data']}>No contacts available</p>
          </div>
        )}
      </div>

      {/* Infrastructure Metadata */}
      <div className={styles.section}>
        <div className={styles['section-header']}>
          <h2 className={styles['section-title']}>Infrastructure Metadata</h2>
        </div>
        {metadata &&
        (metadata.instance ||
          metadata.internalLists ||
          metadata.auth_metadata) ? (
          <div
            className={`${styles.card} ${styles['infrastructure-metadata']}`}
          >
            {/* Instance Information */}
            {metadata.instance && (
              <>
                <div className={styles['metadata-subsection']}>
                  <h3 className={styles['subsection-title']}>Instance</h3>
                </div>
                <div className={styles['card-row']}>
                  <div className={styles['info-group']}>
                    <label className={styles.label}>UI URL</label>
                    <p className={styles.value}>
                      {metadata.instance.ui_url ? (
                        <a
                          href={metadata.instance.ui_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.link}
                        >
                          {metadata.instance.ui_url}
                        </a>
                      ) : (
                        <span className={styles['no-data']}>Not provided</span>
                      )}
                    </p>
                  </div>
                  <div className={styles['info-group']}>
                    <label className={styles.label}>POEM URL</label>
                    <p className={styles.value}>
                      {metadata.instance.poem_url ? (
                        <a
                          href={metadata.instance.poem_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.link}
                        >
                          {metadata.instance.poem_url}
                        </a>
                      ) : (
                        <span className={styles['no-data']}>Not provided</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Topology */}
                {metadata.instance.topology && (
                  <>
                    <div className={styles['metadata-subsection']}>
                      <h3 className={styles['subsection-title']}>Topology</h3>
                    </div>
                    <div className={styles['card-row']}>
                      <div className={styles['info-group']}>
                        <label className={styles.label}>Type</label>
                        <p className={styles.value}>
                          {metadata.instance.topology.type || (
                            <span className={styles['no-data']}>
                              Not provided
                            </span>
                          )}
                        </p>
                      </div>
                      <div className={styles['info-group']}>
                        <label className={styles.label}>URL</label>
                        <p className={styles.value}>
                          {metadata.instance.topology.url ? (
                            <a
                              href={metadata.instance.topology.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.link}
                            >
                              {metadata.instance.topology.url}
                            </a>
                          ) : (
                            <span className={styles['no-data']}>
                              Not provided
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className={styles['card-row']}>
                      <div className={styles['info-group']}>
                        <label className={styles.label}>Feed</label>
                        <p className={styles.value}>
                          {metadata.instance.topology.feed || (
                            <span className={styles['no-data']}>
                              Not provided
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Internal Lists */}
            {metadata.internalLists && metadata.internalLists.length > 0 && (
              <>
                <div className={styles['metadata-subsection']}>
                  <h3 className={styles['subsection-title']}>Internal Lists</h3>
                </div>
                <div className={styles['internal-lists']}>
                  {metadata.internalLists.map((list, index) => (
                    <div key={index} className={styles['internal-list-item']}>
                      <div className={styles['info-group']}>
                        <label className={styles.label}>Email</label>
                        <p className={styles.value}>{list.email}</p>
                      </div>
                      <div className={styles['info-group']}>
                        <label className={styles.label}>Type</label>
                        <p className={styles.value}>{list.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Authentication Metadata */}
            {metadata.auth_metadata && (
              <>
                <div className={styles['metadata-subsection']}>
                  <h3 className={styles['subsection-title']}>Authentication</h3>
                </div>
                <div className={styles['card-row']}>
                  <div className={styles['info-group']}>
                    <label className={styles.label}>Auth Name</label>
                    <p className={styles.value}>
                      {metadata.auth_metadata.auth_name || (
                        <span className={styles['no-data']}>Not provided</span>
                      )}
                    </p>
                  </div>
                  <div className={styles['info-group']}>
                    <label className={styles.label}>Auth URL</label>
                    <p className={styles.value}>
                      {metadata.auth_metadata.auth_url ? (
                        <a
                          href={metadata.auth_metadata.auth_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.link}
                        >
                          {metadata.auth_metadata.auth_url}
                        </a>
                      ) : (
                        <span className={styles['no-data']}>Not provided</span>
                      )}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className={styles.card}>
            <p className={styles['no-data']}>
              No infrastructure metadata available
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TenantDetails
