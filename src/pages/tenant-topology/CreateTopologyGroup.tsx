import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelectedTenant } from '@/contexts/selected-tenant'
import {
  useGetTopologyGroups,
  useCreateTopologyGroupsMutation,
} from '@/hooks/useTopology'
import { toast } from 'sonner'
import PageHeader from '@/components/PageHeader'
import Button from '@/components/Button'
import LoadingSpinner from '@/components/LoadingSpinner'
import {
  getContactValidationErrors,
  getValidContactEmails,
  isValidEmail,
} from './utils/topologyValidation'
import NotificationsSection from './NotificationsSection'
import type { Contact } from './NotificationsSection'
import type { GroupTopologyItem } from '@/types/topology'

const sectionClass =
  'grid grid-cols-1 md:grid-cols-[360px_1fr] gap-4 md:gap-8 mb-8 animate-fade-in'
const sectionContentClass =
  'bg-surface-muted border border-line rounded-lg px-5 py-3 flex flex-col gap-2'

const today = new Date().toISOString().split('T')[0]

interface FormData {
  subgroup: string
  notificationsEnabled: boolean
  contacts: Contact[]
}

interface FormErrors {
  subgroup: string
  contacts: string[]
}

interface CreateTopologyGroupProps {
  tenantId?: string
  editingGroup?: GroupTopologyItem
  onClose?: () => void
}

const CreateTopologyGroup = ({
  tenantId: tenantIdProp,
  editingGroup,
  onClose,
}: CreateTopologyGroupProps = {}) => {
  const { id: tenantIdParam } = useParams<{ id?: string }>()
  const tenantId = tenantIdProp ?? tenantIdParam ?? ''
  const isEditMode = !!editingGroup
  const navigate = useNavigate()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { tenant: tenantData } = useSelectedTenant()

  const { data: latestGroups, isLoading: isLoadingLatest } =
    useGetTopologyGroups(tenantId, '')

  const groupsMutation = useCreateTopologyGroupsMutation()

  const [formData, setFormData] = useState<FormData>(() => {
    if (editingGroup) {
      return {
        subgroup: editingGroup.subgroup,
        notificationsEnabled: editingGroup.notifications?.enabled ?? false,
        contacts: editingGroup.notifications?.contacts?.length
          ? editingGroup.notifications.contacts.map((email) => ({
              id: crypto.randomUUID(),
              value: email,
            }))
          : [{ id: crypto.randomUUID(), value: '' }],
      }
    }
    return {
      subgroup: '',
      notificationsEnabled: false,
      contacts: [{ id: crypto.randomUUID(), value: '' }],
    }
  })

  const [errors, setErrors] = useState<FormErrors>({
    subgroup: '',
    contacts: [''],
  })

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const handleSubgroupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setFormData((prev) => ({ ...prev, subgroup: value }))
    if (value.trim()) {
      setErrors((prev) => ({ ...prev, subgroup: '' }))
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
      subgroup: '',
      contacts: formData.contacts.map(() => ''),
    }

    let hasError = false

    if (!formData.subgroup.trim()) {
      newErrors.subgroup = 'Group is required'
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

    const notifications = {
      enabled: formData.notificationsEnabled,
      contacts: getValidContactEmails(formData.contacts),
    }

    const payload = isEditMode
      ? [
          ...(latestGroups ?? []).filter(
            (g) => g.subgroup !== editingGroup.subgroup,
          ),
          {
            ...editingGroup,
            subgroup: formData.subgroup,
            notifications,
            date: today,
          },
        ]
      : [
          ...(latestGroups ?? []),
          {
            date: today,
            group: tenantData?.info.name ?? '',
            type: 'PROJECT',
            subgroup: formData.subgroup,
            notifications,
          },
        ]

    groupsMutation.mutate(
      { tenantId, data: payload },
      {
        onSuccess: () => {
          toast.success(
            isEditMode
              ? 'Topology group updated successfully!'
              : 'Topology group created successfully!',
          )
          if (timerRef.current) {
            clearTimeout(timerRef.current)
          }
          timerRef.current = setTimeout(() => {
            if (onClose) {
              onClose()
            } else {
              navigate(`/tenants/${tenantId}/topology#groups`)
            }
          }, 2000)
        },
        onError: (error) => {
          toast.error(
            `Failed to ${isEditMode ? 'update' : 'create'} topology group: ${error.message}`,
          )
        },
      },
    )
  }

  return (
    <div className="page-container">
      <PageHeader
        title={isEditMode ? 'Edit Topology Group' : 'Add Topology Group'}
        subtitle={
          <>
            {isEditMode
              ? 'Update the topology group for tenant '
              : 'Configure and register a new topology group for tenant '}
            <strong>{tenantData?.info.name ?? '...'}</strong>
          </>
        }
        navigateTo={{
          label: 'Back to Topology',
          to: `/tenants/${tenantId}/topology#groups`,
          onClick: onClose,
        }}
      />

      <div className="flex justify-end items-center mb-4">
        <Button
          variant="primary"
          size="md"
          onClick={handleSubmit}
          disabled={groupsMutation.isPending || isLoadingLatest || !tenantData}
        >
          {groupsMutation.isPending ? (
            <>
              <LoadingSpinner size="xs" />
              Saving...
            </>
          ) : isEditMode ? (
            'Update Group'
          ) : (
            'Add Group'
          )}
        </Button>
      </div>

      {/* Group details */}
      <div className={sectionClass}>
        <div>
          <p className="section-title">Group Details</p>
          <p className="section-description">
            Define the details for this topology entry
          </p>
        </div>
        <div className={sectionContentClass}>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-body mb-1">
              Group <span className="required">*</span>
            </label>
            <input
              type="text"
              name="subgroup"
              value={formData.subgroup}
              onChange={handleSubgroupChange}
              placeholder="Enter group name"
              className={
                errors.subgroup
                  ? '!border-red-500 focus:!border-red-500 focus:!ring-red-500/10'
                  : ''
              }
            />
            {errors.subgroup && (
              <span className="text-xs text-red-500 mt-1">
                {errors.subgroup}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className={sectionClass}>
        <NotificationsSection
          subtitle="group"
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
    </div>
  )
}

export default CreateTopologyGroup
