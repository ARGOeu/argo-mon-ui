import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import PageHeader from '@/components/PageHeader'
import Tabs from '@/components/Tabs'
import UsersTab from './UsersTab'
import AdminInvitationsTab from './AdminInvitationsTab'
import TenantManagementTab from './TenantManagementTab'
import ProjectManagementTab from './ProjectManagementTab'
import StatusPagesManagementTab from './StatusPagesManagementTab'

type ActiveTab =
  | 'tenants'
  | 'status-pages'
  | 'projects'
  | 'users'
  | 'invitations'

const Administration = () => {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<ActiveTab>('tenants')

  const { profile } = useAuth()

  useEffect(() => {
    const hash = location.hash
    if (hash.startsWith('#invitations')) {
      setActiveTab('invitations')
    } else if (hash.startsWith('#users')) {
      setActiveTab('users')
    } else if (hash.startsWith('#projects')) {
      setActiveTab('projects')
    } else if (hash.startsWith('#status-pages')) {
      setActiveTab('status-pages')
    } else {
      setActiveTab('tenants')
    }
  }, [location.hash])
  const isSuperAdmin = profile?.roles?.includes('super_admin')

  if (!isSuperAdmin) {
    return (
      <div className="page-container">
        <div className="bg-red-100 border border-red-200 rounded-lg p-8 text-center mt-8">
          <p className="text-red-800 font-medium text-base m-0">
            Access denied. This page is only available for admins.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Administration Panel"
        subtitle="Central management and configuration"
        className="mb-2"
      />
      <Tabs
        tabs={[
          { id: 'tenants', label: 'Tenants' },
          { id: 'status-pages', label: 'Status Pages' },
          { id: 'projects', label: 'Projects' },
          { id: 'users', label: 'Users' },
          { id: 'invitations', label: 'Invitations' },
        ]}
        activeTab={activeTab}
        onChange={(id) => {
          setActiveTab(id as ActiveTab)
          window.location.hash = id
        }}
        className="mb-4"
      />

      {activeTab === 'tenants' && <TenantManagementTab />}
      {activeTab === 'status-pages' && <StatusPagesManagementTab />}
      {activeTab === 'projects' && <ProjectManagementTab />}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'invitations' && (
        <AdminInvitationsTab isSuperAdmin={!!isSuperAdmin} />
      )}
    </div>
  )
}

export default Administration
