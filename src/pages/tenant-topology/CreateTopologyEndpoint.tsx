import { useState, useEffect, useRef } from 'react'
import {
  useGetTopologyEndpoints,
  useGetTopologyServiceTypes,
  useCreateTopologyEndpointMutation,
} from '@/hooks/useTopology'
import { useGetUserTenantById } from '@/hooks/useTenants'
import { useParams, useNavigate } from 'react-router-dom'
import type { EndpointTopologyItem } from '@/types/topology'
import { PlusIcon, TrashIcon } from '@heroicons/react/16/solid'
import { toast } from 'sonner'
import PageHeader from '@/components/PageHeader'
import Button from '@/components/Button'
import IconButton from '@/components/IconButton'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import SelectDropdown from '@/components/SelectDropdown'

const sectionClass =
  'grid grid-cols-1 md:grid-cols-[360px_1fr] gap-4 md:gap-8 mb-8 animate-fade-in'
const sectionContentClass =
  'bg-surface-muted border border-line rounded-lg px-5 py-3 flex flex-col gap-2'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const today = new Date().toISOString().split('T')[0]

interface Contact {
  id: string
  value: string
}

interface FormData {
  service: string
  hostname: string
  monitored: boolean
  notificationsEnabled: boolean
  contacts: Contact[]
}

interface FormErrors {
  service: string
  hostname: string
  contacts: string[]
}

