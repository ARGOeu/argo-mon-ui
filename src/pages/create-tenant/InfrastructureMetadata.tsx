import { useState } from 'react'
import { useGetUserContactTypes } from '@/hooks/useTenants'
import { PlusIcon, TrashIcon } from '@heroicons/react/16/solid'
import SelectDropdown from '@/components/SelectDropdown'
import FormField from './FormField'

const sectionClass =
  'grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4 md:gap-8 mb-6 animate-fade-in'
const sectionContentClass =
  'bg-surface-muted border border-line rounded-lg px-6 py-4 flex flex-col gap-2.5'
const fieldGridClass =
  'grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-3'
const iconButtonClass =
  'flex items-center justify-center size-7 rounded-md bg-brand text-white border-none cursor-pointer hover:bg-brand-strong'
const iconButtonDangerClass =
  'flex items-center justify-center size-7 rounded-md bg-red-500 text-white border-none cursor-pointer hover:bg-red-600'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const urlRegex = /^https?:\/\/.+\..+/

const FEED_TYPE_OPTIONS = [
  { value: 'internal', label: 'Internal' },
  { value: 'CSV', label: 'CSV' },
  { value: 'eosc-service-catalog', label: 'EOSC Service Catalog' },
  { value: 'external', label: 'External' },
]

export type TopologyFeedFormState = {
  type: string
  feed_url: string
  feed_service_groups: string
  feed_service_endpoints: string
  feed_service_endpoints_extensions: string
}

interface InfrastructureMetadataProps {
  metadata: {
    ui_url: string
    poem_url: string
    topology_type: string
    topology_url: string
    topology_feed: string
    internalLists: Array<{ email: string; type: string }>
    auth_name: string
    auth_url: string
  }
  onMetadataChange: (metadata: {
    ui_url: string
    poem_url: string
    topology_type: string
    topology_url: string
    topology_feed: string
    internalLists: Array<{ email: string; type: string }>
    auth_name: string
    auth_url: string
  }) => void
  topologyFeed: TopologyFeedFormState
  onTopologyFeedChange: (feed: TopologyFeedFormState) => void
  onValidationChange?: (hasError: boolean) => void
}

