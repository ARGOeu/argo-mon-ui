import { useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useGetUserTenantById } from '@/hooks/useTenants'
import PageHeader from '@/components/PageHeader'
import Tabs from '@/components/Tabs'
import TopologyEndpoints from './TopologyEndpoints'
import TopologyGroups from './TopologyGroups'
import CreateTopologyEndpoint from './CreateTopologyEndpoint'
import CreateTopologyGroup from './CreateTopologyGroup'
import type { EndpointTopologyItem, GroupTopologyItem } from '@/types/topology'

const tabs = [
  { id: 'endpoints', label: 'Endpoints' },
  { id: 'groups', label: 'Groups' },
]

const TenantTopology = () => {
  const { id } = useParams<{ id: string }>()
  const tenantId = id ?? ''

  const { data: tenantData } = useGetUserTenantById(tenantId)

  const location = useLocation()
  const [activeTab, setActiveTab] = useState<'endpoints' | 'groups'>(
    'endpoints',
  )

  useEffect(() => {
    const hash = location.hash
    if (hash.startsWith('#groups')) {
      setActiveTab('groups')
    } else {
      setActiveTab('endpoints')
    }
  }, [location.hash])

  const [editingEndpoint, setEditingEndpoint] =
    useState<EndpointTopologyItem | null>(null)
  const [editingGroup, setEditingGroup] = useState<GroupTopologyItem | null>(
    null,
  )

  if (editingEndpoint) {
    return (
      <CreateTopologyEndpoint
        tenantId={tenantId}
        editingEndpoint={editingEndpoint}
        onClose={() => setEditingEndpoint(null)}
      />
    )
  }

  if (editingGroup) {
    return (
      <CreateTopologyGroup
        tenantId={tenantId}
        editingGroup={editingGroup}
        onClose={() => setEditingGroup(null)}
      />
    )
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Topology"
        subtitle={
          <>
            Manage topology for tenant{' '}
            <strong>{tenantData?.info.name ?? '...'}</strong>
          </>
        }
        className="pb-1 mb-2"
      />

      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(id) => {
          setActiveTab(id as 'endpoints' | 'groups')
          window.location.hash = id
        }}
        className="mb-4"
      />

      {activeTab === 'endpoints' && (
        <TopologyEndpoints tenantId={tenantId} onEdit={setEditingEndpoint} />
      )}
      {activeTab === 'groups' && (
        <TopologyGroups tenantId={tenantId} onEdit={setEditingGroup} />
      )}
    </div>
  )
}

export default TenantTopology
