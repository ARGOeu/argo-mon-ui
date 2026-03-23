import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from './Layout'
import { Home } from './pages/Home'
import AuthProtected from './routing/AuthProtected'
import ProtectedRoute from './routing/ProtectedRoute'
import { Profile } from './pages/Profile'
import BuildStatusPage from './pages/build-status-page'
import TenantStatusPages from './pages/status-pages'
import CreateTenant from './pages/create-tenant'
import TenantReports from './pages/tenant-reports'
import TenantCapabilities from './pages/tenant-capabilities'
import TenantDetails from './pages/tenant-details'
import AssignProjects from './pages/AssignProjects'
import CreateProject from './pages/CreateProject'
import Administration from './pages/administration'
import ManageTenantMembers from './pages/manage-tenant-members'
import MyInvitations from './pages/MyInvitations'
import { InvitationReview } from './pages/InvitationReview'
import { Status } from './pages/Status'
import { TenantTopology, CreateTopologyEndpoint } from './pages/tenant-topology'
import { AuthProvider } from './auth/AuthProvider'
import NotFound from './pages/NotFound'
import { Toaster } from 'sonner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (
          error?.message?.includes('401') ||
          error?.message?.includes('Unauthorized')
        ) {
          return false
        }
        return failureCount < 3
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: false,
    },
  },
})

export function AuthLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}

function App() {
  return (
    <>
      <Toaster richColors position="top-center" duration={2000} />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="status/:slug" element={<Status />} />
            <Route element={<AuthLayout />}>
              <Route path="invitation/:id" element={<InvitationReview />} />
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route
                  path="tenants/:id/details"
                  element={
                    <AuthProtected>
                      <TenantDetails />
                    </AuthProtected>
                  }
                />
                <Route
                  path="tenants/create"
                  element={
                    <ProtectedRoute requiredRoles={['super_admin']}>
                      <CreateTenant />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="tenants/edit/:id"
                  element={
                    <AuthProtected>
                      <CreateTenant />
                    </AuthProtected>
                  }
                />
                <Route
                  path="tenants/:id/projects/assign"
                  element={
                    <AuthProtected>
                      <AssignProjects />
                    </AuthProtected>
                  }
                />
                <Route
                  path="tenants/:id/members"
                  element={
                    <AuthProtected>
                      <ManageTenantMembers />
                    </AuthProtected>
                  }
                />
                <Route
                  path="tenants/:id/reports"
                  element={
                    <AuthProtected>
                      <TenantReports />
                    </AuthProtected>
                  }
                />
                <Route
                  path="tenants/:id/capabilities"
                  element={
                    <AuthProtected>
                      <TenantCapabilities />
                    </AuthProtected>
                  }
                />
                <Route
                  path="projects/create"
                  element={
                    <ProtectedRoute requiredRoles={['super_admin']}>
                      <CreateProject />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="projects/edit/:id"
                  element={
                    <ProtectedRoute requiredRoles={['super_admin']}>
                      <CreateProject />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="administration"
                  element={
                    <ProtectedRoute requiredRoles={['super_admin']}>
                      <Administration />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="administration/users/:username"
                  element={
                    <ProtectedRoute requiredRoles={['super_admin']}>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="my-invitations"
                  element={
                    <AuthProtected>
                      <MyInvitations />
                    </AuthProtected>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <AuthProtected>
                      <Profile />
                    </AuthProtected>
                  }
                />
                <Route
                  path="status-pages/tenants/:tenantId/pages/:pageId"
                  element={
                    <AuthProtected>
                      <BuildStatusPage />
                    </AuthProtected>
                  }
                />
                <Route
                  path="status-pages/build"
                  element={
                    <AuthProtected>
                      <BuildStatusPage />
                    </AuthProtected>
                  }
                />
                <Route
                  path="tenants/:id/status-pages"
                  element={
                    <AuthProtected>
                      <TenantStatusPages />
                    </AuthProtected>
                  }
                />
                <Route
                  path="tenants/:id/topology"
                  element={
                    <AuthProtected>
                      <TenantTopology />
                    </AuthProtected>
                  }
                />
                <Route
                  path="tenants/:id/topology/create"
                  element={
                    <AuthProtected>
                      <CreateTopologyEndpoint />
                    </AuthProtected>
                  }
                />
                <Route
                  path="tenants/:id/topology/edit/:endpointId"
                  element={
                    <AuthProtected>
                      <CreateTopologyEndpoint />
                    </AuthProtected>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </>
  )
}

export default App
