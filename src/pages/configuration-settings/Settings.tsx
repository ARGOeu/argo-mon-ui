import { useGetSettings } from '@/hooks/useSettings'
import { Link } from 'react-router-dom'
import PageHeader from '@/components/PageHeader'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import Card from '@/components/Card'

const Settings = () => {
  const { data: settings, isLoading, error } = useGetSettings()

  return (
    <div className="page-container">
      <PageHeader
        title="Settings"
        subtitle="Configure system settings and manage application components"
        className="mb-6"
      />

      {isLoading ? (
        <div className="loading-container">
          <LoadingSpinner size="md" />
        </div>
      ) : error ? (
        <ErrorDisplay error={error} context="settings" />
      ) : !settings?.length ? (
        <p className="text-sm text-muted">No settings configured yet.</p>
      ) : (
        <>
          <p className="text-xs font-semibold tracking-widest uppercase text-subtle mb-2">
            Monitoring
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {settings.map((setting) => (
              <Link
                key={setting.id}
                to={`/settings/${setting.id}`}
                className="no-underline"
              >
                <Card className="px-6 py-4 h-full hover:border-brand transition-colors">
                  <h3 className="text-base font-medium text-foreground mb-1">
                    {setting.data.label}
                  </h3>
                  <p className="text-sm text-muted">
                    {setting.data.description}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default Settings