const CreateTopologyEndpoint = () => {
  const { id, endpointId } = useParams<{ id: string; endpointId?: string }>()
  const tenantId = id ?? ''
  const isEditMode = !!endpointId
  const navigate = useNavigate()

  const { data: tenantData } = useGetUserTenantById(tenantId)

  const { data: todayEndpoints, isLoading: isLoadingToday } =
    useGetTopologyEndpoints(tenantId, today)

  const { data: latestEndpoints, isLoading: isLoadingLatest } =
    useGetTopologyEndpoints(tenantId, '', isEditMode)

  const {
    data: serviceTypes,
    isLoading: isLoadingTypes,
    error: typesError,
  } = useGetTopologyServiceTypes(tenantId)
  const createMutation = useCreateTopologyEndpointMutation()

  const [formData, setFormData] = useState<FormData>({
    service: '',
    hostname: '',
    monitored: true,
    notificationsEnabled: false,
    contacts: [{ id: crypto.randomUUID(), value: '' }],
  })

  const [errors, setErrors] = useState<FormErrors>({
    service: '',
    hostname: '',
    contacts: [''],
  })

  const formInitialized = useRef(false)

  useEffect(() => {
    if (!isEditMode || formInitialized.current || !latestEndpoints) {
      return
    }
    const endpoint = latestEndpoints.find((e) => e.id === endpointId)
    if (!endpoint) {
      return
    }
    setFormData({
      service: endpoint.service,
      hostname: endpoint.hostname,
      monitored: endpoint.tags?.monitored === '1',
      notificationsEnabled: endpoint.notifications?.enabled ?? false,
      contacts: endpoint.notifications?.contacts?.length
        ? endpoint.notifications.contacts.map((email: string) => ({
            id: crypto.randomUUID(),
            value: email,
          }))
        : [{ id: crypto.randomUUID(), value: '' }],
    })
    formInitialized.current = true
  }, [isEditMode, endpointId, latestEndpoints])

  if (isEditMode && (isLoadingLatest || isLoadingToday))
    return (
      <div className="page-container">
        <LoadingSpinner size="md" />
      </div>
    )

  if (
    isEditMode &&
    latestEndpoints &&
    !latestEndpoints.find((e) => e.id === endpointId)
  )
    return (
      <div className="page-container">
        <ErrorDisplay
          error={new Error('Endpoint not found')}
          context="loading endpoint for editing"
        />
      </div>
    )

  const handleServiceChange = (value: string) => {
    setFormData((prev) => ({ ...prev, service: value }))
    if (value) setErrors((prev) => ({ ...prev, service: '' }))
  }

  const handleHostnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setFormData((prev) => ({ ...prev, hostname: value }))
    if (value.trim()) setErrors((prev) => ({ ...prev, hostname: '' }))
  }

  const handleContactChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      contacts: prev.contacts.map((c, i) =>
        i === index ? { ...c, value } : c,
      ),
    }))

    const updatedErrors = [...errors.contacts]
    if (!value.trim() || emailRegex.test(value)) {
      updatedErrors[index] = ''
    } else {
      updatedErrors[index] = 'Invalid email'
    }
    setErrors((prev) => ({ ...prev, contacts: updatedErrors }))
  }

  const handleAddContact = () => {
    setFormData((prev) => ({
      ...prev,
      contacts: [...prev.contacts, { id: crypto.randomUUID(), value: '' }],
    }))
    setErrors((prev) => ({ ...prev, contacts: [...prev.contacts, ''] }))
  }

  const handleRemoveContact = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index),
    }))
    setErrors((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = () => {
    const newErrors: FormErrors = {
      service: '',
      hostname: '',
      contacts: formData.contacts.map(() => ''),
    }

    let hasError = false

    if (!formData.service) {
      newErrors.service = 'Service type is required'
      hasError = true
    }

    if (!formData.hostname.trim()) {
      newErrors.hostname = 'URL is required'
      hasError = true
    }

    if (formData.notificationsEnabled) {
      const hasValidContact = formData.contacts.some(
        (c) => c.value.trim() && emailRegex.test(c.value),
      )
      if (!hasValidContact) {
        newErrors.contacts[0] = 'At least one valid email is required'
        hasError = true
      }
      formData.contacts.forEach((c, i) => {
        if (c.value.trim() && !emailRegex.test(c.value)) {
          newErrors.contacts[i] = 'Invalid email'
          hasError = true
        }
      })
    }

    if (hasError) {
      setErrors(newErrors)
      return
    }

    const updatedFields = {
      service: formData.service,
      hostname: formData.hostname.trim(),
      tags: { monitored: formData.monitored ? '1' : '0' },
      notifications: {
        enabled: formData.notificationsEnabled,
        contacts: formData.contacts
          .filter((c) => c.value.trim() && emailRegex.test(c.value))
          .map((c) => c.value),
      },
    }

    const editingEndpoint = latestEndpoints?.find(
      (e) => e.id === endpointId,
    ) as EndpointTopologyItem

    const payload = isEditMode
      ? [
          ...(todayEndpoints ?? []).filter((e) => e.id !== endpointId),
          { ...editingEndpoint, ...updatedFields, date: today },
        ]
      : [
          ...(todayEndpoints ?? []),
          {
            date: today,
            group: 'DEFAULT',
            type: 'SERVICEGROUPS',
            ...updatedFields,
          } as unknown as EndpointTopologyItem,
        ]

    createMutation.mutate(
      { tenantId, data: payload },
      {
        onSuccess: () => {
          toast.success(
            isEditMode
              ? 'Topology endpoint updated successfully!'
              : 'Topology endpoint created successfully!',
          )
          navigate(`/tenants/${tenantId}/topology`)
        },
        onError: (error) => {
          toast.error(
            `Failed to ${isEditMode ? 'update' : 'create'} topology endpoint: ${error.message}`,
          )
        },
      },
    )
  }

  const selectedServiceType = serviceTypes?.find(
    (st) => st.name === formData.service,
  )

  return (
    <div className="page-container">
      <PageHeader
        title={isEditMode ? 'Edit Topology Endpoint' : 'Add Topology Endpoint'}
        subtitle={
          <>
            {isEditMode
              ? 'Update the topology endpoint for tenant '
              : 'Configure and register a new topology endpoint for tenant '}
            <strong>{tenantData?.info.name ?? '...'}</strong>
          </>
        }
        navigateTo={{
          label: 'Back to Topology',
          to: `/tenants/${tenantId}/topology`,
        }}
      />

      <div className="flex justify-end items-center mb-4">
        <Button
          variant="primary"
          size="md"
          onClick={handleSubmit}
          disabled={createMutation.isPending || isLoadingToday}
        >
          {createMutation.isPending ? (
            <>
              <LoadingSpinner size="xs" />
              Saving...
            </>
          ) : isEditMode ? (
            'Update Endpoint'
          ) : (
            'Add Endpoint'
          )}
        </Button>
      </div>

      {/* Endpoint details */}
      <div className={sectionClass}>
        <div>
          <p className="section-title">Endpoint Details</p>
          <p className="section-description mt-1">
            Select the service type and provide the endpoint URL
          </p>
        </div>
        <div className={sectionContentClass}>
          {/* Service type */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-body mb-1.5">
              Service Type <span className="required">*</span>
            </label>
            {isLoadingTypes ? (
              <div className="flex items-center gap-2 text-sm text-muted py-2">
                <LoadingSpinner size="xs" />
                Loading service types...
              </div>
            ) : typesError ? (
              <ErrorDisplay error={typesError} context="service types" />
            ) : (
              <SelectDropdown
                value={formData.service}
                onChange={handleServiceChange}
                options={
                  serviceTypes?.map((st) => ({
                    value: st.name,
                    label: st.name,
                  })) ?? []
                }
                placeholder="Select a service type..."
              />
            )}
            {errors.service && (
              <span className="text-xs text-red-500 mt-1">
                {errors.service}
              </span>
            )}
            {/* Description preview for selected service */}
            {selectedServiceType && (
              <p className="text-xs text-muted mt-1.5 truncate">
                {selectedServiceType.description}
              </p>
            )}
          </div>

          {/* Hostname / URL */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-body mb-1.5">
              URL <span className="required">*</span>
            </label>
            <input
              type="text"
              name="hostname"
              value={formData.hostname}
              onChange={handleHostnameChange}
              placeholder="Enter the endpoint URL"
              className={
                errors.hostname
                  ? '!border-red-500 focus:!border-red-500 focus:!ring-red-500/10'
                  : ''
              }
            />
            {errors.hostname && (
              <span className="text-xs text-red-500 mt-1">
                {errors.hostname}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Monitoring */}
      <div className={sectionClass}>
        <div>
          <p className="section-title">Monitoring</p>
          <p className="section-description mt-1">
            Configure whether this endpoint is monitored
          </p>
        </div>
        <div className={sectionContentClass}>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="toggle toggle-brand"
              checked={formData.monitored}
              onChange={() =>
                setFormData((prev) => ({ ...prev, monitored: !prev.monitored }))
              }
            />
            <div>
              <p className="text-sm font-semibold text-body">
                {formData.monitored ? 'Monitored' : 'Not monitored'}
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Notifications */}
      <div className={sectionClass}>
        <div>
          <p className="section-title">Notifications</p>
          <p className="section-description mt-1">
            Enable email notifications for this endpoint
          </p>
        </div>
        <div className={sectionContentClass}>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="toggle toggle-brand"
              checked={formData.notificationsEnabled}
              onChange={() =>
                setFormData((prev) => ({
                  ...prev,
                  notificationsEnabled: !prev.notificationsEnabled,
                }))
              }
            />
            <div>
              <p className="text-sm font-semibold text-body">
                {formData.notificationsEnabled
                  ? 'Notifications enabled'
                  : 'Notifications disabled'}
              </p>
            </div>
          </label>

          {formData.notificationsEnabled && (
            <div className="flex flex-col gap-2 mt-1 animate-fade-in">
              <p className="text-sm font-medium text-body">
                Contact Emails <span className="required">*</span>
              </p>
              {formData.contacts.map((contact, index) => (
                <div key={contact.id} className="flex items-start gap-1">
                  <div className="flex flex-col flex-1">
                    <input
                      type="email"
                      value={contact.value}
                      onChange={(e) =>
                        handleContactChange(index, e.target.value)
                      }
                      placeholder="Enter contact email"
                      className={
                        errors.contacts[index]
                          ? '!border-red-500 focus:!border-red-500 focus:!ring-red-500/10'
                          : ''
                      }
                    />
                    {errors.contacts[index] && (
                      <span className="text-xs text-red-500 mt-1">
                        {errors.contacts[index]}
                      </span>
                    )}
                  </div>
                  {formData.contacts.length > 1 && (
                    <div className="mt-1">
                      <IconButton
                        icon={<TrashIcon className="size-4.5" />}
                        label="Remove contact"
                        onClick={() => handleRemoveContact(index)}
                        className="text-red-600 hover:bg-red-50"
                      />
                    </div>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddContact}
                className="flex items-center gap-1.5 text-sm text-brand hover:text-brand-strong transition-colors w-fit cursor-pointer"
              >
                <PlusIcon className="size-4" />
                Add another email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreateTopologyEndpoint
