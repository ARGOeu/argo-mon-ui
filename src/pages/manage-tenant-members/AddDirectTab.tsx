import { useState, useEffect } from 'react'
import { useGetMembers, useAddMemberDirectly } from '@/hooks/useTenants'
import { XMarkIcon } from '@heroicons/react/16/solid'
import { toast } from 'sonner'
import Button from '@/components/Button'
import SelectDropdown from '@/components/SelectDropdown'
import LoadingSpinner from '@/components/LoadingSpinner'
import type { InvitationRole } from '@/types/invitations'

const roleOptions = [
  { label: 'Tenant Admin', value: 'admin' as InvitationRole },
  { label: 'Member', value: 'viewer' as InvitationRole },
]

interface AddDirectTabProps {
  tenantId: string
}

const AddDirectTab = ({ tenantId }: AddDirectTabProps) => {
  const [addDirectForm, setAddDirectForm] = useState<{
    username: string
    email: string
    role: InvitationRole
  }>({ username: '', email: '', role: 'viewer' as InvitationRole })
  const [addDirectErrors, setAddDirectErrors] = useState({ search: '' })
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedUser, setSelectedUser] = useState<{
    email: string
    firstName: string
    lastName: string
  } | null>(null)

  const { data: searchResults, isLoading: searchLoading } = useGetMembers(
    1,
    5,
    searchQuery,
    !!searchQuery && showSearchResults,
  )

  const addMemberDirectlyMutation = useAddMemberDirectly()

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchInput])

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target

    setSearchInput(value)
    setShowSearchResults(true)
    if (!value.trim()) {
      setShowSearchResults(false)
      setAddDirectErrors((prev) => ({ ...prev, search: '' }))
    }
  }

  const handleRoleChange = (value: string) => {
    setAddDirectForm((prev) => ({ ...prev, role: value as InvitationRole }))
  }

  const handleUserSelect = (user: {
    username: string
    email: string
    firstName: string
    lastName: string
  }) => {
    setSelectedUser(user)
    setAddDirectForm({
      username: user.username,
      email: user.email,
      role: addDirectForm.role,
    })
    setSearchInput('')
    setShowSearchResults(false)
    setAddDirectErrors({ search: '' })
  }

  const handleClearSelectedUser = () => {
    setSelectedUser(null)
    setAddDirectForm({ username: '', email: '', role: addDirectForm.role })
    setSearchInput('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUser) {
      setAddDirectErrors({ search: 'Please select a user' })
      return
    }

    if (!tenantId) {
      toast.error('Tenant ID is missing')
      return
    }

    addMemberDirectlyMutation.mutate(
      {
        tenantId,
        data: {
          username: addDirectForm.username,
          email: addDirectForm.email,
          role: addDirectForm.role,
        },
      },
      {
        onSuccess: () => {
          toast.success('Member added successfully!')
          setAddDirectForm({ username: '', email: '', role: 'viewer' })
          setSelectedUser(null)
          setSearchInput('')
          setAddDirectErrors({ search: '' })
        },
        onError: (error) => {
          toast.error(`Failed to add member: ${error.message}`)
        },
      },
    )
  }

  return (
    <div className="animate-fade-in">
      <form onSubmit={handleSubmit} className="max-w-xl">
        <div className="bg-surface-muted border border-line rounded-lg px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-2.5">
            Add a Member Directly
          </h2>
          <p className="text-sm text-muted mb-6 leading-relaxed">
            Add a new member directly to this tenant without sending an
            invitation. Search for a registered user by email or name.
          </p>

          <div className="max-w-[400px] flex flex-col gap-5 mb-6">
            {!selectedUser ? (
              <div className="flex flex-col">
                <label className="text-sm font-medium text-body mb-1.5">
                  Search User <span className="required">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="search"
                    value={searchInput}
                    onChange={handleFormChange}
                    placeholder="Search by email or name..."
                    className={
                      addDirectErrors.search
                        ? '!border-red-500 focus:!border-red-500 focus:!ring-red-500/10 w-full'
                        : 'w-full'
                    }
                    autoComplete="off"
                  />
                  {addDirectErrors.search && (
                    <span className="text-xs text-red-500 mt-1">
                      {addDirectErrors.search}
                    </span>
                  )}

                  {showSearchResults && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-line-strong rounded-lg mt-1 max-h-[300px] overflow-y-auto shadow-md z-10">
                      {searchLoading ? (
                        <div className="flex items-center justify-center gap-2 p-4 text-muted text-sm">
                          <LoadingSpinner size="sm" />
                          <span>Searching...</span>
                        </div>
                      ) : searchResults && searchResults.content.length > 0 ? (
                        <ul className="list-none m-0 p-0">
                          {searchResults.content.map((user) => (
                            <li
                              key={user.id}
                              className="px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 hover:bg-surface-muted last:border-b-0"
                              onClick={() => handleUserSelect(user)}
                            >
                              <div className="flex flex-col gap-1">
                                <span className="text-sm font-semibold text-foreground">
                                  {user.firstName} {user.lastName}
                                </span>
                                <span className="text-xs text-muted">
                                  {user.email}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="p-4 text-center text-subtle text-sm italic">
                          No users found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <label className="text-sm font-medium text-body mb-1.5">
                  Selected User
                </label>
                <div className="flex items-center justify-between px-4 py-3 bg-surface-muted border border-line rounded-lg">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-foreground">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </span>
                    <span className="text-xs text-muted">
                      {selectedUser.email}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearSelectedUser}
                    className="flex items-center justify-center p-1 bg-transparent border-none rounded-md text-muted cursor-pointer transition-all hover:bg-gray-200 hover:text-body"
                    aria-label="Clear selected user"
                  >
                    <XMarkIcon className="size-5" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col">
              <label className="text-sm font-medium text-body mb-1.5">
                Role <span className="required">*</span>
              </label>
              <SelectDropdown
                value={addDirectForm.role}
                onChange={handleRoleChange}
                options={roleOptions}
              />
            </div>
          </div>

          <div className="flex justify-start pb-1">
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={!selectedUser || addMemberDirectlyMutation.isPending}
            >
              Add Member
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default AddDirectTab
