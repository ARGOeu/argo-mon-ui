import { useState, useEffect } from 'react'
import {
  useGetTopologyFeedQuery,
  useUpdateTopologyFeedMutation,
} from '@/hooks/useTenants'
import type { TopologyFeed as TopologyFeedPayload } from '@/types/tenants'
import { toast } from 'sonner'
import SelectDropdown from '@/components/SelectDropdown'
import Button from '@/components/Button'
import LoadingSpinner from '@/components/LoadingSpinner'

type TopologyFeedFormState = {
  type: string
  feed_url: string
  feed_service_groups: string
  feed_service_endpoints: string
  feed_service_endpoints_extensions: string
}

const FEED_TYPE_OPTIONS = [
  { value: 'internal', label: 'Internal' },
  { value: 'external', label: 'External' },
  { value: 'CSV', label: 'CSV' },
  { value: 'desy-marketplace', label: 'Desy Marketplace' },
  { value: 'eosc-service-catalog', label: 'EOSC Service Catalog' },
]

const NONE_OPTION = { value: '', label: 'None' }

const emptyForm: TopologyFeedFormState = {
  type: '',
  feed_url: '',
  feed_service_groups: '',
  feed_service_endpoints: '',
  feed_service_endpoints_extensions: '',
}

const buildFeedPayload = (feed: TopologyFeedFormState): TopologyFeedPayload => {
  if (feed.type === 'CSV') {
    return {
      type: feed.type,
      feed_url: feed.feed_url,
      paginated: 'false',
      fetch_type: ['ServiceGroups'],
      uid_endpoints: '',
    }
  }
  if (feed.type === 'desy-marketplace') {
    return { type: feed.type, feed_url: feed.feed_url }
  }
  if (feed.type === 'eosc-service-catalog') {
    return {
      type: feed.type,
      feed_service_groups: feed.feed_service_groups,
      feed_service_endpoints: feed.feed_service_endpoints,
      feed_service_endpoints_extensions: feed.feed_service_endpoints_extensions,
    }
  }
  return { type: feed.type }
}

const sectionClass =
  'grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-2 lg:gap-8 mb-6 animate-fade-in'
const sectionContentClass =
  'bg-surface-muted border border-line rounded-lg px-5 py-3 flex flex-col gap-2'
const labelClass = 'text-sm font-medium text-body mb-1'

interface TopologyFeedProps {
  tenantId: string
}

const TopologyFeed = ({ tenantId }: TopologyFeedProps) => {
  const [form, setForm] = useState<TopologyFeedFormState>(emptyForm)
  const [originalForm, setOriginalForm] =
    useState<TopologyFeedFormState>(emptyForm)

  const { data: feedData, isLoading } = useGetTopologyFeedQuery(
    tenantId,
    !!tenantId,
  )
  const updateMutation = useUpdateTopologyFeedMutation()

  useEffect(() => {
    if (feedData) {
      const loaded: TopologyFeedFormState = {
        type: feedData.type || '',
        feed_url: feedData.feed_url || '',
        feed_service_groups: feedData.feed_service_groups || '',
        feed_service_endpoints: feedData.feed_service_endpoints || '',
        feed_service_endpoints_extensions:
          feedData.feed_service_endpoints_extensions || '',
      }
      setForm(loaded)
      setOriginalForm(loaded)
    }
  }, [feedData])

  const isDirty = JSON.stringify(form) !== JSON.stringify(originalForm)

  const handleTypeChange = (value: string) => {
    setForm({
      type: value,
      feed_url: '',
      feed_service_groups: '',
      feed_service_endpoints: '',
      feed_service_endpoints_extensions: '',
    })
  }

  const handleFieldChange = (
    field: keyof Omit<TopologyFeedFormState, 'type'>,
    value: string,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    const submittedForm = form
    updateMutation.mutate(
      { tenantId, data: buildFeedPayload(submittedForm) },
      {
        onSuccess: () => {
          setOriginalForm(submittedForm)
          toast.success('Topology feed updated successfully!')
        },
        onError: (err) => {
          toast.error(`Failed to update topology feed: ${err.message}`)
        },
      },
    )
  }

  return (
    <div>
      <div className="flex justify-end mb-3">
        <Button
          variant="primary"
          size="md"
          onClick={handleSubmit}
          disabled={
            updateMutation.isPending || isLoading || !form.type || !isDirty
          }
        >
          {updateMutation.isPending ? (
            <>
              <LoadingSpinner size="xs" />
              Saving...
            </>
          ) : (
            'Save'
          )}
        </Button>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <LoadingSpinner size="md" />
        </div>
      ) : (
        <div className={sectionClass}>
          <div>
            <p className="section-title">Topology Feed</p>
            <p className="section-description">
              Feed configuration for topology data
            </p>
          </div>
          <div className={sectionContentClass}>
            <div className="flex flex-col">
              <label className={labelClass}>
                Type <span className="required">*</span>
              </label>
              <SelectDropdown
                value={form.type}
                onChange={handleTypeChange}
                options={
                  originalForm.type
                    ? FEED_TYPE_OPTIONS
                    : [NONE_OPTION, ...FEED_TYPE_OPTIONS]
                }
                placeholder="Select feed type"
              />
            </div>

            {(form.type === 'CSV' || form.type === 'desy-marketplace') && (
              <div className="flex flex-col">
                <label className={labelClass}>URL</label>
                <input
                  type="url"
                  value={form.feed_url}
                  onChange={(e) =>
                    handleFieldChange('feed_url', e.target.value)
                  }
                  placeholder="Enter feed URL"
                />
              </div>
            )}

            {form.type === 'eosc-service-catalog' && (
              <>
                <div className="flex flex-col">
                  <label className={labelClass}>Service Groups URL</label>
                  <input
                    type="url"
                    value={form.feed_service_groups}
                    onChange={(e) =>
                      handleFieldChange('feed_service_groups', e.target.value)
                    }
                    placeholder="Enter service groups feed URL"
                  />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Service Endpoints URL</label>
                  <input
                    type="url"
                    value={form.feed_service_endpoints}
                    onChange={(e) =>
                      handleFieldChange(
                        'feed_service_endpoints',
                        e.target.value,
                      )
                    }
                    placeholder="Enter service endpoints feed URL"
                  />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>
                    Service Endpoint Extensions URL
                  </label>
                  <input
                    type="url"
                    value={form.feed_service_endpoints_extensions}
                    onChange={(e) =>
                      handleFieldChange(
                        'feed_service_endpoints_extensions',
                        e.target.value,
                      )
                    }
                    placeholder="Enter service endpoint extensions feed URL"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TopologyFeed
