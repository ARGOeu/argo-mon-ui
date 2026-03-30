import { useState } from 'react'
import { toast } from 'sonner'
import { PlusIcon, TrashIcon } from '@heroicons/react/16/solid'
import {
  useCreateTopologyGroupsMutation,
  useGetTopologyGroups,
} from '@/hooks/useTopology'
import Button from '@/components/Button'
import IconButton from '@/components/IconButton'
import LoadingSpinner from '@/components/LoadingSpinner'
import {
  getContactValidationErrors,
  getValidContactEmails,
  isValidEmail,
} from './utils/topologyValidation'
import type { Contact } from './NotificationsSection'

const today = new Date().toISOString().split('T')[0]

interface GroupCreationPanelProps {
  tenantId: string
  tenantName: string
  onSuccess: (subgroup: string) => void
  onCancel: () => void
  onGroupSaving?: (busy: boolean) => void
}

interface GroupCreationState {
  subgroup: string
  subgroupError: string
  notificationsEnabled: boolean
  contacts: Contact[]
  contactErrors: string[]
}

const GroupCreationPanel = ({
  tenantId,
  tenantName,
  onSuccess,
  onCancel,
  onGroupSaving,
}: GroupCreationPanelProps) => {
  const { data: groups } = useGetTopologyGroups(tenantId)
  const groupsMutation = useCreateTopologyGroupsMutation()

  const [groupForm, setGroupForm] = useState<GroupCreationState>({
    subgroup: '',
    subgroupError: '',
    notificationsEnabled: false,
    contacts: [{ id: crypto.randomUUID(), value: '' }],
    contactErrors: [''],
  })

  const resetForm = () => {
    setGroupForm({
      subgroup: '',
      subgroupError: '',
      notificationsEnabled: false,
      contacts: [{ id: crypto.randomUUID(), value: '' }],
      contactErrors: [''],
    })
  }

  const handleCancel = () => {
    resetForm()
    onCancel()
  }

  const handleContactChange = (index: number, value: string) => {
    const updatedContacts = groupForm.contacts.map((contact, i) =>
      i === index ? { ...contact, value } : contact,
    )

    const updatedErrors = [...groupForm.contactErrors]
    updatedErrors[index] =
      !value.trim() || isValidEmail(value) ? '' : 'Invalid email'

    setGroupForm((prev) => ({
      ...prev,
      contacts: updatedContacts,
      contactErrors: updatedErrors,
    }))
  }

  const handleCreateGroupSubmit = () => {
    if (!groupForm.subgroup.trim()) {
      setGroupForm((prev) => ({
        ...prev,
        subgroupError: 'Group is required',
      }))
      return
    }

    if (groupForm.notificationsEnabled) {
      const nextContactErrors = getContactValidationErrors(
        groupForm.contacts,
        true,
      )
      setGroupForm((prev) => ({ ...prev, contactErrors: nextContactErrors }))

      if (nextContactErrors.some((error) => !!error)) {
        return
      }
    }

    const notifications = {
      enabled: groupForm.notificationsEnabled,
      contacts: groupForm.notificationsEnabled
        ? getValidContactEmails(groupForm.contacts)
        : [],
    }

    const payload = [
      ...(groups ?? []),
      {
        date: today,
        group: tenantName,
        type: 'PROJECT',
        subgroup: groupForm.subgroup.trim(),
        notifications,
      },
    ]

    onGroupSaving?.(true)

    groupsMutation.mutate(
      { tenantId, data: payload },
      {
        onSuccess: () => {
          toast.success('Group created successfully!')
          onSuccess(groupForm.subgroup.trim())
          resetForm()
          onGroupSaving?.(false)
        },
        onError: (error) => {
          toast.error(`Failed to create group: ${error.message}`)
          onGroupSaving?.(false)
        },
      },
    )
  }

  return (
    <div className="border border-line rounded-lg px-4 py-3 flex flex-col gap-3 mt-1 animate-fade-in">
      <div className="flex flex-col">
        <label className="text-sm font-medium text-body mb-1.5">
          Group <span className="required">*</span>
        </label>
        <input
          type="text"
          value={groupForm.subgroup}
          onChange={(e) => {
            const value = e.target.value
            setGroupForm((prev) => ({
              ...prev,
              subgroup: value,
              subgroupError: value.trim() ? '' : prev.subgroupError,
            }))
          }}
          placeholder="Enter group name"
          className={
            groupForm.subgroupError
              ? '!border-red-500 focus:!border-red-500 focus:!ring-red-500/10'
              : ''
          }
        />
        {groupForm.subgroupError && (
          <span className="text-xs text-red-500 mt-1">
            {groupForm.subgroupError}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="toggle toggle-brand"
            checked={groupForm.notificationsEnabled}
            onChange={() =>
              setGroupForm((prev) => ({
                ...prev,
                notificationsEnabled: !prev.notificationsEnabled,
              }))
            }
          />
          <p className="text-sm font-semibold text-body">
            {groupForm.notificationsEnabled
              ? 'Notifications enabled'
              : 'Notifications disabled'}
          </p>
        </label>

        {groupForm.notificationsEnabled && (
          <div className="flex flex-col gap-2 animate-fade-in">
            <p className="text-sm font-medium text-body">
              Contact Emails <span className="required">*</span>
            </p>
            {groupForm.contacts.map((contact, index) => (
              <div key={contact.id} className="flex items-start gap-1">
                <div className="flex flex-col flex-1">
                  <input
                    type="email"
                    value={contact.value}
                    onChange={(e) => handleContactChange(index, e.target.value)}
                    placeholder="Enter contact email"
                    className={
                      groupForm.contactErrors[index]
                        ? '!border-red-500 focus:!border-red-500 focus:!ring-red-500/10'
                        : ''
                    }
                  />
                  {groupForm.contactErrors[index] && (
                    <span className="text-xs text-red-500 mt-1">
                      {groupForm.contactErrors[index]}
                    </span>
                  )}
                </div>
                {groupForm.contacts.length > 1 && (
                  <div className="mt-1">
                    <IconButton
                      icon={<TrashIcon className="size-4.5" />}
                      label="Remove contact"
                      onClick={() => {
                        setGroupForm((prev) => ({
                          ...prev,
                          contacts: prev.contacts.filter((_, i) => i !== index),
                          contactErrors: prev.contactErrors.filter(
                            (_, i) => i !== index,
                          ),
                        }))
                      }}
                      className="text-red-600 hover:bg-red-50"
                    />
                  </div>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setGroupForm((prev) => ({
                  ...prev,
                  contacts: [
                    ...prev.contacts,
                    { id: crypto.randomUUID(), value: '' },
                  ],
                  contactErrors: [...prev.contactErrors, ''],
                }))
              }}
              className="flex items-center gap-1.5 text-sm text-brand hover:text-brand-strong transition-colors w-fit cursor-pointer"
            >
              <PlusIcon className="size-4" />
              Add another email
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          size="sm"
          onClick={handleCreateGroupSubmit}
          disabled={groupsMutation.isPending}
        >
          {groupsMutation.isPending ? (
            <>
              <LoadingSpinner size="xs" />
              Creating...
            </>
          ) : (
            'Create Group'
          )}
        </Button>
        <button
          type="button"
          onClick={handleCancel}
          className="text-sm text-muted hover:text-body transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default GroupCreationPanel
