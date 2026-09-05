import { useState } from 'react'
import { useGetTenantMembers } from '@/hooks/useTenants'
import { useRevokeRoleMutation } from '@/hooks/useResources'
import { useRoleFriendlyName } from '@/hooks/useRoleFriendlyName'
import { roleBadgeClass } from '@/utils/badges'
import { TENANT_MEMBERSHIP_ENTITY } from '@/utils/memberships'
import { UserMinusIcon } from '@heroicons/react/16/solid'
import { toast } from 'sonner'
import ConfirmDialog from '@/components/ConfirmDialog'
import IconButton from '@/components/IconButton'
import DataTable, { thBase, tdBase } from '@/components/DataTable'
import Pagination from '@/components/Pagination'
import Badge from '@/components/Badge'
import LoadingSpinner from '@/components/LoadingSpinner'

const pageSize = 10

interface MembersTabProps {
  tenantId: string
  tenantName: string
}

const MembersTab = ({ tenantId, tenantName }: MembersTabProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<{
    id: string
    email: string
    role: string
    displayName: string
  } | null>(null)

  const getRoleFriendlyName = useRoleFriendlyName()

  const { data: membersData, isLoading } = useGetTenantMembers(
    tenantId,
    currentPage,
    pageSize,
    !!tenantId,
  )

  const revokeRoleMutation = useRevokeRoleMutation()

  const membershipRows =
    membersData?.content.flatMap((member) =>
      (member.memberships?.[TENANT_MEMBERSHIP_ENTITY] ?? [])?.map(
        (membership, index) => ({ member, membership, index }),
      ),
    ) ?? []

  const handleRemoveClick = (
    memberId: string,
    memberEmail: string,
    memberRole: string,
    displayName: string,
  ) => {
    setMemberToRemove({
      id: memberId,
      email: memberEmail,
      role: memberRole,
      displayName,
    })
    setRemoveDialogOpen(true)
  }

  const handleRemoveConfirm = () => {
    if (!tenantId || !memberToRemove) return

    revokeRoleMutation.mutate(
      {
        api_resource: 'Tenant',
        resource_id: tenantId,
        role: memberToRemove.role,
        member_id: memberToRemove.id,
      },
      {
        onSuccess: () => {
          toast.success('Member removed successfully!')
          setRemoveDialogOpen(false)
          setMemberToRemove(null)
          if (membershipRows.length === 1 && currentPage > 1) {
            setCurrentPage((prev) => prev - 1)
          }
        },
        onError: (error) => {
          toast.error(`Failed to remove member: ${error.message}`)
        },
      },
    )
  }

  const handleRemoveCancel = () => {
    setRemoveDialogOpen(false)
    setMemberToRemove(null)
  }

  return (
    <>
      <DataTable tableClassName="min-w-[700px]">
        <thead className="bg-surface-strong border-b border-line">
          <tr>
            <th className={thBase}>First Name</th>
            <th className={thBase}>Last Name</th>
            <th className={thBase}>Email</th>
            <th className={thBase}>Role</th>
            <th className={thBase}>Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {isLoading ? (
            <tr>
              <td colSpan={5}>
                <div className="flex items-center justify-center py-6">
                  <LoadingSpinner />
                </div>
              </td>
            </tr>
          ) : membershipRows.length > 0 ? (
            membershipRows.map(({ member, membership, index }) => (
              <tr
                key={`${member.id}-${membership.role}-${index}`}
                className="hover:bg-surface-muted"
              >
                <td className={tdBase}>{member.firstName || '-'}</td>
                <td className={tdBase}>{member.lastName || '-'}</td>
                <td className={tdBase}>{member.email}</td>
                <td className={tdBase}>
                  <Badge
                    className={
                      roleBadgeClass[membership.role] ??
                      'bg-surface-strong text-muted'
                    }
                  >
                    {getRoleFriendlyName(membership.role)}
                  </Badge>
                </td>
                <td className={`${tdBase} px-6`}>
                  <IconButton
                    icon={<UserMinusIcon className="size-5" />}
                    label="Remove member"
                    onClick={() =>
                      handleRemoveClick(
                        member.id,
                        member.email,
                        membership.role,
                        getRoleFriendlyName(membership.role),
                      )
                    }
                    className="text-red-500 hover:bg-red-50"
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center !text-subtle italic !p-8">
                No members found for this tenant
              </td>
            </tr>
          )}
        </tbody>
      </DataTable>

      {membershipRows.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={membersData?.total_pages ?? 0}
          totalElements={membersData?.total_elements ?? 0}
          itemLabel="members"
          onPrev={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          onNext={() =>
            setCurrentPage((prev) =>
              Math.min(membersData?.total_pages ?? 1, prev + 1),
            )
          }
        />
      )}

      <ConfirmDialog
        isOpen={removeDialogOpen}
        title="Remove Member"
        message={
          memberToRemove ? (
            <>
              Are you sure you want to revoke the{' '}
              <strong>{memberToRemove.displayName}</strong> role from{' '}
              <strong>{memberToRemove.email}</strong> in tenant{' '}
              <strong>{tenantName}</strong>?
              <br />
              <span className="text-amber-600 font-medium">
                The user will lose all permissions associated with this role.
              </span>
            </>
          ) : (
            ''
          )
        }
        confirmLabel="Remove"
        cancelLabel="Cancel"
        onConfirm={handleRemoveConfirm}
        onCancel={handleRemoveCancel}
      />
    </>
  )
}

export default MembersTab
