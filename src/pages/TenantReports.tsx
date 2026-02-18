import { useState, useEffect } from 'react'
import { useGetTenantReports, useGetTenantReportById } from '@/hooks/useTenants'
import LoadingSpinner from '@/components/LoadingSpinner'
import MetricProfileItem from '@/components/MetricProfileItem'
import styles from './TenantReports.module.css'

const TenantReports = ({ tenantId }: { tenantId: string }) => {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [expandedServices, setExpandedServices] = useState<
    Record<string, Set<string>>
  >({})

  const { data: reportsData, isLoading: reportsLoading } = useGetTenantReports(
    tenantId,
    undefined,
    true,
  )

  const { data: reportDetail, isLoading: reportDetailLoading } =
    useGetTenantReportById(tenantId, selectedReportId || '', !!selectedReportId)

  // Auto-select first report when reports data loads
  useEffect(() => {
    if (reportsData && reportsData.length > 0 && !selectedReportId) {
      setSelectedReportId(reportsData[0].id)
    }
  }, [reportsData, selectedReportId])

  const toggleService = (profileId: string, serviceName: string) => {
    setExpandedServices((prev) => {
      const profileServices = prev[profileId] || new Set()
      const newServices = new Set(profileServices)
      if (newServices.has(serviceName)) {
        newServices.delete(serviceName)
      } else {
        newServices.add(serviceName)
      }
      return { ...prev, [profileId]: newServices }
    })
  }

  const toggleAllServices = (
    profileId: string,
    allServices: string[],
    expand: boolean,
  ) => {
    setExpandedServices((prev) => ({
      ...prev,
      [profileId]: expand ? new Set(allServices) : new Set(),
    }))
  }

  return (
    <div className={styles['reports-container']}>
      <div className={styles['reports-sidebar']}>
        <h3 className={styles['sidebar-title']}>Available Reports</h3>
        {reportsLoading ? (
          <div className={styles['sidebar-loading']}>
            <LoadingSpinner size="sm" />
          </div>
        ) : reportsData && reportsData.length > 0 ? (
          <ul className={styles['reports-list']}>
            {reportsData.map((report) => (
              <li
                key={report.id}
                className={`${styles['report-item']} ${selectedReportId === report.id ? styles['report-item-active'] : ''}`}
                onClick={() => setSelectedReportId(report.id)}
              >
                <div className={styles['report-item-header']}>
                  <span className={styles['report-name']}>{report.name}</span>
                  {report.disabled ? (
                    <span className={styles['status-disabled']}>Inactive</span>
                  ) : (
                    <span className={styles['status-enabled']}>Active</span>
                  )}
                </div>
                {report.description && (
                  <p className={styles['report-item-description']}>
                    {report.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles['no-data']}>No reports available</p>
        )}
      </div>

      <div className={styles['reports-content']}>
        {reportDetailLoading ? (
          <div className="loading-container">
            <LoadingSpinner />
          </div>
        ) : reportDetail ? (
          <>
            {/* Info Header */}
            <div className={styles['report-info-header']}>
              <h1 className={styles['report-main-title']}>
                {reportDetail.info.name}
              </h1>
              <p className={styles['report-subtitle']}>
                {reportDetail.info.description || (
                  <span className={styles['no-data']}>
                    No description available
                  </span>
                )}
              </p>
              <div className={styles['report-meta-row']}>
                <div className={styles['meta-item']}>
                  <span className={styles['meta-label']}>Status:</span>
                  {reportDetail.disabled ? (
                    <span className={styles['status-disabled']}>Inactive</span>
                  ) : (
                    <span className={styles['status-enabled']}>Active</span>
                  )}
                </div>
                <div className={styles['meta-item']}>
                  <span className={styles['meta-label']}>Report ID:</span>
                  <span className={styles['meta-value']}>
                    {reportDetail.id}
                  </span>
                </div>
                <div className={styles['meta-item']}>
                  <span className={styles['meta-label']}>Created:</span>
                  <span className={styles['meta-value']}>
                    {new Date(reportDetail.info.created).toLocaleString(
                      'en-GB',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      },
                    )}
                  </span>
                </div>
                <div className={styles['meta-item']}>
                  <span className={styles['meta-label']}>Last Updated:</span>
                  <span className={styles['meta-value']}>
                    {new Date(reportDetail.info.updated).toLocaleString(
                      'en-GB',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      },
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Metric Profile */}
            {reportDetail.profiles &&
              reportDetail.profiles.filter((p) => p.type === 'metric').length >
                0 && (
                <div className={styles.section}>
                  <div className={styles['section-header']}>
                    <h2 className={styles['section-title']}>Metric Profile</h2>
                  </div>
                  <div className={styles['metric-profiles-container']}>
                    {reportDetail.profiles
                      .filter((p) => p.type === 'metric')
                      .map((profile) => (
                        <MetricProfileItem
                          key={profile.id}
                          tenantId={tenantId}
                          profile={profile}
                          expandedServices={
                            expandedServices[profile.id] || new Set()
                          }
                          onToggleService={(serviceName) =>
                            toggleService(profile.id, serviceName)
                          }
                          onToggleAll={(allServices, expand) =>
                            toggleAllServices(profile.id, allServices, expand)
                          }
                        />
                      ))}
                  </div>
                </div>
              )}

            {/* Profiles - Aggregation & Operations */}
            {reportDetail.profiles &&
              (reportDetail.profiles.filter((p) => p.type === 'aggregation')
                .length > 0 ||
                reportDetail.profiles.filter((p) => p.type === 'operations')
                  .length > 0) && (
                <div className={styles.section}>
                  <div className={styles['section-header']}>
                    <h2 className={styles['section-title']}>Profiles</h2>
                  </div>
                  <div className={`${styles.card} ${styles['profiles-card']}`}>
                    <div className={styles['profiles-two-column']}>
                      {/* Aggregation Profiles */}
                      {reportDetail.profiles.filter(
                        (p) => p.type === 'aggregation',
                      ).length > 0 && (
                        <div>
                          <div className={styles['profiles-grid-simple']}>
                            {reportDetail.profiles
                              .filter((p) => p.type === 'aggregation')
                              .map((profile) => (
                                <div
                                  key={profile.id}
                                  className={styles['profile-simple-item']}
                                >
                                  <span
                                    className={styles['profile-simple-name']}
                                  >
                                    {profile.name}
                                  </span>
                                  <span
                                    className={`${styles['profile-type-badge-simple']} ${styles['badge-aggregation']}`}
                                  >
                                    Aggregation
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Operations Profiles */}
                      {reportDetail.profiles.filter(
                        (p) => p.type === 'operations',
                      ).length > 0 && (
                        <div>
                          <div className={styles['profiles-grid-simple']}>
                            {reportDetail.profiles
                              .filter((p) => p.type === 'operations')
                              .map((profile) => (
                                <div
                                  key={profile.id}
                                  className={styles['profile-simple-item']}
                                >
                                  <span
                                    className={styles['profile-simple-name']}
                                  >
                                    {profile.name}
                                  </span>
                                  <span
                                    className={`${styles['profile-type-badge-simple']} ${styles['badge-operations']}`}
                                  >
                                    Operations
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            {/* Topology Schema */}
            <div className={styles.section}>
              <div className={styles['section-header']}>
                <h2 className={styles['section-title']}>Topology Schema</h2>
              </div>
              <div className={`${styles.card} ${styles['topology-card']}`}>
                <div className={styles['topology-tree']}>
                  <div className={styles['topology-node']}>
                    <div className={styles['topology-node-icon']}>●</div>
                    <div className={styles['topology-node-content']}>
                      <span className={styles['topology-node-label']}>
                        Group
                      </span>
                      <span className={styles['topology-node-value']}>
                        {reportDetail.topology_schema.group.type}
                      </span>
                    </div>
                  </div>
                  {reportDetail.topology_schema.group.group && (
                    <div className={styles['topology-node-child']}>
                      <div className={styles['topology-connector']}></div>
                      <div className={styles['topology-node']}>
                        <div className={styles['topology-node-icon']}>●</div>
                        <div className={styles['topology-node-content']}>
                          <span className={styles['topology-node-label']}>
                            Subgroup
                          </span>
                          <span className={styles['topology-node-value']}>
                            {reportDetail.topology_schema.group.group.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Computations */}
            <div className={styles.section}>
              <div className={styles['section-header']}>
                <h2 className={styles['section-title']}>Computations</h2>
              </div>
              <div className={`${styles.card} ${styles['computations-card']}`}>
                <div className={styles['computations-grid']}>
                  {/* AR Computation */}
                  <div className={styles['computation-item']}>
                    <span className={styles['computation-title']}>
                      Availability & Reliability
                    </span>
                    {reportDetail.computations.ar ? (
                      <span className={styles['status-enabled']}>Enabled</span>
                    ) : (
                      <span className={styles['status-disabled']}>
                        Disabled
                      </span>
                    )}
                  </div>

                  {/* Status Computation */}
                  <div className={styles['computation-item']}>
                    <span className={styles['computation-title']}>Status</span>
                    {reportDetail.computations.status ? (
                      <span className={styles['status-enabled']}>Enabled</span>
                    ) : (
                      <span className={styles['status-disabled']}>
                        Disabled
                      </span>
                    )}
                  </div>

                  {/* Trends */}
                  {reportDetail.computations.trends &&
                    reportDetail.computations.trends.map((trend) => (
                      <div key={trend} className={styles['computation-item']}>
                        <span className={styles['computation-title']}>
                          {trend.charAt(0).toUpperCase() + trend.slice(1)}
                        </span>
                        <span className={styles['status-enabled']}>
                          Enabled
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Thresholds */}
            <div className={styles.section}>
              <div className={styles['section-header']}>
                <h2 className={styles['section-title']}>Thresholds</h2>
              </div>
              <div className={`${styles.card} ${styles['thresholds-card']}`}>
                <div className={styles['thresholds-grid']}>
                  <div className={styles['threshold-item']}>
                    <span className={styles['threshold-title']}>
                      Availability
                    </span>
                    <span className={styles['threshold-value']}>
                      {reportDetail.thresholds.availability}%
                    </span>
                  </div>
                  <div className={styles['threshold-item']}>
                    <span className={styles['threshold-title']}>
                      Reliability
                    </span>
                    <span className={styles['threshold-value']}>
                      {reportDetail.thresholds.reliability}%
                    </span>
                  </div>
                  <div className={styles['threshold-item']}>
                    <span className={styles['threshold-title']}>Uptime</span>
                    <span className={styles['threshold-value']}>
                      {reportDetail.thresholds.uptime}
                    </span>
                  </div>
                  <div className={styles['threshold-item']}>
                    <span className={styles['threshold-title']}>Unknown</span>
                    <span className={styles['threshold-value']}>
                      {reportDetail.thresholds.unknown}
                    </span>
                  </div>
                  <div className={styles['threshold-item']}>
                    <span className={styles['threshold-title']}>Downtime</span>
                    <span className={styles['threshold-value']}>
                      {reportDetail.thresholds.downtime}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className={styles.card}>
            <p className={styles['no-data']}>
              {selectedReportId
                ? 'Select a report from the list'
                : 'No report selected'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TenantReports
