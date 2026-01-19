import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from './Layout'
import { Home } from './pages/Home'
import AuthProtected from './routing/AuthProtected'
import ProtectedRoute from './routing/ProtectedRoute'
import { Profile } from './pages/Profile'
import Build from './pages/Build'
import View from './pages/View'
import Tenants from './pages/Tenants'
import CreateTenant from './pages/CreateTenant'
import TenantStatus from './pages/TenantStatus'
import AssignProjects from './pages/AssignProjects'
import Projects from './pages/Projects'
import CreateProject from './pages/CreateProject'
import Administration from './pages/Administration'
import { Status } from './pages/Status'
import { AuthProvider } from './auth/AuthProvider'

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
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="status/:slug" element={<Status />} />
          <Route element={<AuthLayout />}>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route
                path="tenants/view"
                element={
                  <ProtectedRoute
                    requiredRoles={['super_admin', 'admin', 'viewer']}
                  >
                    <Tenants />
                  </ProtectedRoute>
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
                  <ProtectedRoute requiredRoles={['super_admin', 'admin']}>
                    <CreateTenant />
                  </ProtectedRoute>
                }
              />
              <Route
                path="tenants/:id/projects/assign"
                element={
                  <ProtectedRoute requiredRoles={['super_admin', 'admin']}>
                    <AssignProjects />
                  </ProtectedRoute>
                }
              />
              <Route
                path="tenants/:id/status"
                element={
                  <ProtectedRoute requiredRoles={['super_admin']}>
                    <TenantStatus />
                  </ProtectedRoute>
                }
              />
              <Route
                path="projects/view"
                element={
                  <ProtectedRoute requiredRoles={['super_admin']}>
                    <Projects />
                  </ProtectedRoute>
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
                path="profile"
                element={
                  <AuthProtected>
                    <Profile />
                  </AuthProtected>
                }
              />
              <Route
                path="build/:id"
                element={
                  <AuthProtected>
                    <Build />
                  </AuthProtected>
                }
              />
              <Route
                path="status-pages/build"
                element={
                  <AuthProtected>
                    <Build />
                  </AuthProtected>
                }
              />
              <Route
                path="status-pages/view"
                element={
                  <AuthProtected>
                    <View />
                  </AuthProtected>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
