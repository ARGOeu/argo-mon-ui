import { useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useGetUserTenantById } from '@/hooks/useTenants'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import Button from '@/components/Button'
import { ArrowUpRightFromSquare, MailIcon } from 'lucide-react'
import Tabs from '@/components/Tabs'
import Badge from '@/components/Badge'
import TenantInfoTab from './TenantInfoTab'
import TenantStatusTab from './TenantStatusTab'
import TenantReadinessTab from './TenantReadinessTab'

const TenantDetails = () => {
  const { id: tenantId } = useParams<{ id: string }>()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<'info' | 'status' | 'readiness'>(
    'info',
  )

  useEffect(() => {
    const hash = location?.hash
    if (hash?.startsWith('#status')) {
      setActiveTab('status')
    } else if (hash?.startsWith('#readiness')) {
      setActiveTab('readiness')
    } else {
      setActiveTab('info')
    }
  }, [location.hash])

  const {
    data: tenantData,
    isLoading,
    error,
  } = useGetUserTenantById(tenantId || '')

  if (isLoading)
    return (
      <div className="page-container">
        <div className="loading-container">
          <LoadingSpinner />
        </div>
      </div>
    )

  if (error)
    return (
      <div className="page-container p-12">
        <ErrorDisplay error={error} context="tenant" />
      </div>
    )

  if (!tenantData)
    return (
      <div className="page-container p-12">
        <ErrorDisplay
          error="The tenant you are looking for does not exist or has been removed."
          context="tenant"
        />
      </div>
    )

  return (
    <div className="w-[100%] max-w-[1480px]">
      <header className="px-6 py-4">
        <div className="flex flex-col xl:flex-row items-start xl:items-center gap-4 xl:gap-6">
          <div className="flex w-full items-start justify-between xl:contents">
            {tenantData?.info?.image ? (
              <div className="flex-shrink-0 w-16 h-16 bg-white border border-line rounded flex items-center justify-center p-1 shadow-sm">
                <img
                  src={tenantData.info.image}
                  alt="Logo"
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="size-16 rounded-lg bg-slate-500 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-white">
                  {tenantData.info.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <Button
              href={`/tenants/edit/${tenantId}`}
              size="sm"
              variant="primary"
              className="whitespace-nowrap flex-shrink-0 xl:order-last xl:ml-auto self-start"
            >
              Edit Tenant
            </Button>
          </div>

          <div className="flex-shrink-0 xl:border-r border-gray-100 xl:pr-6 xl:mr-2 w-full xl:w-auto">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold leading-none">
                {tenantData.info.name}
              </h1>
              <Badge
                className="bg-emerald-100 text-emerald-800 border border-emerald-300"
                size="sm"
              >
                Active
              </Badge>
            </div>
            <p
              className="text-sm text-muted mt-1 max-w-md line-clamp-3"
              title={tenantData.info.description}
            >
              {tenantData.info.description}
            </p>
          </div>

          <div className="flex flex-wrap items-start gap-4 sm:gap-6 xl:gap-8 flex-grow w-full xl:w-auto">
            {tenantData.info.website && (
              <div className="flex flex-col min-w-[120px]">
                <span className="text-xs font-bold text-subtle uppercase tracking-tight">
                  Website
                </span>
                <a
                  href={tenantData.info.website}
                  className="text-sm text-brand flex items-center gap-1 font-medium hover:underline break-words"
                >
                  <span className="break-words">
                    {tenantData.info.website?.replace('https://www.', '')}
                  </span>
                  <ArrowUpRightFromSquare size={14} className="flex-shrink-0" />
                </a>
              </div>
            )}

            <div className="flex flex-col min-w-[120px]">
              <span className="text-xs font-bold text-subtle uppercase tracking-tight">
                ID
              </span>
              <span className="text-sm font-semibold flex items-center gap-1 text-slate-700 break-words">
                {tenantData.id}
              </span>
            </div>

            <div className="flex flex-col min-w-[120px]">
              <span className="text-xs font-bold text-subtle uppercase tracking-tight">
                Email
              </span>
              <span className="text-sm font-semibold flex items-center gap-1 text-slate-700">
                <MailIcon size={12} className="text-slate-400 flex-shrink-0" />{' '}
                <span className="break-words">{tenantData.info.email}</span>
              </span>
            </div>
          </div>
        </div>

        <Tabs
          tabs={[
            { id: 'info', label: 'Info' },
            { id: 'status', label: 'Status' },
            { id: 'readiness', label: 'Readiness' },
          ]}
          activeTab={activeTab}
          onChange={(id) => {
            setActiveTab(id as 'info' | 'status' | 'readiness')
            window.location.hash = id
          }}
          className="mt-3"
        />
      </header>

      <div className="px-10">
        {activeTab === 'info' && <TenantInfoTab tenantId={tenantId || ''} />}
        {activeTab === 'status' && (
          <TenantStatusTab tenantId={tenantId || ''} />
        )}
        {activeTab === 'readiness' && (
          <TenantReadinessTab tenantId={tenantId || ''} />
        )}
      </div>
    </div>
  )
}

export default TenantDetails
