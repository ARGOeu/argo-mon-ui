import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  useGetTopologyEndpoints,
  useGetTopologyServiceTypes,
  useCreateTopologyEndpointMutation,
} from '@/hooks/useTopology'
import { useSelectedTenant } from '@/contexts/selected-tenant'
import { toast } from 'sonner'
import PageHeader from '@/components/PageHeader'
import Button from '@/components/Button'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import SelectDropdown from '@/components/SelectDropdown'
import {
  getContactValidationErrors,
  getValidContactEmails,
  isValidEmail,
} from './utils/topologyValidation'
import NotificationsSection from './NotificationsSection'
import GroupSelector from './GroupSelector'
import LabelsInput from './LabelsInput'
import KeyValueInput from './KeyValueInput'
import type { Label } from './KeyValueInput'
import type { Contact } from './NotificationsSection'
import type { EndpointTopologyItem } from '@/types/topology'

const sectionClass =
  'grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-2 lg:gap-8 mb-6 animate-fade-in'
const sectionContentClass =
  'bg-surface-muted border border-line rounded-lg px-5 py-3 flex flex-col gap-2'

const today = new Date().toISOString().split('T')[0]

interface FormData {
  service: string
  url: string
  tags: string[]
  group: string
  monitored: boolean
  metadata: Label[]
  notificationsEnabled: boolean
  contacts: Contact[]
}

interface FormErrors {
  service: string
  url: string
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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { tenant: tenantData } = useSelectedTenant()

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
      const labelsTag = editingEndpoint.tags?.labels ?? ''
      return {
        service: editingEndpoint.service,
        url: editingEndpoint.tags?.info_URL ?? editingEndpoint.hostname,
        tags: labelsTag
          ? labelsTag
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        group: editingEndpoint.group,
        monitored: editingEndpoint.tags?.monitored === '1',
        metadata: Object.entries(editingEndpoint.tags ?? {})
          .filter(
            ([key]) =>
              key !== 'monitored' && key !== 'labels' && key !== 'info_ID',
          )
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
      url: '',
      tags: [],
      group: '',
      monitored: true,
      metadata: [],
      notificationsEnabled: false,
      contacts: [{ id: crypto.randomUUID(), value: '' }],
    }
  })

  const [errors, setErrors] = useState<FormErrors>({
    service: '',
    url: '',
    group: '',
    contacts: [''],
  })

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const handleServiceChange = (value: string) => {
    setFormData((prev) => ({ ...prev, service: value }))
    if (value) {
      setErrors((prev) => ({ ...prev, service: '' }))
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setFormData((prev) => ({ ...prev, url: value }))
    if (value.trim()) {
      setErrors((prev) => ({ ...prev, url: '' }))
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
    if (!value.trim() || isValidEmail(value)) {
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
      url: '',
      group: '',
      contacts: formData.contacts.map(() => ''),
    }

    let hasError = false

    if (!formData.service) {
      newErrors.service = 'Service type is required'
      hasError = true
    }

    if (!formData.url.trim()) {
      newErrors.url = 'URL is required'
      hasError = true
    }

    if (!formData.group) {
      newErrors.group = 'Group is required'
      hasError = true
    }

    if (
      formData.metadata.some(
        (label) => label.key.trim().toLowerCase() === 'labels',
      )
    ) {
      hasError = true
    }

    if (formData.notificationsEnabled) {
      const contactErrors = getContactValidationErrors(formData.contacts, true)
      if (contactErrors.some((error) => !!error)) {
        newErrors.contacts = contactErrors
        hasError = true
      }
    }

    if (hasError) {
      setErrors(newErrors)
      return
    }

    const fullUrl = formData.url.trim()
    let extractedHostname = fullUrl
    try {
      extractedHostname = new URL(fullUrl).hostname
    } catch (e) {
      console.warn('Could not parse URL hostname:', e)
    }

    const updatedFields = {
      service: formData.service,
      hostname: extractedHostname,
      tags: {
        monitored: formData.monitored ? '1' : '0',
        info_URL: fullUrl,
        hostname: extractedHostname,
        ...(formData.tags.length > 0
          ? { labels: formData.tags.join(',') }
          : {}),
        ...Object.fromEntries(
          formData.metadata
            .filter((label) => label.key.trim())
            .map((label) => [label.key.trim(), label.value.trim()]),
        ),
        ...(editingEndpoint?.tags?.info_ID
          ? { info_ID: editingEndpoint.tags.info_ID }
          : {}),
      },
      notifications: {
        enabled: formData.notificationsEnabled,
        contacts: getValidContactEmails(formData.contacts),
      },
    }

    const payload = isEditMode
      ? (latestEndpoints ?? []).map((e) =>
          (e.tags?.info_URL ?? e.hostname) ===
            (editingEndpoint.tags?.info_URL ?? editingEndpoint.hostname) &&
          e.service === editingEndpoint.service
            ? {
                ...editingEndpoint,
                ...updatedFields,
                group: formData.group,
                date: today,
              }
            : e,
        )
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
          if (timerRef.current) {
            clearTimeout(timerRef.current)
          }
          timerRef.current = setTimeout(() => {
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
            <label className="text-sm font-medium text-body mb-1">
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
            <label className="text-sm font-medium text-body mb-1">
              URL <span className="required">*</span>
            </label>
            <input
              type="text"
              name="url"
              value={formData.url}
              onChange={handleUrlChange}
              placeholder="Enter the endpoint URL"
              className={
                errors.url
                  ? '!border-red-500 focus:!border-red-500 focus:!ring-red-500/10'
                  : ''
              }
            />
            {errors.url && (
              <span className="text-xs text-red-500 mt-1">{errors.url}</span>
            )}
          </div>

          {/* Labels */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-body mb-1">Labels</label>
            <LabelsInput
              tags={formData.tags}
              onChange={(tags) => setFormData((prev) => ({ ...prev, tags }))}
            />
            <p className="text-xs text-muted mt-1">
              Press 'Enter' or 'Space' to add a label
            </p>
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

      {/* Metadata */}
      <div className={sectionClass}>
        <div>
          <p className="section-title">Metadata</p>
          <p className="section-description">
            Add custom key-value metadata to this endpoint
          </p>
        </div>
        <div className={sectionContentClass}>
          <KeyValueInput
            labels={formData.metadata}
            onLabelsChange={(metadata) =>
              setFormData((prev) => ({ ...prev, metadata }))
            }
            disallowedKeys={[
              {
                key: 'labels',
                message: '"labels" cannot be used as a key',
              },
              {
                key: 'monitored',
                message: '"monitored" cannot be used as a key',
              },
              {
                key: 'info_ID',
                message: '"info_ID" cannot be used as a key',
              },
              {
                key: 'info_URL',
                message: '"info_URL" cannot be used as a key',
              },
              {
                key: 'hostname',
                message: '"hostname" cannot be used as a key',
              },
            ]}
          />
        </div>
      </div>
    </div>
  )
}

export default CreateTopologyEndpoint
