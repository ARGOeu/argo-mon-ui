import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useSelectedTenant } from '@/contexts/selected-tenant'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import Button from '@/components/Button'
import { ArrowUpRightFromSquare, Check, Copy } from 'lucide-react'
import Tabs from '@/components/Tabs'
import Badge from '@/components/Badge'
import TenantInfoTab from './TenantInfoTab'
import TenantStatusTab from './TenantStatusTab'
import TenantReadinessTab from './TenantReadinessTab'

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

const TenantDetails = () => {
  const { id: tenantId } = useParams<{ id: string }>()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<'info' | 'status' | 'readiness'>(
    'info',
  )
  const [logoError, setLogoError] = useState(false)
  const [logoLoaded, setLogoLoaded] = useState(false)
  const [copied, setCopied] = useState(false)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    tenant: tenantData,
    isTenantLoading,
    tenantError,
  } = useSelectedTenant()

  useEffect(() => {
    setLogoError(false)
    setLogoLoaded(false)
  }, [tenantData?.info?.image])

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    }
  }, [])

  if (isTenantLoading)
    return (
      <div className="page-container">
        <div className="loading-container">
          <LoadingSpinner />
        </div>
      </div>
    )

  if (tenantError)
    return (
      <div className="page-container p-12">
        <ErrorDisplay error={tenantError} context="tenant" />
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
    <div className="w-full max-w-[1480px]">
      <header className="px-6 py-3">
        <div className="flex flex-wrap items-start gap-3 md:gap-5 ">
          <div className="relative size-12 rounded-lg bg-slate-500 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-white leading-none select-none">
              {tenantData.info.name.charAt(0).toUpperCase()}
            </span>
            {tenantData?.info?.image && !logoError && (
              <img
                src={tenantData.info.image}
                alt={tenantData.info.name}
                onLoad={() => setLogoLoaded(true)}
                onError={() => setLogoError(true)}
                className={`absolute inset-0 size-full rounded-lg object-contain bg-white border border-line p-1 shadow-sm transition-opacity duration-200 ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
              />
            )}
          </div>

          <div className="flex-shrink-0 border-r border-gray-200 pr-5 mr-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-bold leading-none">
                {tenantData.info.name}
              </h1>
              <Badge
                className="bg-emerald-100 text-emerald-800 border border-emerald-300"
                size="sm"
              >
                Active
              </Badge>
            </div>
            <span className="flex items-center gap-1 font-mono text-xs text-subtle mt-1">
              {tenantData.id}
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard?.writeText(tenantData.id ?? '')
                  setCopied(true)
                  copyTimerRef.current = setTimeout(
                    () => setCopied(false),
                    1500,
                  )
                }}
                className={`flex-shrink-0 rounded p-0.5 transition-colors ${
                  copied
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-subtle hover:bg-surface-strong hover:text-body'
                }`}
                aria-label={copied ? 'Copied' : 'Copy tenant ID'}
                title={copied ? 'Copied!' : 'Copy tenant ID'}
              >
                {copied ? (
                  <Check className="h-3 w-3" strokeWidth={2.5} />
                ) : (
                  <Copy className="h-3 w-3" strokeWidth={2} />
                )}
              </button>
            </span>
          </div>

          <div className="flex flex-wrap items-start gap-4 sm:gap-6 xl:gap-7 flex-grow min-w-0">
            {tenantData.info.website && (
              <>
                <div className="flex flex-col min-w-[100px]">
                  <span className="text-xs font-bold text-subtle uppercase tracking-tight">
                    Website
                  </span>
                  <a
                    href={tenantData.info.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand flex items-center gap-1 font-medium hover:underline break-words"
                  >
                    <span className="break-words">
                      {tenantData.info.website?.replace('https://www.', '')}
                    </span>
                    <ArrowUpRightFromSquare
                      size={13}
                      className="flex-shrink-0"
                    />
                  </a>
                </div>
                <div className="hidden xl:block w-px self-stretch bg-gray-200" />
              </>
            )}

            {tenantData.info.created_at && (
              <div className="flex flex-col min-w-[90px]">
                <span className="text-xs font-bold text-subtle uppercase tracking-tight">
                  Created
                </span>
                <span className="text-sm font-normal text-slate-700">
                  {formatDate(tenantData.info.created_at ?? '')}
                </span>
              </div>
            )}

            {tenantData.info.updated_at && (
              <div className="flex flex-col min-w-[90px]">
                <span className="text-xs font-bold text-subtle uppercase tracking-tight">
                  Updated
                </span>
                <span className="text-sm font-normal text-slate-700">
                  {formatDate(tenantData.info.updated_at ?? '')}
                </span>
              </div>
            )}

            <Button
              href={`/tenants/edit/${tenantId}`}
              size="sm"
              variant="primary"
              className="whitespace-nowrap flex-shrink-0 ml-auto self-start"
            >
              Edit Tenant
            </Button>
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

      <div className="px-7">
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
