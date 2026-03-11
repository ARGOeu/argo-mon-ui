import { useState, useEffect } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { useGetUserTenantById } from '../hooks/useTenants'
import { useGetUserTenantProjects } from '../hooks/useTenants'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import Button from '@/components/Button'
import { ArrowLeftIcon } from '@heroicons/react/16/solid'
import { ArrowUpRightFromSquare, MailIcon } from 'lucide-react'
import TenantReports from './TenantReports'
import Tabs from '@/components/Tabs'
import Badge from '@/components/Badge'

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const cardClass = 'bg-surface-muted rounded-lg py-2 px-4 flex flex-col gap-3'

const cardRowClass =
  'grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4'

const infoGroupClass = 'flex flex-col gap-0.5'

const labelClass = 'text-xs font-semibold text-muted uppercase tracking-wider'

const valueClass = 'text-sm text-gray-800 m-0 break-words leading-none'

const linkClass =
  'text-blue-500 no-underline transition-colors hover:text-blue-600 hover:underline'

const noDataClass = 'text-sm text-subtle italic'

const TenantDetails = () => {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<'info' | 'reports'>('info')

  useEffect(() => {
    const hash = location?.hash
    if (hash?.startsWith('#reports')) {
      setActiveTab('reports')
    } else {
      setActiveTab('info')
    }
  }, [location.hash])

  const { data: tenantData, isLoading, error } = useGetUserTenantById(id || '')

  const {
    data: projectsData,
    isLoading: projectsLoading,
    fetchNextPage: fetchNextProjectsPage,
    hasNextPage: hasNextProjectsPage,
  } = useGetUserTenantProjects(id || '', true)

  useEffect(() => {
    if (hasNextProjectsPage) {
      fetchNextProjectsPage()
    }
  }, [projectsData, hasNextProjectsPage, fetchNextProjectsPage])

  const projects =
    projectsData?.pages?.flatMap((page) => page.content || []) || []

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
    <div className="w-[100%] max-w-[1480px]">
      <header className="px-6">
        <Link
          to="/tenants"
          className="inline-flex items-center gap-1.5 text-base text-subtle hover:text-foreground no-underline transition-colors py-2"
        >
          <ArrowLeftIcon className="size-4" />
          Back to Tenants
        </Link>
        <div className="flex flex-col xl:flex-row items-start xl:items-center gap-4 xl:gap-6">
          <div className="flex w-full items-start justify-between xl:contents">
            {tenantData?.info?.image ? (
              <div className="flex-shrink-0 w-16 h-16 bg-white border border-line rounded flex items-center justify-center p-1 shadow-sm">
                <img
                  src={tenantData.info.image}
                  alt="Logo"
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="size-16 rounded-lg bg-slate-500 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-white">
                  {tenantData.info.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <Button
              href={`/tenants/edit/${id}`}
              size="sm"
              variant="primary"
              className="whitespace-nowrap flex-shrink-0 xl:order-last xl:ml-auto self-start"
            >
              Edit Tenant
            </Button>
          </div>

          <div className="flex-shrink-0 xl:border-r border-gray-100 xl:pr-6 xl:mr-2 w-full xl:w-auto">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold leading-none">
                {tenantData.info.name}
              </h1>
              <Badge
                className="bg-emerald-100 text-emerald-800 border border-emerald-300"
                size="sm"
              >
                Active
              </Badge>
            </div>
            <p
              className="text-sm text-muted mt-1 max-w-md line-clamp-3"
              title={tenantData.info.description}
            >
              {tenantData.info.description}
            </p>
          </div>

          <div className="flex flex-wrap items-start gap-4 sm:gap-6 xl:gap-8 flex-grow w-full xl:w-auto">
            {tenantData.info.website && (
              <div className="flex flex-col min-w-[120px]">
                <span className="text-xs font-bold text-subtle uppercase tracking-tight">
                  Website
                </span>
                <a
                  href={tenantData.info.website}
                  className="text-sm text-blue-600 flex items-center gap-1 font-medium hover:underline break-words"
                >
                  <span className="break-words">
                    {tenantData.info.website?.replace('https://www.', '')}
                  </span>
                  <ArrowUpRightFromSquare size={14} className="flex-shrink-0" />
                </a>
              </div>
            )}

            <div className="flex flex-col min-w-[120px]">
              <span className="text-xs font-bold text-subtle uppercase tracking-tight">
                ID
              </span>
              <span className="text-sm font-semibold flex items-center gap-1 text-slate-700 break-words">
                {tenantData.id}
              </span>
            </div>

            <div className="flex flex-col min-w-[120px]">
              <span className="text-xs font-bold text-subtle uppercase tracking-tight">
                Email
              </span>
              <span className="text-sm font-semibold flex items-center gap-1 text-slate-700">
                <MailIcon size={12} className="text-slate-400 flex-shrink-0" />{' '}
                <span className="break-words">{tenantData.info.email}</span>
              </span>
            </div>
          </div>
        </div>

        <Tabs
          tabs={[
            { id: 'info', label: 'Info' },
            { id: 'reports', label: 'Reports' },
          ]}
          activeTab={activeTab}
          onChange={(id) => {
            setActiveTab(id as 'info' | 'reports')
            window.location.hash = id
          }}
          className="mt-2"
        />
      </header>

      <div className="py-4 px-10">
        {activeTab === 'info' && (
          <>
            {/* Projects */}
            <div className="mb-5">
              <div className="mb-1">
                <h2 className="text-lg font-semibold text-foreground">
                  Projects
                </h2>
              </div>
              {projectsLoading ? (
                <div className={cardClass}>
                  <LoadingSpinner size="sm" inline />
                </div>
              ) : projects && projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
                  {projects.map((project) => (
                    <div key={project.id} className={cardClass}>
                      <div className="flex flex-col gap-1">
                        <p className="text-base font-semibold text-foreground m-0">
                          {project.name}
                        </p>
                        {project.description && (
                          <p
                            className="text-sm text-muted m-0 line-clamp-8"
                            title={project.description}
                          >
                            {project.description}
                          </p>
                        )}
                        <div className="text-xs text-muted m-0 mt-0.5">
                          <span>
                            {formatDate(project.start_date)} -{' '}
                            {formatDate(project.end_date)}
                          </span>
                          {project.sustainability_end_date && (
                            <span className="block mt-0.5">
                              Sustainability:{' '}
                              {formatDate(project.sustainability_end_date)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-fit max-w-[320px] min-w-[180px] bg-surface-muted rounded-lg py-2 px-4">
                  <p className={noDataClass}>No projects assigned</p>
                </div>
              )}
            </div>

            {/* Contacts */}
            <div className="mb-5">
              <div className="mb-1">
                <h2 className="text-lg font-semibold text-foreground">
                  Contacts
                </h2>
              </div>
              {contacts && contacts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
                  {contacts.map((contact, index) => (
                    <div key={index} className={cardClass}>
                      <div className="flex flex-col gap-1">
                        <p className="text-base font-semibold text-foreground m-0">
                          {contact.name}
                        </p>
                        <p className="text-sm text-muted m-0">
                          {contact.email}
                        </p>
                        {contact.type && (
                          <span className="inline-block mt-1 px-2.5 py-1 bg-brand-muted text-blue-800 text-xs font-medium rounded-full w-fit">
                            {contact.type}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={cardClass}>
                  <p className={noDataClass}>No contacts available</p>
                </div>
              )}
            </div>

            {/* Infrastructure Metadata */}
            <div className="mb-5">
              <div className="mb-1">
                <h2 className="text-lg font-semibold text-foreground">
                  Infrastructure Metadata
                </h2>
              </div>
              {metadata &&
              (metadata.instance ||
                metadata.internalLists ||
                metadata.auth_metadata) ? (
                <div className="bg-surface-muted rounded-lg py-2 px-4 flex flex-col gap-2">
                  {/* Instance Information */}
                  {metadata.instance && (
                    <>
                      <div className="pt-2 border-t border-line first:pt-0 first:border-t-0">
                        <h3 className="text-base font-semibold text-body">
                          Instance
                        </h3>
                      </div>
                      <div className={cardRowClass}>
                        <div className={infoGroupClass}>
                          <label className={labelClass}>UI URL</label>
                          <p className={valueClass}>
                            {metadata.instance.ui_url ? (
                              <a
                                href={metadata.instance.ui_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={linkClass}
                              >
                                {metadata.instance.ui_url}
                              </a>
                            ) : (
                              <span className={noDataClass}>Not provided</span>
                            )}
                          </p>
                        </div>
                        <div className={infoGroupClass}>
                          <label className={labelClass}>POEM URL</label>
                          <p className={valueClass}>
                            {metadata.instance.poem_url ? (
                              <a
                                href={metadata.instance.poem_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={linkClass}
                              >
                                {metadata.instance.poem_url}
                              </a>
                            ) : (
                              <span className={noDataClass}>Not provided</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Topology */}
                      {metadata.instance.topology && (
                        <>
                          <div className="pt-2 border-t border-line">
                            <h3 className="text-base font-semibold text-body">
                              Topology
                            </h3>
                          </div>
                          <div className={cardRowClass}>
                            <div className={infoGroupClass}>
                              <label className={labelClass}>Type</label>
                              <p className={valueClass}>
                                {metadata.instance.topology.type || (
                                  <span className={noDataClass}>
                                    Not provided
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className={infoGroupClass}>
                              <label className={labelClass}>URL</label>
                              <p className={valueClass}>
                                {metadata.instance.topology.url ? (
                                  <a
                                    href={metadata.instance.topology.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={linkClass}
                                  >
                                    {metadata.instance.topology.url}
                                  </a>
                                ) : (
                                  <span className={noDataClass}>
                                    Not provided
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className={cardRowClass}>
                            <div className={infoGroupClass}>
                              <label className={labelClass}>Feed</label>
                              <p className={`${valueClass} max-w-[45%]`}>
                                {metadata.instance.topology.feed ? (
                                  metadata.instance.topology.feed.startsWith(
                                    'http',
                                  ) ? (
                                    <a
                                      href={metadata.instance.topology.feed}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`${linkClass} break-words`}
                                    >
                                      {metadata.instance.topology.feed}
                                    </a>
                                  ) : (
                                    <span className="break-words">
                                      {metadata.instance.topology.feed}
                                    </span>
                                  )
                                ) : (
                                  <span className={noDataClass}>
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
                        <div className="pt-2 border-t border-line">
                          <h3 className="text-base font-semibold text-body">
                            Internal Lists
                          </h3>
                        </div>
                        <div className="flex flex-col gap-4 mb-1">
                          {metadata.internalLists.map((list, index) => (
                            <div
                              key={index}
                              className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 bg-surface-muted"
                            >
                              <div className={infoGroupClass}>
                                <label className={labelClass}>Email</label>
                                <p className={valueClass}>{list.email}</p>
                              </div>
                              <div className={infoGroupClass}>
                                <label className={labelClass}>Type</label>
                                <p className={valueClass}>{list.type}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                  {/* Authentication Metadata */}
                  {metadata.auth_metadata && (
                    <>
                      <div className="pt-2 border-t border-line">
                        <h3 className="text-base font-semibold text-body">
                          Authentication
                        </h3>
                      </div>
                      <div className={cardRowClass}>
                        <div className={infoGroupClass}>
                          <label className={labelClass}>Auth Name</label>
                          <p className={valueClass}>
                            {metadata.auth_metadata.auth_name || (
                              <span className={noDataClass}>Not provided</span>
                            )}
                          </p>
                        </div>
                        <div className={infoGroupClass}>
                          <label className={labelClass}>Auth URL</label>
                          <p className={valueClass}>
                            {metadata.auth_metadata.auth_url ? (
                              <a
                                href={metadata.auth_metadata.auth_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={linkClass}
                              >
                                {metadata.auth_metadata.auth_url}
                              </a>
                            ) : (
                              <span className={noDataClass}>Not provided</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className={cardClass}>
                  <p className={noDataClass}>
                    No infrastructure metadata available
                  </p>
                </div>
              )}
            </div>

            {/* Additional Information */}
            <div className="mb-5">
              <div className="mb-1">
                <h2 className="text-lg font-semibold text-foreground">
                  Additional Information
                </h2>
              </div>
              <div className={cardClass}>
                <div className={cardRowClass}>
                  <div className={infoGroupClass}>
                    <label className={labelClass}>Created</label>
                    <p className={valueClass}>
                      {formatDate(tenantData.info.created_at || '')}
                    </p>
                  </div>
                  <div className={infoGroupClass}>
                    <label className={labelClass}>Updated</label>
                    <p className={valueClass}>
                      {formatDate(tenantData.info.updated_at || '')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'reports' && <TenantReports tenantId={id || ''} />}
      </div>
    </div>
  )
}

export default TenantDetails
