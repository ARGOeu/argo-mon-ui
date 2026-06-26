import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useSelectedTenant } from '@/contexts/selected-tenant'
import PageHeader from '@/components/PageHeader'
import Tabs from '@/components/Tabs'
import TopologyEndpoints from './TopologyEndpoints'
import TopologyGroups from './TopologyGroups'
import TopologyDocumentation from './TopologyDocumentation'
import TopologyFeed from './TopologyFeed'
import CreateTopologyEndpoint from './CreateTopologyEndpoint'
import CreateTopologyGroup from './CreateTopologyGroup'
import type { EndpointTopologyItem, GroupTopologyItem } from '@/types/topology'

const tabs = [
  { id: 'endpoints', label: 'Endpoints' },
  { id: 'groups', label: 'Groups' },
  { id: 'feed-configuration', label: 'Feed configuration' },
  { id: 'documentation', label: 'Documentation' },
]

const TenantTopology = () => {
  const { id } = useParams<{ id: string }>()
  const tenantId = id ?? ''

  const {
    tenant: tenantData,
    topologyFeedType,
    topologyFeedError,
    isTopologyFeedLoading,
  } = useSelectedTenant()

  const location = useLocation()
  const [activeTab, setActiveTab] = useState<
    'endpoints' | 'groups' | 'feed-configuration' | 'documentation'
  >('endpoints')

  useEffect(() => {
    const hash = location.hash
    if (hash.startsWith('#groups')) {
      setActiveTab('groups')
    } else if (hash.startsWith('#feed-configuration')) {
      setActiveTab('feed-configuration')
    } else if (hash.startsWith('#documentation')) {
      setActiveTab('documentation')
    } else {
      setActiveTab('endpoints')
    }
  }, [location.hash])

  const initialRedirectDone = useRef(false)

  useEffect(() => {
    initialRedirectDone.current = false
  }, [tenantId])

  useEffect(() => {
    if (initialRedirectDone.current || isTopologyFeedLoading || location.hash) {
      return
    }

    const feedStatus = (
      topologyFeedError as (Error & { status?: number }) | null
    )?.status
    const isFeedClientError =
      feedStatus !== undefined && feedStatus >= 400 && feedStatus < 500

    if (!topologyFeedType && (!topologyFeedError || isFeedClientError)) {
      setActiveTab('feed-configuration')
    }
    initialRedirectDone.current = true
  }, [
    topologyFeedType,
    topologyFeedError,
    isTopologyFeedLoading,
    location.hash,
  ])

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
          setActiveTab(
            id as
              | 'endpoints'
              | 'groups'
              | 'feed-configuration'
              | 'documentation',
          )
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

      <div className={activeTab === 'feed-configuration' ? 'block' : 'hidden'}>
        <TopologyFeed tenantId={tenantId} />
      </div>

      <div className={activeTab === 'documentation' ? 'block' : 'hidden'}>
        <TopologyDocumentation />
      </div>
    </div>
  )
}

export default TenantTopology
