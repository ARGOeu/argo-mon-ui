import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './Layout'
import { Home } from './pages/Home'
import { AuthProvider } from './auth/AuthProvider'
import AuthProtected from './routing/AuthProtected'
import { Profile } from './pages/Profile'
import { Build } from './pages/Build'
import { View } from './pages/View'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

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

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
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
                path="status"
                element={
                  <AuthProtected>
                    <Build />
                  </AuthProtected>
                }
              />
              <Route
                path="view"
                element={
                  <AuthProtected>
                    <View />
                  </AuthProtected>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
