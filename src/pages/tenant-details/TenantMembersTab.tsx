import { useState } from 'react'
import { useSelectedTenant } from '@/contexts/selected-tenant'
import { useAuth } from '@/auth/useAuth'
import ErrorDisplay from '@/components/ErrorDisplay'
import Tabs from '@/components/Tabs'
import TenantInvitations from '../manage-tenant-members/TenantInvitations'
import MembersTab from '../manage-tenant-members/MembersTab'
import InviteTab from '../manage-tenant-members/InviteTab'
import AddDirectTab from '../manage-tenant-members/AddDirectTab'

interface TenantMembersTabProps {
  tenantId: string
}

const TenantMembersTab = ({ tenantId }: TenantMembersTabProps) => {
  const { isSuperAdmin } = useAuth()
  const { tenant: tenantData, tenantError } = useSelectedTenant()

  const [activeTab, setActiveTab] = useState<
    'members' | 'invite' | 'add-direct' | 'invitations'
  >('members')

  return tenantError ? (
    <ErrorDisplay error={tenantError} context="tenant" />
  ) : (
    <div className="bg-surface-muted border border-line rounded-lg px-4 py-3">
      <Tabs
        tabs={[
          { id: 'members', label: 'Members' },
          { id: 'invite', label: 'Invite Member' },
          ...(isSuperAdmin ? [{ id: 'add-direct', label: 'Add Member' }] : []),
          { id: 'invitations', label: 'Invitations' },
        ]}
        activeTab={activeTab}
        onChange={(id) =>
          setActiveTab(
            id as 'members' | 'invite' | 'add-direct' | 'invitations',
          )
        }
        className="mb-2"
      />

      {activeTab === 'members' && (
        <MembersTab
          tenantId={tenantId}
          tenantName={tenantData?.info.name || ''}
        />
      )}

      {activeTab === 'invite' && <InviteTab tenantId={tenantId} />}

      {activeTab === 'add-direct' && isSuperAdmin && (
        <AddDirectTab tenantId={tenantId} />
      )}

      {activeTab === 'invitations' && (
        <div className="animate-fade-in">
          <TenantInvitations
            tenantId={tenantId}
            tenantName={tenantData?.info.name || ''}
          />
        </div>
      )}
    </div>
  )
}

export default TenantMembersTab
