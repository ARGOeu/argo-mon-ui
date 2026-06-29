import { useState } from 'react'
import { useSelectedTenant } from '@/contexts/selected-tenant'
import { useAuth } from '@/auth/useAuth'
import { useParams } from 'react-router-dom'
import ErrorDisplay from '@/components/ErrorDisplay'
import PageHeader from '@/components/PageHeader'
import Tabs from '@/components/Tabs'
import TenantInvitations from './TenantInvitations'
import MembersTab from './MembersTab'
import InviteTab from './InviteTab'
import AddDirectTab from './AddDirectTab'

const ManageTenantMembers = () => {
  const { id: tenantId } = useParams<{ id: string }>()
  const { isSuperAdmin } = useAuth()
  const { tenant: tenantData, tenantError } = useSelectedTenant()

  const [activeTab, setActiveTab] = useState<
    'members' | 'invite' | 'add-direct' | 'invitations'
  >('members')

  return (
    <div className="page-container">
      <PageHeader
        title="Manage Members"
        subtitle={
          <>
            View members and send invitations for tenant
            <strong className="break-all">
              {tenantData?.info.name ? ` ${tenantData.info.name}` : '...'}
            </strong>
          </>
        }
        className="mb-2 pb-2"
      />

      {tenantError ? (
        <ErrorDisplay error={tenantError} context="tenant" />
      ) : (
        <>
          <Tabs
            tabs={[
              { id: 'members', label: 'Members' },
              { id: 'invite', label: 'Invite Member' },
              ...(isSuperAdmin
                ? [{ id: 'add-direct', label: 'Add Member' }]
                : []),
              { id: 'invitations', label: 'Invitations' },
            ]}
            activeTab={activeTab}
            onChange={(id) =>
              setActiveTab(
                id as 'members' | 'invite' | 'add-direct' | 'invitations',
              )
            }
            className="mb-4"
          />

          {activeTab === 'members' && (
            <MembersTab
              tenantId={tenantId || ''}
              tenantName={tenantData?.info.name || ''}
            />
          )}

          {activeTab === 'invite' && <InviteTab tenantId={tenantId || ''} />}

          {activeTab === 'add-direct' && isSuperAdmin && (
            <AddDirectTab tenantId={tenantId || ''} />
          )}

          {activeTab === 'invitations' && (
            <div className="animate-fade-in">
              <TenantInvitations
                tenantId={tenantId || ''}
                tenantName={tenantData?.info.name || ''}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ManageTenantMembers
