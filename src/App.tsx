import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from './Layout'
import { Home } from './pages/Home'
import AuthProtected from './routing/AuthProtected'
import ProtectedRoute from './routing/ProtectedRoute'
import Profile from './pages/profile'
import BuildStatusPage from './pages/build-status-page'
import TenantStatusPages from './pages/status-pages'
import { TenantDowntimes, CreateDowntime } from './pages/tenant-downtimes'
import {
  TenantIncidents,
  CreateIncident,
  IncidentDetail,
} from './pages/tenant-incidents'
import CreateTenant from './pages/create-tenant'
import TenantReports from './pages/tenant-reports'
import {
  PrivateARContainer,
  PrivateARDailyContainer,
  PrivateAREndpointsContainer,
  PrivateAREndpointsDailyContainer,
} from './pages/availability-reliability'
import TenantCapabilities from './pages/tenant-capabilities'
import TenantDetails from './pages/tenant-details'
import AssignProjects from './pages/AssignProjects'
import CreateProject from './pages/CreateProject'
import Administration from './pages/administration'
import EndpointsAccess from './pages/endpoints-access'
import { Settings, PerformanceSettings } from './pages/configuration-settings'
import TenantPerformance from './pages/TenantPerformance'
import ManageTenantMembers from './pages/manage-tenant-members'
import MyInvitations from './pages/MyInvitations'
import { InvitationReview } from './pages/InvitationReview'
import PublicStatusPage from './pages/PublicStatusPage'
import {
  TenantTopology,
  CreateTopologyEndpoint,
  CreateTopologyGroup,
} from './pages/tenant-topology'
import PrivateDashboardContainer from './pages/dashboard'
import {
  PublicTenantLayout,
  PublicDashboardContainer,
  PublicCapabilitiesContainer,
  PublicPerformanceContainer,
  PublicARContainer,
  PublicARDailyContainer,
  PublicAREndpointsContainer,
  PublicAREndpointsDailyContainer,
} from './pages/public-tenant'
import { AuthProvider } from './auth/AuthProvider'
import { SUPER_ADMIN_ROLE } from './auth/roles'
import NotFound from './pages/NotFound'
import { Toaster } from 'sonner'
import { isPlatformDomain } from './utils/domains'
import PrivateStatusView from './pages/status/PrivateStatusView'
import PublicStatusView from './pages/public-tenant/PublicStatusView'
import PrivateGroupsDashboard from './pages/dashboard/PrivateGroupDashboard'
import PublicGroupDashboard from './pages/public-tenant/PublicGroupDashboard'

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

