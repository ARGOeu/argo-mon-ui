import { useState, useEffect } from 'react'
import { useCreateTenantInvitation } from '@/hooks/useInvitations'
import { useGetRoles } from '@/hooks/useSecuredEndpoints'
import { toast } from 'sonner'
import Button from '@/components/Button'
import SelectDropdown from '@/components/SelectDropdown'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface InviteTabProps {
  tenantId: string
}

const InviteTab = ({ tenantId }: InviteTabProps) => {
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: '',
  })
  const [errors, setErrors] = useState({ email: '' })

  const createInvitationMutation = useCreateTenantInvitation()
  const { data: rolesData, isLoading: rolesLoading } = useGetRoles(1, 100)

  const roleOptions =
    rolesData?.content.map((r) => ({
      label: r.attributes?.preferred_name?.[0] ?? r.name,
      value: r.name,
    })) ?? []

  useEffect(() => {
    if (rolesData?.content.length && !inviteForm.role) {
      setInviteForm((prev) => ({
        ...prev,
        role: rolesData.content[0].name,
      }))
    }
  }, [rolesData, inviteForm.role])

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target

    setInviteForm((prev) => ({ ...prev, email: value }))

    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, email: 'Email is required' }))
    } else if (!emailRegex.test(value)) {
      setErrors((prev) => ({ ...prev, email: 'Invalid email format' }))
    } else {
      setErrors((prev) => ({ ...prev, email: '' }))
    }
  }

  const handleRoleChange = (value: string) => {
    setInviteForm((prev) => ({ ...prev, role: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!inviteForm.email.trim()) {
      setErrors({ email: 'Email is required' })
      return
    }

    if (!emailRegex.test(inviteForm.email)) {
      setErrors({ email: 'Invalid email format' })
      return
    }

    if (!tenantId) {
      toast.error('Tenant ID is missing')
      return
    }

    createInvitationMutation.mutate(
      { tenantId, data: { email: inviteForm.email, role: inviteForm.role } },
      {
        onSuccess: () => {
          toast.success('Invitation sent successfully!')
          setInviteForm({ email: '', role: rolesData?.content[0]?.name ?? '' })
          setErrors({ email: '' })
        },
        onError: (error) => {
          toast.error(`Failed to send invitation: ${error.message}`)
        },
      },
    )
  }

  return (
    <div className="animate-fade-in">
      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="bg-surface-muted rounded-lg">
          <p className="text-sm text-muted mb-2 leading-relaxed">
            Send an invitation to a new member to join this tenant. They will
            receive an email with instructions to accept the invitation.
          </p>

          <div className="max-w-[400px] flex flex-col gap-2 mb-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-body mb-0.5">
                Email Address <span className="required">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={inviteForm.email}
                onChange={handleFormChange}
                placeholder="Enter email address to invite..."
                className={
                  errors.email
                    ? '!border-red-500 focus:!border-red-500 focus:!ring-red-500/10'
                    : ''
                }
              />
              {errors.email && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-body mb-0.5">
                Role <span className="required">*</span>
              </label>
              <SelectDropdown
                value={inviteForm.role}
                onChange={handleRoleChange}
                options={roleOptions}
                disabled={rolesLoading}
              />
            </div>
          </div>

          <div className="flex justify-start pb-1">
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={
                !inviteForm.email.trim() ||
                !!errors.email ||
                !inviteForm.role ||
                createInvitationMutation.isPending
              }
            >
              Send Invitation
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default InviteTab
