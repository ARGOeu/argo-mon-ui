import { useState } from 'react'
import { useGetTopologyGroups } from '@/hooks/useTopology'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/16/solid'
import LoadingSpinner from '@/components/LoadingSpinner'
import SelectDropdown from '@/components/SelectDropdown'
import GroupCreationPanel from './GroupCreationPanel'

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
  const [showCreateGroup, setShowCreateGroup] = useState(false)

  const handleToggleCreateGroup = () => {
    setShowCreateGroup((prev) => !prev)
  }

  const handleCreateGroupSuccess = (subgroup: string) => {
    onChange(subgroup)
    setShowCreateGroup(false)
  }

  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-body mb-1">
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
        onClick={handleToggleCreateGroup}
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
        <GroupCreationPanel
          tenantId={tenantId}
          tenantName={tenantName}
          onSuccess={handleCreateGroupSuccess}
          onCancel={() => setShowCreateGroup(false)}
          onGroupSaving={onGroupSaving}
        />
      )}
    </div>
  )
}

export default GroupSelector