function PlatformRoutes() {
  return (
    <Routes>
      <Route path="status/:slug" element={<PublicStatusPage />} />
      <Route path="public/tenants/:tenantName" element={<PublicTenantLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<PublicDashboardContainer />} />
        <Route
          path="dashboard/groups/:groupName"
          element={<PublicGroupDashboard />}
        />
        <Route path="status" element={<PublicStatusView />} />
        <Route path="ar-groups" element={<PublicARContainer />} />
        <Route
          path="ar-groups/report/:reportName"
          element={<PublicARContainer />}
        />
        <Route
          path="ar-groups/:groupName/report/:reportName/:month"
          element={<PublicARDailyContainer />}
        />
        <Route
          path="ar-groups/:groupName/report/:reportName/endpoints"
          element={<PublicAREndpointsContainer />}
        />
        <Route
          path="ar-groups/:groupName/report/:reportName/services/:serviceName/endpoints/:endpointName/:month"
          element={<PublicAREndpointsDailyContainer />}
        />
        <Route path="capabilities" element={<PublicCapabilitiesContainer />} />
        <Route path="performance" element={<PublicPerformanceContainer />} />
        <Route path="*" element={<NotFound />} />
      </Route>
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
              <ProtectedRoute requiredRoles={[SUPER_ADMIN_ROLE]}>
                <CreateTenant />
              </ProtectedRoute>
            }
          />
          <Route
            path="tenants/:id/edit"
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
            path="tenants/:id/dashboard"
            element={
              <AuthProtected>
                <PrivateDashboardContainer />
              </AuthProtected>
            }
          />
          <Route
            path="tenants/:id/dashboard/groups/:groupName"
            element={
              <AuthProtected>
                <PrivateGroupsDashboard />
              </AuthProtected>
            }
          />
          <Route
            path="tenants/:id/status"
            element={
              <AuthProtected>
                <PrivateStatusView />
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
            path="tenants/:id/ar-groups"
            element={
              <AuthProtected>
                <PrivateARContainer />
              </AuthProtected>
            }
          />
          <Route
            path="tenants/:id/ar-groups/report/:reportName"
            element={
              <AuthProtected>
                <PrivateARContainer />
              </AuthProtected>
            }
          />
          <Route
            path="tenants/:id/ar-groups/:groupName/report/:reportName/:month"
            element={
              <AuthProtected>
                <PrivateARDailyContainer />
              </AuthProtected>
            }
          />
          <Route
            path="tenants/:id/ar-groups/:groupName/report/:reportName/endpoints"
            element={
              <AuthProtected>
                <PrivateAREndpointsContainer />
              </AuthProtected>
            }
          />
          <Route
            path="tenants/:id/ar-groups/:groupName/report/:reportName/services/:serviceName/endpoints/:endpointName/:month"
            element={
              <AuthProtected>
                <PrivateAREndpointsDailyContainer />
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
            path="tenants/:id/performance"
            element={
              <ProtectedRoute requiredRoles={[SUPER_ADMIN_ROLE]}>
                <TenantPerformance />
              </ProtectedRoute>
            }
          />
          <Route
            path="projects/create"
            element={
              <ProtectedRoute requiredRoles={[SUPER_ADMIN_ROLE]}>
                <CreateProject />
              </ProtectedRoute>
            }
          />
          <Route
            path="projects/edit/:id"
            element={
              <ProtectedRoute requiredRoles={[SUPER_ADMIN_ROLE]}>
                <CreateProject />
              </ProtectedRoute>
            }
          />
          <Route
            path="administration"
            element={
              <ProtectedRoute requiredRoles={[SUPER_ADMIN_ROLE]}>
                <Administration />
              </ProtectedRoute>
            }
          />
          <Route
            path="administration/users/:username"
            element={
              <ProtectedRoute requiredRoles={[SUPER_ADMIN_ROLE]}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="endpoints-access"
            element={
              <ProtectedRoute requiredRoles={[SUPER_ADMIN_ROLE]}>
                <EndpointsAccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute requiredRoles={[SUPER_ADMIN_ROLE]}>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings/:id"
            element={
              <ProtectedRoute requiredRoles={[SUPER_ADMIN_ROLE]}>
                <PerformanceSettings />
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
            path="status-pages/tenants/:tenantId/build"
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
            path="tenants/:id/downtimes"
            element={
              <AuthProtected>
                <TenantDowntimes />
              </AuthProtected>
            }
          />
          <Route
            path="tenants/:id/downtimes/create"
            element={
              <AuthProtected>
                <CreateDowntime />
              </AuthProtected>
            }
          />
          <Route
            path="tenants/:id/downtimes/:downtimeId/edit"
            element={
              <AuthProtected>
                <CreateDowntime />
              </AuthProtected>
            }
          />
          <Route
            path="tenants/:id/incidents"
            element={
              <AuthProtected>
                <TenantIncidents />
              </AuthProtected>
            }
          />
          <Route
            path="tenants/:id/incidents/create"
            element={
              <AuthProtected>
                <CreateIncident />
              </AuthProtected>
            }
          />
          <Route
            path="tenants/:id/incidents/:incidentId"
            element={
              <AuthProtected>
                <IncidentDetail />
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
            path="tenants/:id/topology/groups/create"
            element={
              <AuthProtected>
                <CreateTopologyGroup />
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
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  )
}

function CustomDomainRoutes() {
  const location = useLocation()

  return (
    <Routes>
      <Route element={<PublicTenantLayout />}>
        <Route
          index
          element={
            <Navigate
              to={{
                pathname: '/dashboard',
                search: location.search,
                hash: location.hash,
              }}
              replace
            />
          }
        />
        <Route path="/dashboard" element={<PublicDashboardContainer />} />
        <Route path="/ar-groups" element={<PublicARContainer />} />
        <Route
          path="/ar-groups/report/:reportName"
          element={<PublicARContainer />}
        />
        <Route
          path="/ar-groups/:groupName/report/:reportName/:month"
          element={<PublicARDailyContainer />}
        />
        <Route
          path="/ar-groups/:groupName/report/:reportName/endpoints"
          element={<PublicAREndpointsContainer />}
        />
        <Route
          path="/ar-groups/:groupName/report/:reportName/services/:serviceName/endpoints/:endpointName/:month"
          element={<PublicAREndpointsDailyContainer />}
        />
        <Route path="/capabilities" element={<PublicCapabilitiesContainer />} />
        <Route path="/performance" element={<PublicPerformanceContainer />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

function App() {
  return (
    <>
      <Toaster richColors position="top-center" duration={2000} />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {isPlatformDomain() ? <PlatformRoutes /> : <CustomDomainRoutes />}
        </BrowserRouter>
      </QueryClientProvider>
    </>
  )
}

export default App
