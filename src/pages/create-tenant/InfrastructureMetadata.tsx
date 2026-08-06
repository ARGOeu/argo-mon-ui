import { useState } from 'react'
import { useGetUserContactTypes } from '@/hooks/useTenants'
import { PlusIcon, TrashIcon } from '@heroicons/react/16/solid'
import { Link } from 'react-router-dom'
import { Info } from 'lucide-react'
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

interface InfrastructureMetadataProps {
  metadata: {
    ui_url: string
    poem_url: string
    internalLists: Array<{ email: string; type: string }>
  }
  onMetadataChange: (metadata: {
    ui_url: string
    poem_url: string
    internalLists: Array<{ email: string; type: string }>
  }) => void
  onValidationChange?: (hasError: boolean) => void
  isEditMode?: boolean
  tenantId?: string
  performance: boolean
  publicDowntime: boolean
  onPerformanceChange: (value: boolean) => void
  onPublicDowntimeChange: (value: boolean) => void
}

const InfrastructureMetadata = ({
  metadata,
  onMetadataChange,
  onValidationChange,
  isEditMode,
  tenantId,
  performance,
  publicDowntime,
  onPublicDowntimeChange,
  onPerformanceChange,
}: InfrastructureMetadataProps) => {
  const [errors, setErrors] = useState(() => ({
    uiUrl: '',
    poemUrl: '',
    internalListsEmails: metadata.internalLists.map(() => ({ email: '' })),
  }))
  const { data: contactTypes, isLoading: isContactTypesLoading } =
    useGetUserContactTypes()

  const urlErrorMessage =
    'Please enter a valid URL (must start with http:// or https://)'

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
          !!errors.uiUrl || errors.internalListsEmails.some((err) => err.email)
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
          <h2 className="section-title">Internal Lists</h2>
          <p className="section-description">Internal mailing lists</p>
        </div>

        <div className={sectionContentClass}>
          {metadata.internalLists.map((list, index) => (
            <div
              key={index}
              className="flex flex-col gap-0.5 pb-3 border-b border-line last:border-b-0 last:mb-0 last:pb-0"
            >
              <div className="flex justify-between items-center">
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

      {isEditMode && tenantId && (
        <div className={sectionClass}>
          <div className="pt-2 pl-2">
            <h2 className="section-title">Topology Feed</h2>
            <p className="section-description">
              Topology data source configuration
            </p>
          </div>
          <div className={sectionContentClass}>
            <div className="flex items-center gap-1.5">
              <Info className="size-4.5 text-muted flex-shrink-0" />
              <p className="text-sm text-muted">
                The topology feed can be configured on the{' '}
                <Link
                  to={`/tenants/${tenantId}/topology#feed-configuration`}
                  className="text-brand font-medium hover:text-brand-strong hover:underline"
                >
                  Configure Topology Feed
                </Link>{' '}
                page.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className={sectionClass}>
        <div className="pt-2 pl-2">
          <h2 className="section-title">Performance</h2>
          <p className="section-description">Performance data configuration</p>
        </div>

        <div className={sectionContentClass}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <span className="text-sm text-muted">
                Enable or disable performance data for this tenant
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-body">
                {performance ? 'Enabled' : 'Disabled'}
              </span>
              <input
                type="checkbox"
                className="toggle toggle-sm toggle-brand"
                checked={performance}
                onChange={(e) => onPerformanceChange(e.target.checked)}
                aria-label="Enable or disable performance data"
              />
            </div>
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <div className="pt-2 pl-2">
          <h2 className="section-title">Public Downtimes</h2>
          <p className="section-description">Public downtimes configuration</p>
        </div>

        <div className={sectionContentClass}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <span className="text-sm text-muted">
                Enable or disable public downtimes for this tenant
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-body">
                {publicDowntime ? 'Enabled' : 'Disabled'}
              </span>
              <input
                type="checkbox"
                className="toggle toggle-sm toggle-brand"
                checked={publicDowntime}
                onChange={(e) => onPublicDowntimeChange(e.target.checked)}
                aria-label="Enable or disable performance data"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default InfrastructureMetadata
