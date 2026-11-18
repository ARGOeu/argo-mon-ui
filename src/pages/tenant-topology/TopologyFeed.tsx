import { useState, useEffect, useId } from 'react'
import {
  useGetTopologyFeedQuery,
  useUpdateTopologyFeedMutation,
} from '@/hooks/useTenants'
import type { TopologyFeed as TopologyFeedPayload } from '@/types/tenants'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/LoadingSpinner'
import { TOPOLOGY_FEED_TYPE_LABELS } from '@/utils/topologyFeedTypes'
import TopologyFeedSavePanel from './TopologyFeedSavePanel'
import TopologyFeedTypeCard from './TopologyFeedTypeCard'
import { TOPOLOGY_FEED_TYPE_INFO } from './topologyFeedTypeInfo'

type TopologyFeedFormState = {
  type: string
  feed_url: string
  feed_service_groups: string
  feed_service_endpoints: string
  feed_service_endpoints_extensions: string
}

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

type TopologyFeedField = keyof Omit<TopologyFeedFormState, 'type'>

const requiredFields: Record<string, TopologyFeedField[]> = {
  CSV: ['feed_url'],
  'desy-marketplace': ['feed_url'],
  'eosc-service-catalog': [
    'feed_service_groups',
    'feed_service_endpoints',
    'feed_service_endpoints_extensions',
  ],
}

const urlRegex = /^https?:\/\/\S+$/
const urlErrorMessage =
  'Please enter a valid URL (must start with http:// or https://)'

const isFeedValid = (feed: TopologyFeedFormState): boolean =>
  (requiredFields[feed.type] ?? []).every((field) => urlRegex.test(feed[field]))

const sectionClass =
  'grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_300px] 2xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-8 mb-4 animate-fade-in'
const sectionContentClass =
  'bg-surface-muted border border-line rounded-lg px-3 py-2.5 flex flex-col gap-2 mb-8'
const labelClass = 'text-sm font-medium text-body mb-0.5'
const invalidInputClass =
  'border-red-500 focus:!border-red-500 focus:!ring-red-500/10'

interface FeedUrlFieldProps {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
}

const FeedUrlField = ({
  label,
  placeholder,
  value,
  onChange,
}: FeedUrlFieldProps) => {
  const id = useId()
  const hasError = value !== '' && !urlRegex.test(value)

  return (
    <div className="flex flex-col">
      <label htmlFor={id} className={labelClass}>
        {label}{' '}
        <span className="required" aria-hidden="true">
          *
        </span>
      </label>
      <input
        id={id}
        type="url"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={hasError ? invalidInputClass : ''}
      />
      {hasError && (
        <span className="text-red-400 text-sm mt-1">{urlErrorMessage}</span>
      )}
    </div>
  )
}

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
  const typeLabelId = useId()
  const typeDescriptionId = useId()

  useEffect(() => {
    const loaded: TopologyFeedFormState = feedData
      ? {
          type: feedData.type || '',
          feed_url: feedData.feed_url || '',
          feed_service_groups: feedData.feed_service_groups || '',
          feed_service_endpoints: feedData.feed_service_endpoints || '',
          feed_service_endpoints_extensions:
            feedData.feed_service_endpoints_extensions || '',
        }
      : emptyForm
    setForm(loaded)
    setOriginalForm(loaded)
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

  const handleFieldChange = (field: TopologyFeedField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const renderTypeFields = (type: string) => {
    if (type === 'CSV' || type === 'desy-marketplace') {
      return (
        <FeedUrlField
          label="URL"
          placeholder="Enter feed URL"
          value={form.feed_url}
          onChange={(value) => handleFieldChange('feed_url', value)}
        />
      )
    }

    if (type === 'eosc-service-catalog') {
      return (
        <div className="flex flex-col gap-2">
          <FeedUrlField
            label="Service Groups URL"
            placeholder="Enter service groups URL"
            value={form.feed_service_groups}
            onChange={(value) =>
              handleFieldChange('feed_service_groups', value)
            }
          />
          <FeedUrlField
            label="Service Endpoints URL"
            placeholder="Enter service endpoints URL"
            value={form.feed_service_endpoints}
            onChange={(value) =>
              handleFieldChange('feed_service_endpoints', value)
            }
          />
          <FeedUrlField
            label="Service Endpoint Extensions URL"
            placeholder="Enter service endpoint extensions URL"
            value={form.feed_service_endpoints_extensions}
            onChange={(value) =>
              handleFieldChange('feed_service_endpoints_extensions', value)
            }
          />
        </div>
      )
    }

    return null
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
      {isLoading ? (
        <div className="loading-container">
          <LoadingSpinner size="md" />
        </div>
      ) : (
        <div className={sectionClass}>
          <div className={sectionContentClass}>
            <div>
              <p
                id={typeLabelId}
                className="text-base font-medium text-body mb-1"
              >
                Select topology feed type
              </p>
              <p id={typeDescriptionId} className="text-sm text-muted mb-1">
                Choose the data source that the monitoring service uses for your
                topology
              </p>
            </div>
            <div
              role="radiogroup"
              aria-labelledby={typeLabelId}
              aria-describedby={typeDescriptionId}
              className="flex flex-col gap-3"
            >
              {Object.entries(TOPOLOGY_FEED_TYPE_INFO).map(([type, info]) => (
                <TopologyFeedTypeCard
                  key={type}
                  name={typeLabelId}
                  value={type}
                  title={TOPOLOGY_FEED_TYPE_LABELS[type] ?? type}
                  info={info}
                  isSelected={form.type === type}
                  onSelect={handleTypeChange}
                >
                  {renderTypeFields(type)}
                </TopologyFeedTypeCard>
              ))}
            </div>
          </div>

          <TopologyFeedSavePanel
            savedType={originalForm.type}
            selectedType={form.type}
            isDirty={isDirty}
            isSaving={updateMutation.isPending}
            isSaveDisabled={
              updateMutation.isPending ||
              !form.type ||
              !isDirty ||
              !isFeedValid(form)
            }
            onSave={handleSubmit}
          />
        </div>
      )}
    </div>
  )
}

export default TopologyFeed
