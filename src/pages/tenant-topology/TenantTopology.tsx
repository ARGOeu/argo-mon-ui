import { useParams } from 'react-router-dom'
import { useGetUserTenantById } from '@/hooks/useTenants'
import { useGetTopologyEndpoints } from '@/hooks/useTopology'
import PageHeader from '@/components/PageHeader'
import Button from '@/components/Button'
import DataTable, { thBase, tdBase } from '@/components/DataTable'
import Badge from '@/components/Badge'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'

const TenantTopology = () => {
  const { id } = useParams<{ id: string }>()
  const tenantId = id ?? ''

  const { data: tenantData } = useGetUserTenantById(tenantId)
  const {
    data: endpoints,
    isLoading,
    error,
  } = useGetTopologyEndpoints(tenantId)

  return (
    <div className="page-container">
      <PageHeader
        title="Topology Endpoints"
        subtitle={
          <>
            Manage topology endpoints for tenant{' '}
            <strong>{tenantData?.info.name ?? '...'}</strong>
          </>
        }
        className="pb-2 mb-4"
      >
        <Button
          variant="primary"
          size="md"
          href={`/tenants/${tenantId}/topology/create`}
        >
          Create Topology Endpoint
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="loading-container">
          <LoadingSpinner size="md" />
        </div>
      ) : error ? (
        <ErrorDisplay error={error} context="topology endpoints" />
      ) : !endpoints?.length ? (
        <div className="text-center p-8 bg-surface-muted rounded-lg border border-line">
          <p className="text-muted text-lg">No topology endpoints found</p>
        </div>
      ) : (
        <DataTable>
          <thead className="bg-surface-strong border-b border-line">
            <tr>
              <th className={`${thBase} min-w-28`}>Service</th>
              <th className={`${thBase} min-w-40`}>URL</th>
              <th className={`${thBase} min-w-24`}>Group</th>
              <th className={`${thBase} min-w-20`}>Type</th>
              <th className={`${thBase} min-w-24`}>Monitored</th>
              <th className={`${thBase} min-w-28`}>Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {endpoints.map((endpoint, index) => (
              <tr
                key={endpoint.id ?? index}
                className="hover:bg-surface-muted transition-colors"
              >
                <td className={tdBase}>{endpoint.service}</td>
                <td className={`${tdBase} font-mono text-xs break-all`}>
                  {endpoint.hostname}
                </td>
                <td className={tdBase}>{endpoint.group}</td>
                <td className={tdBase}>{endpoint.type}</td>
                <td className={tdBase}>
                  {endpoint.tags?.monitored !== undefined ? (
                    <Badge
                      size="sm"
                      className={
                        endpoint.tags.monitored === '1'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-surface-strong text-muted'
                      }
                    >
                      {endpoint.tags.monitored === '1'
                        ? 'Monitored'
                        : 'Not Monitored'}
                    </Badge>
                  ) : null}
                </td>
                <td className={tdBase}>{endpoint.date}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}
    </div>
  )
}

export default TenantTopology