const InfrastructureMetadata = ({
  metadata,
  onMetadataChange,
  topologyFeed,
  onTopologyFeedChange,
  onValidationChange,
}: InfrastructureMetadataProps) => {
  const [errors, setErrors] = useState(() => ({
    uiUrl: '',
    poemUrl: '',
    authUrl: '',
    internalListsEmails: metadata.internalLists.map(() => ({ email: '' })),
  }))
  const { data: contactTypes, isLoading: isContactTypesLoading } =
    useGetUserContactTypes()

  const urlErrorMessage =
    'Please enter a valid URL (must start with http:// or https://)'

  const handleFeedTypeChange = (value: string) => {
    onTopologyFeedChange({
      type: value,
      feed_url: '',
      feed_service_groups: '',
      feed_service_endpoints: '',
      feed_service_endpoints_extensions: '',
    })
  }

  const handleFeedFieldChange = (
    field: keyof Omit<TopologyFeedFormState, 'type'>,
    value: string,
  ) => {
    onTopologyFeedChange({ ...topologyFeed, [field]: value })
  }

  const handleInternalListTypeChange = (index: number, value: string) => {
    const updatedLists = [...metadata.internalLists]
    updatedLists[index] = { ...updatedLists[index], type: value }
    onMetadataChange({ ...metadata, internalLists: updatedLists })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value: fieldValue } = e.target

    onMetadataChange({
      ...metadata,
      [name]: fieldValue,
    })

    if (name === 'ui_url') {
      if (fieldValue && !urlRegex.test(fieldValue)) {
        setErrors((prev) => ({ ...prev, uiUrl: urlErrorMessage }))
        onValidationChange?.(true)
      } else {
        setErrors((prev) => ({ ...prev, uiUrl: '' }))
        const hasErrors =
          !!errors.poemUrl ||
          !!errors.authUrl ||
          errors.internalListsEmails.some((err) => err.email)
        onValidationChange?.(hasErrors)
      }
    }

    if (name === 'poem_url') {
      if (fieldValue && !urlRegex.test(fieldValue)) {
        setErrors((prev) => ({ ...prev, poemUrl: urlErrorMessage }))
        onValidationChange?.(true)
      } else {
        setErrors((prev) => ({ ...prev, poemUrl: '' }))
        const hasErrors =
          !!errors.uiUrl ||
          !!errors.authUrl ||
          errors.internalListsEmails.some((err) => err.email)
        onValidationChange?.(hasErrors)
      }
    }

    if (name === 'auth_url') {
      if (fieldValue && !urlRegex.test(fieldValue)) {
        setErrors((prev) => ({ ...prev, authUrl: urlErrorMessage }))
        onValidationChange?.(true)
      } else {
        setErrors((prev) => ({ ...prev, authUrl: '' }))
        const hasErrors =
          !!errors.uiUrl ||
          !!errors.poemUrl ||
          errors.internalListsEmails.some((err) => err.email)
        onValidationChange?.(hasErrors)
      }
    }
  }

  const handleInternalListChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target
    const updatedLists = [...metadata.internalLists]
    updatedLists[index] = {
      ...updatedLists[index],
      [name]: value,
    }
    onMetadataChange({
      ...metadata,
      internalLists: updatedLists,
    })

    if (name === 'email') {
      const updatedErrors = [...errors.internalListsEmails]
      if (value && !emailRegex.test(value)) {
        updatedErrors[index] = { email: 'Please enter a valid email address' }
        onValidationChange?.(true)
      } else {
        updatedErrors[index] = { email: '' }
        const hasAnyError =
          !!errors.uiUrl ||
          !!errors.poemUrl ||
          !!errors.authUrl ||
          updatedErrors.some((err) => err.email)
        onValidationChange?.(hasAnyError)
      }
      setErrors((prev) => ({
        ...prev,
        internalListsEmails: updatedErrors,
      }))
    }
  }

  const handleAddInternalList = () => {
    if (metadata.internalLists.length < 5) {
      onMetadataChange({
        ...metadata,
        internalLists: [...metadata.internalLists, { email: '', type: '' }],
      })
      setErrors((prev) => ({
        ...prev,
        internalListsEmails: [...prev.internalListsEmails, { email: '' }],
      }))
    }
  }

  const handleRemoveInternalList = (index: number) => {
    if (metadata.internalLists.length > 1) {
      const updatedLists = metadata.internalLists.filter((_, i) => i !== index)
      const updatedErrors = errors.internalListsEmails.filter(
        (_, i) => i !== index,
      )
      onMetadataChange({
        ...metadata,
        internalLists: updatedLists,
      })
      setErrors((prev) => ({
        ...prev,
        internalListsEmails: updatedErrors,
      }))
      const hasAnyError =
        !!errors.uiUrl ||
        !!errors.poemUrl ||
        !!errors.authUrl ||
        updatedErrors.some((err) => err.email)
      onValidationChange?.(hasAnyError)
    }
  }

  return (
    <>
      <div className={sectionClass}>
        <div className="pt-2 pl-2">
          <h2 className="section-title">Instance URLs</h2>
          <p className="section-description">Instance URL configurations</p>
        </div>

        <div className={sectionContentClass}>
          <div className={fieldGridClass}>
            <FormField
              label="UI URL"
              type="url"
              name="ui_url"
              value={metadata.ui_url}
              onChange={handleChange}
              placeholder="Enter UI URL"
              error={errors.uiUrl}
            />
            <FormField
              label="POEM URL"
              type="url"
              name="poem_url"
              value={metadata.poem_url}
              onChange={handleChange}
              placeholder="Enter POEM URL"
              error={errors.poemUrl}
            />
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <div className="pt-2 pl-2">
          <h2 className="section-title">Topology Feed</h2>
          <p className="section-description">
            Feed configuration for topology data
          </p>
        </div>

        <div className={sectionContentClass}>
          <div className={fieldGridClass}>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-body mb-1">
                Type <span className="required">*</span>
              </label>
              <SelectDropdown
                value={topologyFeed.type}
                onChange={handleFeedTypeChange}
                options={FEED_TYPE_OPTIONS}
                placeholder="Select feed type"
              />
            </div>
          </div>

          {topologyFeed.type === 'CSV' && (
            <div className={fieldGridClass}>
              <FormField
                label="URL"
                type="url"
                value={topologyFeed.feed_url}
                onChange={(e) =>
                  handleFeedFieldChange('feed_url', e.target.value)
                }
                placeholder="Enter feed URL"
              />
            </div>
          )}

          {topologyFeed.type === 'eosc-service-catalog' && (
            <div className={fieldGridClass}>
              <FormField
                label="Service Groups URL"
                type="url"
                value={topologyFeed.feed_service_groups}
                onChange={(e) =>
                  handleFeedFieldChange('feed_service_groups', e.target.value)
                }
                placeholder="Enter service groups feed URL"
              />
              <FormField
                label="Service Endpoints URL"
                type="url"
                value={topologyFeed.feed_service_endpoints}
                onChange={(e) =>
                  handleFeedFieldChange(
                    'feed_service_endpoints',
                    e.target.value,
                  )
                }
                placeholder="Enter service endpoints feed URL"
              />
              <FormField
                label="Service Endpoint Extensions URL"
                type="url"
                value={topologyFeed.feed_service_endpoints_extensions}
                onChange={(e) =>
                  handleFeedFieldChange(
                    'feed_service_endpoints_extensions',
                    e.target.value,
                  )
                }
                placeholder="Enter service endpoint extensions feed URL"
              />
            </div>
          )}
        </div>
      </div>

      <div className={sectionClass}>
        <div className="pt-2 pl-2">
          <h2 className="section-title">Internal Lists</h2>
          <p className="section-description">Internal mailing lists</p>
        </div>

        <div className={sectionContentClass}>
          {metadata.internalLists.map((list, index) => (
            <div
              key={index}
              className="flex flex-col gap-1 pb-4 mb-2 border-b border-line last:border-b-0 last:mb-0 last:pb-0"
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-base font-semibold text-body">
                  Internal List {index + 1}
                </span>
                <div className="flex gap-2">
                  {index === metadata.internalLists.length - 1 &&
                    metadata.internalLists.length < 5 && (
                      <button
                        type="button"
                        onClick={handleAddInternalList}
                        className={iconButtonClass}
                        title="Add internal list"
                      >
                        <PlusIcon className="size-5" />
                      </button>
                    )}
                  {metadata.internalLists.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveInternalList(index)}
                      className={iconButtonDangerClass}
                      title="Remove internal list"
                    >
                      <TrashIcon className="size-5" />
                    </button>
                  )}
                </div>
              </div>

              <div className={fieldGridClass}>
                <FormField
                  label="Email"
                  type="email"
                  name="email"
                  value={list.email}
                  onChange={(e) => handleInternalListChange(index, e)}
                  placeholder="Enter email address"
                  error={errors.internalListsEmails[index]?.email}
                />

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-body mb-1">
                    Type
                  </label>
                  {isContactTypesLoading ? (
                    <div className="text-sm text-muted">Loading...</div>
                  ) : (
                    <SelectDropdown
                      value={list.type}
                      onChange={(value) =>
                        handleInternalListTypeChange(index, value)
                      }
                      options={
                        contactTypes?.map((type) => ({
                          value: type,
                          label:
                            type.charAt(0).toUpperCase() +
                            type.slice(1).toLowerCase(),
                        })) ?? []
                      }
                      placeholder="Select type"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={sectionClass}>
        <div className="pt-2 pl-2">
          <h2 className="section-title">Authentication Metadata</h2>
          <p className="section-description">
            Authentication configuration settings
          </p>
        </div>

        <div className={sectionContentClass}>
          <div className={fieldGridClass}>
            <FormField
              label="Auth Name"
              name="auth_name"
              value={metadata.auth_name}
              onChange={handleChange}
              placeholder="Enter authentication name"
            />
            <FormField
              label="Auth URL"
              type="url"
              name="auth_url"
              value={metadata.auth_url}
              onChange={handleChange}
              placeholder="Enter authentication URL"
              error={errors.authUrl}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default InfrastructureMetadata
