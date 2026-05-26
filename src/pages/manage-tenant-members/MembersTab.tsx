import { useState } from 'react'
import { useGetTenantMembers } from '@/hooks/useTenants'
import { useRevokeRoleMutation } from '@/hooks/useResources'
import { UserMinusIcon } from '@heroicons/react/16/solid'
import { toast } from 'sonner'
import ConfirmDialog from '@/components/ConfirmDialog'
import IconButton from '@/components/IconButton'
import DataTable, { thBase, tdBase } from '@/components/DataTable'
import Pagination from '@/components/Pagination'
import Badge from '@/components/Badge'
import LoadingSpinner from '@/components/LoadingSpinner'
import { roleBadgeClass } from '@/utils/badges'

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
  } | null>(null)

  const { data: membersData, isLoading } = useGetTenantMembers(
    tenantId,
    currentPage,
    pageSize,
    !!tenantId,
  )

  const revokeRoleMutation = useRevokeRoleMutation()

  const handleRemoveClick = (
    memberId: string,
    memberEmail: string,
    memberRole: string,
  ) => {
    setMemberToRemove({
      id: memberId,
      email: memberEmail,
      role: memberRole,
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
          if (membersData?.content.length === 1 && currentPage > 1) {
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
      <div className="animate-fade-in mb-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-2.5">
          Tenant Members
        </h2>

        {isLoading ? (
          <div className="loading-container">
            <LoadingSpinner />
          </div>
        ) : (
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
                {membersData?.content && membersData.content.length > 0 ? (
                  membersData.content.flatMap((member) => {
                    const tenantRoles =
                      member.tenants?.filter((t) => t.name === tenantName) ?? []
                    return tenantRoles.map((tenantInfo) => (
                      <tr
                        key={`${member.id}-${tenantInfo.role}`}
                        className="hover:bg-surface-muted"
                      >
                        <td className={tdBase}>{member.firstName || '-'}</td>
                        <td className={tdBase}>{member.lastName || '-'}</td>
                        <td className={tdBase}>{member.email}</td>
                        <td className={tdBase}>
                          <Badge
                            className={
                              roleBadgeClass[tenantInfo.role] ??
                              'bg-surface-strong text-muted'
                            }
                          >
                            {tenantInfo.role}
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
                                tenantInfo.role,
                              )
                            }
                            className="text-red-500 hover:bg-red-50"
                          />
                        </td>
                      </tr>
                    ))
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center !text-subtle italic !p-8"
                    >
                      No members found for this tenant
                    </td>
                  </tr>
                )}
              </tbody>
            </DataTable>

            {membersData?.content && membersData.content.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={membersData.total_pages}
                totalElements={membersData.total_elements}
                itemLabel="members"
                className="py-1 my-4"
                onPrev={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                onNext={() =>
                  setCurrentPage((prev) =>
                    Math.min(membersData.total_pages, prev + 1),
                  )
                }
              />
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={removeDialogOpen}
        title="Remove Member"
        message={
          memberToRemove ? (
            <>
              Are you sure you want to revoke the{' '}
              <strong>{memberToRemove.role}</strong> role from{' '}
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
