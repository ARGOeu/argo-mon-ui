import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom'
import Layout from './Layout'
import { Home } from './pages/Home'
import AuthProtected from './routing/AuthProtected'
import { Profile } from './pages/Profile'
import { Build } from './pages/Build'
import { View } from './pages/View'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
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
                path="about"
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
              <Route path="build" element={<Build />} />
              <Route path="view" element={<View />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
