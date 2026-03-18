import { useState } from 'react'
import { useGetUserContactTypes } from '@/hooks/useTenants'
import { PlusIcon, TrashIcon } from '@heroicons/react/16/solid'
import type { Metadata } from '@/types/tenants'
import SelectDropdown from '@/components/SelectDropdown'

const sectionClass =
  'grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4 md:gap-8 mb-6 animate-fade-in'
const sectionContentClass =
  'bg-surface-muted border border-line rounded-lg px-6 py-4 flex flex-col gap-2.5'
const fieldGridClass =
  'grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3'
const iconButtonClass =
  'flex items-center justify-center size-7 rounded-md bg-blue-500 text-white border-none cursor-pointer hover:bg-blue-600'
const iconButtonDangerClass =
  'flex items-center justify-center size-7 rounded-md bg-red-500 text-white border-none cursor-pointer hover:bg-red-600'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
  onValidationChange?: (hasError: boolean) => void
  initialData?: Metadata | null
}

const InfrastructureMetadata = ({
  metadata,
  onMetadataChange,
  onValidationChange,
}: InfrastructureMetadataProps) => {
  const [errors, setErrors] = useState(() => ({
    uiUrl: '',
    poemUrl: '',
    topologyUrl: '',
    authUrl: '',
    internalListsEmails: metadata.internalLists.map(() => ({ email: '' })),
  }))

  const { data: contactTypes, isLoading: isContactTypesLoading } =
    useGetUserContactTypes()

  const urlErrorMesage =
    'Please enter a valid URL (must start with http:// or https://)'

  const handleTopologyTypeChange = (value: string) => {
    onMetadataChange({ ...metadata, topology_type: value })
  }

  const handleInternalListTypeChange = (index: number, value: string) => {
    const updatedLists = [...metadata.internalLists]
    updatedLists[index] = { ...updatedLists[index], type: value }
    onMetadataChange({ ...metadata, internalLists: updatedLists })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value: fieldValue } = e.target
    const urlRegex = /^https?:\/\/.+\..+/

    onMetadataChange({
      ...metadata,
      [name]: fieldValue,
    })

    if (name === 'ui_url') {
      if (fieldValue && !urlRegex.test(fieldValue)) {
        setErrors((prev) => ({ ...prev, uiUrl: urlErrorMesage }))
        onValidationChange?.(true)
      } else {
        setErrors((prev) => ({ ...prev, uiUrl: '' }))
        const hasErrors =
          !!errors.poemUrl ||
          !!errors.topologyUrl ||
          !!errors.authUrl ||
          errors.internalListsEmails.some((err) => err.email)
        onValidationChange?.(hasErrors)
      }
    }

    if (name === 'poem_url') {
      if (fieldValue && !urlRegex.test(fieldValue)) {
        setErrors((prev) => ({ ...prev, poemUrl: urlErrorMesage }))
        onValidationChange?.(true)
      } else {
        setErrors((prev) => ({ ...prev, poemUrl: '' }))
        const hasErrors =
          !!errors.uiUrl ||
          !!errors.topologyUrl ||
          !!errors.authUrl ||
          errors.internalListsEmails.some((err) => err.email)
        onValidationChange?.(hasErrors)
      }
    }

    if (name === 'topology_url') {
      if (fieldValue && !urlRegex.test(fieldValue)) {
        setErrors((prev) => ({ ...prev, topologyUrl: urlErrorMesage }))
        onValidationChange?.(true)
      } else {
        setErrors((prev) => ({ ...prev, topologyUrl: '' }))
        const hasErrors =
          !!errors.uiUrl ||
          !!errors.poemUrl ||
          !!errors.authUrl ||
          errors.internalListsEmails.some((err) => err.email)
        onValidationChange?.(hasErrors)
      }
    }

    if (name === 'auth_url') {
      if (fieldValue && !urlRegex.test(fieldValue)) {
        setErrors((prev) => ({ ...prev, authUrl: urlErrorMesage }))
        onValidationChange?.(true)
      } else {
        setErrors((prev) => ({ ...prev, authUrl: '' }))
        const hasErrors =
          !!errors.uiUrl ||
          !!errors.poemUrl ||
          !!errors.topologyUrl ||
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
          !!errors.topologyUrl ||
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
        !!errors.topologyUrl ||
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
          <p className="section-description">
            Primary instance URL configurations
          </p>
        </div>

        <div className={sectionContentClass}>
          <div className={fieldGridClass}>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-body mb-1">
                UI URL
              </label>
              <input
                type="url"
                name="ui_url"
                value={metadata.ui_url}
                onChange={handleChange}
                placeholder="Enter UI URL"
              />
              {errors.uiUrl && (
                <span className="text-red-400 text-sm mt-1">
                  {errors.uiUrl}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-body mb-1">
                POEM URL
              </label>
              <input
                type="url"
                name="poem_url"
                value={metadata.poem_url}
                onChange={handleChange}
                placeholder="Enter POEM URL"
              />
              {errors.poemUrl && (
                <span className="text-red-400 text-sm mt-1">
                  {errors.poemUrl}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <div className="pt-2 pl-2">
          <h2 className="section-title">Topology</h2>
          <p className="section-description">Topology configuration settings</p>
        </div>

        <div className={sectionContentClass}>
          <div className={fieldGridClass}>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-body mb-1">Type</label>
              {isContactTypesLoading ? (
                <div className="text-sm text-muted">Loading...</div>
              ) : (
                <SelectDropdown
                  value={metadata.topology_type}
                  onChange={handleTopologyTypeChange}
                  options={[
                    { value: 'GOCDB', label: 'GOCdb' },
                    { value: 'CSV', label: 'CSV' },
                  ]}
                  placeholder="Select type"
                />
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-body mb-1">
                Service URL
              </label>
              <input
                type="url"
                name="topology_url"
                value={metadata.topology_url}
                onChange={handleChange}
                placeholder="Enter topology URL"
              />
              {errors.topologyUrl && (
                <span className="text-red-400 text-sm mt-1">
                  {errors.topologyUrl}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-body mb-1">
                Data Feed
              </label>
              <input
                type="text"
                name="topology_feed"
                value={metadata.topology_feed}
                onChange={handleChange}
                placeholder="Enter topology feed"
              />
            </div>
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
              className="flex flex-col gap-2 pb-4 mb-2 border-b border-line last:border-b-0 last:mb-0 last:pb-0"
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
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-body mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={list.email}
                    onChange={(e) => handleInternalListChange(index, e)}
                    placeholder="Enter email address"
                  />
                  {errors.internalListsEmails[index]?.email && (
                    <span className="text-red-400 text-sm mt-1">
                      {errors.internalListsEmails[index].email}
                    </span>
                  )}
                </div>

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
            <div className="flex flex-col">
              <label className="text-sm font-medium text-body mb-1">
                Auth Name
              </label>
              <input
                type="text"
                name="auth_name"
                value={metadata.auth_name}
                onChange={handleChange}
                placeholder="Enter authentication name"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-body mb-1">
                Auth URL
              </label>
              <input
                type="url"
                name="auth_url"
                value={metadata.auth_url}
                onChange={handleChange}
                placeholder="Enter authentication URL"
              />
              {errors.authUrl && (
                <span className="text-red-400 text-sm mt-1">
                  {errors.authUrl}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default InfrastructureMetadata
