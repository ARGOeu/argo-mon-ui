import { useState } from 'react'
import {
  useGetTopologyEndpoints,
  useGetTopologyServiceTypes,
  useCreateTopologyEndpointMutation,
} from '@/hooks/useTopology'
import { useGetUserTenantById } from '@/hooks/useTenants'
import { useParams, useNavigate } from 'react-router-dom'
import type { EndpointTopologyItem } from '@/types/topology'
import { toast } from 'sonner'
import NotificationsSection from './NotificationsSection'
import GroupSelector from './GroupSelector'
import KeyValueInput from './KeyValueInput'
import type { Label } from './KeyValueInput'
import type { Contact } from './NotificationsSection'
import PageHeader from '@/components/PageHeader'
import Button from '@/components/Button'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import SelectDropdown from '@/components/SelectDropdown'

const sectionClass =
  'grid grid-cols-1 md:grid-cols-[360px_1fr] gap-4 md:gap-8 mb-7 animate-fade-in'
const sectionContentClass =
  'bg-surface-muted border border-line rounded-lg px-5 py-3 flex flex-col gap-2'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const today = new Date().toISOString().split('T')[0]

interface FormData {
  service: string
  hostname: string
  group: string
  monitored: boolean
  labels: Label[]
  notificationsEnabled: boolean
  contacts: Contact[]
}

interface FormErrors {
  service: string
  hostname: string
  group: string
  contacts: string[]
}

interface CreateTopologyEndpointProps {
  tenantId?: string
  editingEndpoint?: EndpointTopologyItem
  onClose?: () => void
}

const CreateTopologyEndpoint = ({
  tenantId: tenantIdProp,
  editingEndpoint,
  onClose,
}: CreateTopologyEndpointProps = {}) => {
  const { id: tenantIdParam } = useParams<{ id?: string }>()
  const tenantId = tenantIdProp ?? tenantIdParam ?? ''
  const isEditMode = !!editingEndpoint
  const navigate = useNavigate()

  const { data: tenantData } = useGetUserTenantById(tenantId)

  const { data: latestEndpoints, isLoading: isLoadingLatest } =
    useGetTopologyEndpoints(tenantId, '')

  const {
    data: serviceTypes,
    isLoading: isLoadingTypes,
    error: typesError,
  } = useGetTopologyServiceTypes(tenantId)

  const createMutation = useCreateTopologyEndpointMutation()

  const [isGroupSaving, setIsGroupSaving] = useState(false)

  const [formData, setFormData] = useState<FormData>(() => {
    if (editingEndpoint) {
      return {
        service: editingEndpoint.service,
        hostname: editingEndpoint.hostname,
        group: editingEndpoint.group,
        monitored: editingEndpoint.tags?.monitored === '1',
        labels: Object.entries(editingEndpoint.tags ?? {})
          .filter(([key]) => key !== 'monitored')
          .map(([key, value]) => ({ id: crypto.randomUUID(), key, value })),
        notificationsEnabled: editingEndpoint.notifications?.enabled ?? false,
        contacts: editingEndpoint.notifications?.contacts?.length
          ? editingEndpoint.notifications.contacts.map((email) => ({
              id: crypto.randomUUID(),
              value: email,
            }))
          : [{ id: crypto.randomUUID(), value: '' }],
      }
    }
    return {
      service: '',
      hostname: '',
      group: '',
      monitored: true,
      labels: [],
      notificationsEnabled: false,
      contacts: [{ id: crypto.randomUUID(), value: '' }],
    }
  })

  const [errors, setErrors] = useState<FormErrors>({
    service: '',
    hostname: '',
    group: '',
    contacts: [''],
  })

  const handleServiceChange = (value: string) => {
    setFormData((prev) => ({ ...prev, service: value }))
    if (value) {
      setErrors((prev) => ({ ...prev, service: '' }))
    }
  }

  const handleHostnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setFormData((prev) => ({ ...prev, hostname: value }))
    if (value.trim()) {
      setErrors((prev) => ({ ...prev, hostname: '' }))
    }
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
      group: '',
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

    if (!formData.group) {
      newErrors.group = 'Group is required'
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
      tags: {
        monitored: formData.monitored ? '1' : '0',
        ...Object.fromEntries(
          formData.labels
            .filter((label) => label.key.trim())
            .map((label) => [label.key.trim(), label.value.trim()]),
        ),
      },
      notifications: {
        enabled: formData.notificationsEnabled,
        contacts: formData.contacts
          .filter((c) => c.value.trim() && emailRegex.test(c.value))
          .map((c) => c.value),
      },
    }

    const payload = isEditMode
      ? [
          ...(latestEndpoints ?? []).filter(
            (e) => e.hostname !== editingEndpoint.hostname,
          ),
          {
            ...editingEndpoint,
            ...updatedFields,
            group: formData.group,
            date: today,
          },
        ]
      : [
          ...(latestEndpoints ?? []),
          {
            date: today,
            group: formData.group,
            type: 'SERVICEGROUPS',
            ...updatedFields,
          },
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
          setTimeout(() => {
            if (onClose) {
              onClose()
            } else {
              navigate(`/tenants/${tenantId}/topology#endpoints`)
            }
          }, 2000)
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
          to: `/tenants/${tenantId}/topology#endpoints`,
          onClick: onClose,
        }}
      />

      <div className="flex justify-end items-center mb-4">
        <Button
          variant="primary"
          size="md"
          onClick={handleSubmit}
          disabled={
            createMutation.isPending || isLoadingLatest || isGroupSaving
          }
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
          <p className="section-description">
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

      {/* Group */}
      <div className={sectionClass}>
        <div>
          <p className="section-title">Group</p>
          <p className="section-description">Assign this endpoint to a group</p>
        </div>
        <div className={sectionContentClass}>
          <GroupSelector
            tenantId={tenantId}
            tenantName={tenantData?.info.name ?? ''}
            value={formData.group}
            onChange={(value) => {
              setFormData((prev) => ({ ...prev, group: value }))
              if (value) setErrors((prev) => ({ ...prev, group: '' }))
            }}
            error={errors.group}
            onGroupSaving={setIsGroupSaving}
          />
        </div>
      </div>

      {/* Monitoring */}
      <div className={sectionClass}>
        <div>
          <p className="section-title">Monitoring</p>
          <p className="section-description">
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
        <NotificationsSection
          subtitle="endpoint"
          enabled={formData.notificationsEnabled}
          onEnabledChange={(v) =>
            setFormData((prev) => ({ ...prev, notificationsEnabled: v }))
          }
          contacts={formData.contacts}
          contactErrors={errors.contacts}
          onContactChange={handleContactChange}
          onAddContact={handleAddContact}
          onRemoveContact={handleRemoveContact}
        />
      </div>

      {/* Labels */}
      <div className={sectionClass}>
        <div>
          <p className="section-title">Labels</p>
          <p className="section-description">
            Add custom key-value metadata to this endpoint
          </p>
        </div>
        <div className={sectionContentClass}>
          <KeyValueInput
            labels={formData.labels}
            onLabelsChange={(labels) =>
              setFormData((prev) => ({ ...prev, labels }))
            }
          />
        </div>
      </div>
    </div>
  )
}

export default CreateTopologyEndpoint
