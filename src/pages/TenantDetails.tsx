import { useState, useEffect } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { useGetTenantById, useGetUserTenantById } from '../hooks/useTenants'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import TenantReports from './TenantReports'
import styles from './TenantDetails.module.css'
import {
  ArrowLeft,
  ArrowUpRightFromSquare,
  MailIcon,
  ShieldCheck,
} from 'lucide-react'

const TenantDetails = () => {
  const { id } = useParams<{ id: string }>()

  const location = useLocation()
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState<'info' | 'reports'>('info')

  useEffect(() => {
    const hash = location?.hash
    if (hash?.startsWith('#reports')) {
      setActiveTab('reports')
    } else {
      setActiveTab('info')
    }
  }, [location.hash])

  const isSuperAdmin = profile?.roles?.includes('super_admin')

  const {
    data: adminTenantData,
    isLoading: adminLoading,
    error: adminError,
  } = useGetTenantById(id || '', isSuperAdmin)
  const {
    data: userTenantData,
    isLoading: userLoading,
    error: userError,
  } = useGetUserTenantById(id || '', !isSuperAdmin)

  const tenantData = isSuperAdmin ? adminTenantData : userTenantData
  const isLoading = isSuperAdmin ? adminLoading : userLoading
  const error = isSuperAdmin ? adminError : userError

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <ErrorDisplay error={error} context="tenant" />
      </div>
    )
  }

  if (!tenantData) {
    return (
      <div className="page-container">
        <ErrorDisplay
          error="The tenant you are looking for does not exist or has been removed."
          context="tenant"
        />
      </div>
    )
  }

  const { contacts, metadata } = tenantData

  return (
    // this is a temporary fix to negate the parent's layout global padding to every page
    <div>
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 uppercase tracking-wider">
            <Link
              to="/tenants"
              className="hover:text-blue-600 flex items-center gap-1"
            >
              <ArrowLeft size={12} /> Tenants
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-slate-800">{tenantData.info.name}</span>
          </div>
        </div>

        <div className="px-4 py-3 flex items-center gap-6">
          <div className="flex-shrink-0 w-16 h-16 bg-white border border-gray-200 rounded flex items-center justify-center p-1 shadow-sm">
            <img
              src="https://core-proxy.sandbox.eosc-beyond.eu/static/images/logo.png"
              alt="Logo"
              className="object-contain"
            />
          </div>

          <div className="flex-shrink-0 border-r border-gray-100 pr-6 mr-2">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold leading-none">
                {tenantData.info.name}
              </h1>
              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-100">
                {/* This is a placeholder */}
                <ShieldCheck size={10} /> ACTIVE
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1 max-w-md">
              {tenantData.info.description}
            </p>
          </div>

          <div className="flex items-center gap-8 flex-grow">
            {tenantData.info.website && (
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                  Website
                </span>
                <a
                  href={tenantData.info.website}
                  className="text-xs text-blue-600 flex items-center gap-1 font-medium hover:underline"
                >
                  {tenantData.info.website?.replace('https://www.', '')}{' '}
                  <ArrowUpRightFromSquare />
                </a>
              </div>
            )}

            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                ID
              </span>
              <span className="text-xs font-semibold flex items-center gap-1 text-slate-700">
                {tenantData.id}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                Email
              </span>
              <span className="text-xs font-semibold flex items-center gap-1 text-slate-700">
                <MailIcon size={12} className="text-slate-400" />{' '}
                {tenantData.info.email}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                Created / Updated
              </span>
              <span className="text-xs font-medium text-slate-600">
                {tenantData.info.created_at?.split('T')[0]}{' '}
                <span className="text-gray-300 mx-1">|</span>{' '}
                {tenantData.info.updated_at?.split('T')[0]}
              </span>
            </div>
          </div>
        </div>

        <div className="px-4 flex gap-6">
          {['info', 'reports'].map((tab) => (
            <button
              key={tab}
              className={`py-2 text-[12px] cursor-pointer font-bold border-b-2 transition-colors ${tab === activeTab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              onClick={() => {
                if (tab === 'info' || tab === 'reports') {
                  setActiveTab(tab)
                  window.location.hash = tab
                }
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4">
        {activeTab === 'info' && (
          <>
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
                        <p className={styles['contact-email']}>
                          {contact.email}
                        </p>
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
                <h2 className={styles['section-title']}>
                  Infrastructure Metadata
                </h2>
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
                              <span className={styles['no-data']}>
                                Not provided
                              </span>
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
                              <span className={styles['no-data']}>
                                Not provided
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Topology */}
                      {metadata.instance.topology && (
                        <>
                          <div className={styles['metadata-subsection']}>
                            <h3 className={styles['subsection-title']}>
                              Topology
                            </h3>
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
                  {metadata.internalLists &&
                    metadata.internalLists.length > 0 && (
                      <>
                        <div className={styles['metadata-subsection']}>
                          <h3 className={styles['subsection-title']}>
                            Internal Lists
                          </h3>
                        </div>
                        <div className={styles['internal-lists']}>
                          {metadata.internalLists.map((list, index) => (
                            <div
                              key={index}
                              className={styles['internal-list-item']}
                            >
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
                        <h3 className={styles['subsection-title']}>
                          Authentication
                        </h3>
                      </div>
                      <div className={styles['card-row']}>
                        <div className={styles['info-group']}>
                          <label className={styles.label}>Auth Name</label>
                          <p className={styles.value}>
                            {metadata.auth_metadata.auth_name || (
                              <span className={styles['no-data']}>
                                Not provided
                              </span>
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
                              <span className={styles['no-data']}>
                                Not provided
                              </span>
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
          </>
        )}

        {activeTab === 'reports' && <TenantReports tenantId={id || ''} />}
      </div>
    </div>
  )
}

export default TenantDetails
