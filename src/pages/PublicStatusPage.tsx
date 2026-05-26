import { useParams } from 'react-router-dom'
import { useGetStatusQuery } from '@/hooks/useStatus'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import { ExpandableStatus } from './ExpandableStatus'
import { Status } from './Status'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

const resolveLogo = (hasLogo?: boolean, raw?: string): string | undefined => {
  if (!raw || !hasLogo) return undefined
  return raw.startsWith('http') || raw.startsWith('data:')
    ? raw
    : `${BACKEND_API}${raw}`
}

const PublicStatusPage = () => {
  const { slug } = useParams<{ slug: string }>()

  const { data: statusData, isLoading } = useGetStatusQuery(slug || '')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6">
      <div className="container mx-auto max-w-5xl">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center mt-32">
            <LoadingSpinner />
            <div className="text-lg text-muted">Loading status page...</div>
          </div>
        ) : statusData ? (
          statusData.theming?.option === 'theme_2' ? (
            <Status
              statusData={statusData}
              logo={resolveLogo(
                statusData.theming?.has_logo ?? !!statusData.theming?.logo,
                statusData.theming?.logo,
              )}
            />
          ) : (
            <ExpandableStatus
              statusData={statusData}
              logo={resolveLogo(
                statusData.theming?.has_logo ?? !!statusData.theming?.logo,
                statusData.theming?.logo,
              )}
            />
          )
        ) : (
          <div className="page-container">
            <ErrorDisplay
              error="Failed to load status page"
              context="status page"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default PublicStatusPage
