import { useEffect, useRef, useState } from 'react'
import {
  ArrowUpRightFromSquare,
  Layers,
  ChartNetwork,
  Check,
  ClipboardList,
  Copy,
  Globe,
  Mail,
  Mails,
  Server,
} from 'lucide-react'
import {
  useGetUserTenantProjects,
  useGetTopologyFeedQuery,
} from '@/hooks/useTenants'
import { useSelectedTenant } from '@/contexts/selected-tenant'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import { TOPOLOGY_FEED_TYPE_LABELS } from '@/utils/topologyFeedTypes'

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const URL_MAX_CHARS = 60

const truncateUrl = (url: string): string => {
  if (url.length <= URL_MAX_CHARS) return url
  const start = Math.ceil(URL_MAX_CHARS * 0.6)
  const end = URL_MAX_CHARS - start
  return `${url.slice(0, start)}…${url.slice(-end)}`
}

const cardClass = 'bg-surface-strong rounded-lg py-2 px-4 flex flex-col gap-2'

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
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    tenant: tenantData,
    isTenantLoading,
    tenantError,
  } = useSelectedTenant()

  const {
    data: projectsData,
    isLoading: projectsLoading,
    fetchNextPage: fetchNextProjectsPage,
    hasNextPage: hasNextProjectsPage,
  } = useGetUserTenantProjects(tenantId, true)

  const { data: topologyFeedData, isLoading: topologyFeedLoading } =
    useGetTopologyFeedQuery(tenantId, !!tenantId)

  useEffect(() => {
    if (hasNextProjectsPage) {
      fetchNextProjectsPage()
    }
  }, [projectsData, hasNextProjectsPage, fetchNextProjectsPage])

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    }
  }, [])

  const handleCopyEmail = (email: string) => {
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    void navigator.clipboard?.writeText(email)
    setCopiedEmail(email)
    copyTimerRef.current = setTimeout(() => setCopiedEmail(null), 1500)
  }

  if (isTenantLoading)
    return (
      <div className="loading-container">
        <LoadingSpinner size="sm" />
      </div>
    )

  if (tenantError)
    return <ErrorDisplay error={tenantError} context="tenant info" />

  if (!tenantData) return null

  const { contacts, metadata } = tenantData
  const projects =
    projectsData?.pages?.flatMap((page) => page.content || []) || []

  return (
    <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] items-start gap-x-20 py-1 mb-12">
      {/* Left column */}
      <div className="flex flex-col gap-6">
        {/* Description */}
        <div>
          {tenantData.info.description ? (
            <p
              className="text-sm text-body leading-relaxed m-0 line-clamp-15 lg:line-clamp-10"
              title={tenantData.info.description}
            >
              {tenantData.info.description}
            </p>
          ) : (
            <p className={noDataClass}>No description provided</p>
          )}
        </div>

        {/* Projects */}
        {!projectsLoading && projects.length > 0 && (
          <div>
            <div className="mb-1">
              <h2 className="text-md font-semibold text-foreground flex items-center gap-1.5">
                <Layers className="size-4" />
                Projects
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
              {projects.map((project) => (
                <div key={project.id} className={cardClass}>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-foreground m-0">
                      {project.name}
                    </p>
                    {project.description && (
                      <p
                        className="text-sm text-muted m-0 line-clamp-4"
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
          </div>
        )}

        {/* Infrastructure Metadata */}
        {(metadata?.instance?.ui_url || metadata?.instance?.poem_url) && (
          <div>
            <div className="mb-1">
              <h2 className="text-md font-semibold text-foreground flex items-center gap-1.5">
                <Server className="size-4" />
                Infrastructure Metadata
              </h2>
            </div>
            <div className="bg-surface-strong rounded-lg py-2 px-4 flex flex-col gap-4 w-fit">
              <div className="flex flex-wrap gap-x-8 gap-y-3">
                {metadata.instance?.ui_url && (
                  <div className={`${infoGroupClass} min-w-0`}>
                    <label className={`${labelClass} flex items-center gap-1`}>
                      <Globe className="size-3.5" />
                      UI URL
                    </label>
                    <p className={valueClass}>
                      <a
                        href={metadata.instance.ui_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={metadata.instance.ui_url}
                        className={`${linkClass} inline-flex items-center gap-0.5`}
                      >
                        {truncateUrl(metadata.instance.ui_url)}
                        <ArrowUpRightFromSquare className="size-3 flex-shrink-0" />
                      </a>
                    </p>
                  </div>
                )}
                {metadata.instance?.poem_url && (
                  <div className={`${infoGroupClass} min-w-0`}>
                    <label className={`${labelClass} flex items-center gap-1`}>
                      <ClipboardList className="size-3.5" />
                      POEM URL
                    </label>
                    <p className={valueClass}>
                      <a
                        href={metadata.instance.poem_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={metadata.instance.poem_url}
                        className={`${linkClass} inline-flex items-center gap-0.5`}
                      >
                        {truncateUrl(metadata.instance.poem_url)}
                        <ArrowUpRightFromSquare className="size-3 flex-shrink-0" />
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Internal Lists */}
        {!!metadata?.internalLists?.length && (
          <div>
            <div className="mb-1">
              <h2 className="text-md font-semibold text-foreground flex items-center gap-1.5">
                <Mails className="size-4" />
                Internal Lists
              </h2>
            </div>
            <div className={`${cardClass} w-fit`}>
              {metadata.internalLists.map((list, index) => (
                <div key={index} className="flex flex-wrap gap-x-8 gap-y-3">
                  <div className={infoGroupClass}>
                    <label className={labelClass}>Email</label>
                    <p className={valueClass}>{list.email}</p>
                  </div>
                  <div className={infoGroupClass}>
                    <label className={labelClass}>Type</label>
                    <p className={`${valueClass} lowercase`}>{list.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Topology Feed */}
        {!topologyFeedLoading && topologyFeedData && (
          <div>
            <div className="mb-1">
              <h2 className="text-md font-semibold text-foreground flex items-center gap-1.5">
                <ChartNetwork className="size-4" />
                Topology Feed
              </h2>
            </div>
            <div className={`${cardClass} w-fit`}>
              <div className="flex flex-wrap gap-x-8 gap-y-3">
                <div className={infoGroupClass}>
                  <label className={labelClass}>Type</label>
                  <p className={valueClass}>
                    {TOPOLOGY_FEED_TYPE_LABELS[topologyFeedData!.type] ??
                      topologyFeedData!.type}
                  </p>
                </div>

                {(topologyFeedData!.type === 'CSV' ||
                  topologyFeedData!.type === 'desy-marketplace') && (
                  <div className={infoGroupClass}>
                    <label className={labelClass}>Feed URL</label>
                    <p className={valueClass}>
                      {topologyFeedData!.feed_url ? (
                        <a
                          href={topologyFeedData!.feed_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={topologyFeedData!.feed_url}
                          className={`${linkClass} inline-flex items-center gap-0.5`}
                        >
                          {truncateUrl(topologyFeedData!.feed_url)}
                          <ArrowUpRightFromSquare className="size-3 flex-shrink-0" />
                        </a>
                      ) : (
                        <span className={noDataClass}>Not provided</span>
                      )}
                    </p>
                  </div>
                )}

                {topologyFeedData!.type === 'eosc-service-catalog' && (
                  <>
                    <div className={infoGroupClass}>
                      <label className={labelClass}>Service Groups URL</label>
                      <p className={valueClass}>
                        {topologyFeedData!.feed_service_groups ? (
                          <a
                            href={topologyFeedData!.feed_service_groups}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={topologyFeedData!.feed_service_groups}
                            className={`${linkClass} inline-flex items-center gap-0.5`}
                          >
                            {truncateUrl(topologyFeedData!.feed_service_groups)}
                            <ArrowUpRightFromSquare className="size-3 flex-shrink-0" />
                          </a>
                        ) : (
                          <span className={noDataClass}>Not provided</span>
                        )}
                      </p>
                    </div>
                    <div className={infoGroupClass}>
                      <label className={labelClass}>
                        Service Endpoints URL
                      </label>
                      <p className={valueClass}>
                        {topologyFeedData!.feed_service_endpoints ? (
                          <a
                            href={topologyFeedData!.feed_service_endpoints}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={topologyFeedData!.feed_service_endpoints}
                            className={`${linkClass} inline-flex items-center gap-0.5`}
                          >
                            {truncateUrl(
                              topologyFeedData!.feed_service_endpoints,
                            )}
                            <ArrowUpRightFromSquare className="size-3 flex-shrink-0" />
                          </a>
                        ) : (
                          <span className={noDataClass}>Not provided</span>
                        )}
                      </p>
                    </div>
                    <div className={infoGroupClass}>
                      <label className={labelClass}>
                        Service Endpoint Extensions URL
                      </label>
                      <p className={valueClass}>
                        {topologyFeedData!.feed_service_endpoints_extensions ? (
                          <a
                            href={
                              topologyFeedData!
                                .feed_service_endpoints_extensions
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            title={
                              topologyFeedData!
                                .feed_service_endpoints_extensions
                            }
                            className={`${linkClass} inline-flex items-center gap-0.5`}
                          >
                            {truncateUrl(
                              topologyFeedData!
                                .feed_service_endpoints_extensions,
                            )}
                            <ArrowUpRightFromSquare className="size-3 flex-shrink-0" />
                          </a>
                        ) : (
                          <span className={noDataClass}>Not provided</span>
                        )}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right column — Contacts */}
      <div className={`${cardClass} self-start mt-4 md:mt-0`}>
        <div className="flex flex-col gap-0.5">
          <p className={labelClass}>Organisation</p>
          {tenantData.info.email ? (
            <p className="text-xs text-muted m-0 flex items-center gap-1.5">
              <Mail className="size-3 flex-shrink-0" />
              <span className="break-all">{tenantData.info.email}</span>
              <button
                type="button"
                onClick={() => handleCopyEmail(tenantData.info.email)}
                className={`flex-shrink-0 rounded p-0.5 transition-colors ${copiedEmail === tenantData.info.email ? 'bg-emerald-100 text-emerald-700' : 'text-subtle hover:bg-surface-strong hover:text-body'}`}
                aria-label={
                  copiedEmail === tenantData.info.email
                    ? 'Copied'
                    : 'Copy email'
                }
                title={
                  copiedEmail === tenantData.info.email
                    ? 'Copied!'
                    : 'Copy email'
                }
              >
                {copiedEmail === tenantData.info.email ? (
                  <Check className="size-3" strokeWidth={2.5} />
                ) : (
                  <Copy className="size-3" strokeWidth={2} />
                )}
              </button>
            </p>
          ) : (
            <p className="text-xs text-subtle italic m-0">Not provided</p>
          )}
        </div>

        {contacts && contacts.length > 0 && (
          <div className="overflow-hidden border-t border-line pt-2">
            <div className="flex items-start flex-wrap gap-y-3 -ml-[13px]">
              {contacts.map((contact, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-0.5 min-w-0 border-l border-line-strong ps-3 pe-1"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <p className="text-sm text-foreground m-0 truncate">
                      {contact.name}
                    </p>
                    {contact.type && (
                      <span className="flex-shrink-0 px-1.5 py-0.5 bg-brand-muted text-brand-strong text-[11px] font-medium rounded-full lowercase">
                        {contact.type}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted m-0 flex items-center gap-1.5">
                    <Mail className="size-3 flex-shrink-0" />
                    <span className="break-all">{contact.email}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyEmail(contact.email)}
                      className={`flex-shrink-0 rounded p-0.5 transition-colors ${copiedEmail === contact.email ? 'bg-emerald-100 text-emerald-700' : 'text-subtle hover:bg-surface-strong hover:text-body'}`}
                      aria-label={
                        copiedEmail === contact.email ? 'Copied' : 'Copy email'
                      }
                      title={
                        copiedEmail === contact.email ? 'Copied!' : 'Copy email'
                      }
                    >
                      {copiedEmail === contact.email ? (
                        <Check className="size-3" strokeWidth={2.5} />
                      ) : (
                        <Copy className="size-3" strokeWidth={2} />
                      )}
                    </button>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TenantInfoTab
