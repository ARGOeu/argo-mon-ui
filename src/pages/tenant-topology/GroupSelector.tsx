import { useState } from 'react'
import {
  useGetTopologyGroups,
  useCreateTopologyGroupsMutation,
} from '@/hooks/useTopology'
import {
  PlusIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/16/solid'
import { toast } from 'sonner'
import Button from '@/components/Button'
import IconButton from '@/components/IconButton'
import LoadingSpinner from '@/components/LoadingSpinner'
import SelectDropdown from '@/components/SelectDropdown'
import type { Contact } from './NotificationsSection'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const today = new Date().toISOString().split('T')[0]

interface GroupSelectorProps {
  tenantId: string
  tenantName: string
  value: string
  onChange: (value: string) => void
  error?: string
  onGroupSaving?: (busy: boolean) => void
}

const GroupSelector = ({
  tenantId,
  tenantName,
  value,
  onChange,
  error,
  onGroupSaving,
}: GroupSelectorProps) => {
  const { data: groups, isLoading: isLoadingGroups } =
    useGetTopologyGroups(tenantId)
  const groupsMutation = useCreateTopologyGroupsMutation()

  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [newGroupSubgroup, setNewGroupSubgroup] = useState('')
  const [newGroupSubgroupError, setNewGroupSubgroupError] = useState('')
  const [newGroupNotificationsEnabled, setNewGroupNotificationsEnabled] =
    useState(false)
  const [newGroupContacts, setNewGroupContacts] = useState<Contact[]>([
    { id: crypto.randomUUID(), value: '' },
  ])
  const [newGroupContactErrors, setNewGroupContactErrors] = useState<string[]>([
    '',
  ])

  const resetCreateGroup = () => {
    setShowCreateGroup(false)
    setNewGroupSubgroup('')
    setNewGroupSubgroupError('')
    setNewGroupNotificationsEnabled(false)
    setNewGroupContacts([{ id: crypto.randomUUID(), value: '' }])
    setNewGroupContactErrors([''])
  }

  const handleContactChange = (index: number, val: string) => {
    setNewGroupContacts((prev) =>
      prev.map((c, i) => (i === index ? { ...c, value: val } : c)),
    )
    const updated = [...newGroupContactErrors]
    updated[index] = !val.trim() || emailRegex.test(val) ? '' : 'Invalid email'
    setNewGroupContactErrors(updated)
  }

  const handleCreateGroupSubmit = () => {
    if (!newGroupSubgroup.trim()) {
      setNewGroupSubgroupError('Subgroup is required')
      return
    }

    if (newGroupNotificationsEnabled) {
      const nextContactErrors: string[] = newGroupContacts.map((contact) => {
        if (!contact.value.trim()) {
          return ''
        }

        return emailRegex.test(contact.value) ? '' : 'Invalid email'
      })

      const hasValidContact = newGroupContacts.some(
        (contact) => contact.value.trim() && emailRegex.test(contact.value),
      )
      if (!hasValidContact) {
        nextContactErrors[0] = 'At least one valid email is required'
      }

      setNewGroupContactErrors(nextContactErrors)

      const hasContactError = nextContactErrors.some((error) => !!error)
      if (hasContactError) {
        return
      }
    }

    const notifications = {
      enabled: newGroupNotificationsEnabled,
      contacts: newGroupNotificationsEnabled
        ? newGroupContacts
            .filter((c) => c.value.trim() && emailRegex.test(c.value))
            .map((c) => c.value)
        : [],
    }
    const payload = [
      ...(groups ?? []),
      {
        date: today,
        group: tenantName,
        type: 'PROJECT',
        subgroup: newGroupSubgroup.trim(),
        notifications,
      },
    ]
    onGroupSaving?.(true)
    groupsMutation.mutate(
      { tenantId, data: payload },
      {
        onSuccess: () => {
          toast.success('Group created successfully!')
          onChange(newGroupSubgroup.trim())
          resetCreateGroup()
          onGroupSaving?.(false)
        },
        onError: (err) => {
          toast.error(`Failed to create group: ${err.message}`)
          onGroupSaving?.(false)
        },
      },
    )
  }

  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-body mb-1.5">
        Group <span className="required">*</span>
      </label>

      {isLoadingGroups ? (
        <div className="flex items-center gap-2 text-sm text-muted py-2">
          <LoadingSpinner size="xs" />
          Loading groups...
        </div>
      ) : (
        <SelectDropdown
          value={value}
          onChange={onChange}
          options={(groups ?? []).map((g) => ({
            value: g.subgroup,
            label: g.subgroup,
          }))}
          placeholder={groups?.length ? 'Select a group...' : 'No groups yet'}
          disabled={!groups?.length}
          searchable
        />
      )}

      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}

      <button
        type="button"
        onClick={() =>
          showCreateGroup ? resetCreateGroup() : setShowCreateGroup(true)
        }
        className="flex items-center gap-1 text-sm text-brand hover:text-brand-strong transition-colors w-fit cursor-pointer mt-2"
      >
        {showCreateGroup ? (
          <>
            <ChevronUpIcon className="size-4" />
            Cancel new group
          </>
        ) : (
          <>
            <ChevronDownIcon className="size-4" />
            Create new group
          </>
        )}
      </button>

      {showCreateGroup && (
        <div className="border border-line rounded-lg px-4 py-3 flex flex-col gap-3 mt-1 animate-fade-in">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-body mb-1.5">
              Subgroup <span className="required">*</span>
            </label>
            <input
              type="text"
              value={newGroupSubgroup}
              onChange={(e) => {
                setNewGroupSubgroup(e.target.value)
                if (e.target.value.trim()) setNewGroupSubgroupError('')
              }}
              placeholder="Enter subgroup name"
              className={
                newGroupSubgroupError
                  ? '!border-red-500 focus:!border-red-500 focus:!ring-red-500/10'
                  : ''
              }
            />
            {newGroupSubgroupError && (
              <span className="text-xs text-red-500 mt-1">
                {newGroupSubgroupError}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="toggle toggle-brand"
                checked={newGroupNotificationsEnabled}
                onChange={() =>
                  setNewGroupNotificationsEnabled((prev) => !prev)
                }
              />
              <p className="text-sm font-semibold text-body">
                {newGroupNotificationsEnabled
                  ? 'Notifications enabled'
                  : 'Notifications disabled'}
              </p>
            </label>

            {newGroupNotificationsEnabled && (
              <div className="flex flex-col gap-2 animate-fade-in">
                <p className="text-sm font-medium text-body">
                  Contact Emails <span className="required">*</span>
                </p>
                {newGroupContacts.map((contact, index) => (
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
                          newGroupContactErrors[index]
                            ? '!border-red-500 focus:!border-red-500 focus:!ring-red-500/10'
                            : ''
                        }
                      />
                      {newGroupContactErrors[index] && (
                        <span className="text-xs text-red-500 mt-1">
                          {newGroupContactErrors[index]}
                        </span>
                      )}
                    </div>
                    {newGroupContacts.length > 1 && (
                      <div className="mt-1">
                        <IconButton
                          icon={<TrashIcon className="size-4.5" />}
                          label="Remove contact"
                          onClick={() =>
                            setNewGroupContacts((prev) =>
                              prev.filter((_, i) => i !== index),
                            )
                          }
                          className="text-red-600 hover:bg-red-50"
                        />
                      </div>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setNewGroupContacts((prev) => [
                      ...prev,
                      { id: crypto.randomUUID(), value: '' },
                    ])
                    setNewGroupContactErrors((prev) => [...prev, ''])
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
              onClick={resetCreateGroup}
              className="text-sm text-muted hover:text-body transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default GroupSelector
