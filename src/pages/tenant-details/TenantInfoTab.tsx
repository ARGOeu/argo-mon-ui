import { useEffect } from 'react'
import {
  useGetUserTenantById,
  useGetUserTenantProjects,
} from '@/hooks/useTenants'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'

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
  'text-brand no-underline transition-colors hover:text-brand-strong hover:underline'

const noDataClass = 'text-sm text-subtle italic'

interface TenantInfoTabProps {
  tenantId: string
}

const TenantInfoTab = ({ tenantId }: TenantInfoTabProps) => {
  const { data: tenantData, isLoading, error } = useGetUserTenantById(tenantId)

  const {
    data: projectsData,
    isLoading: projectsLoading,
    fetchNextPage: fetchNextProjectsPage,
    hasNextPage: hasNextProjectsPage,
  } = useGetUserTenantProjects(tenantId, true)

  useEffect(() => {
    if (hasNextProjectsPage) {
      fetchNextProjectsPage()
    }
  }, [projectsData, hasNextProjectsPage, fetchNextProjectsPage])

  if (isLoading)
    return (
      <div className="loading-container">
        <LoadingSpinner size="sm" />
      </div>
    )

  if (error) return <ErrorDisplay error={error} context="tenant info" />

  if (!tenantData) return null

  const { contacts, metadata } = tenantData
  const projects =
    projectsData?.pages?.flatMap((page) => page.content || []) || []

  return (
    <>
      {/* Projects */}
      <div className="mb-5">
        <div className="mb-1">
          <h2 className="text-lg font-semibold text-foreground">Projects</h2>
        </div>
        {projectsLoading ? (
          <div className={`${cardClass} items-center max-w-[180px]`}>
            <LoadingSpinner size="xs" inline />
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
          <h2 className="text-lg font-semibold text-foreground">Contacts</h2>
        </div>
        {contacts && contacts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
            {contacts.map((contact, index) => (
              <div key={index} className={cardClass}>
                <div className="flex flex-col gap-1">
                  <p className="text-base font-semibold text-foreground m-0">
                    {contact.name}
                  </p>
                  <p className="text-sm text-muted m-0">{contact.email}</p>
                  {contact.type && (
                    <span className="inline-block mt-1 px-2.5 py-1 bg-brand-muted text-brand-strong text-xs font-medium rounded-full w-fit">
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
                            <span className={noDataClass}>Not provided</span>
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
                            <span className={noDataClass}>Not provided</span>
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
                            <span className={noDataClass}>Not provided</span>
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
            <p className={noDataClass}>No infrastructure metadata available</p>
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
  )
}

export default TenantInfoTab
