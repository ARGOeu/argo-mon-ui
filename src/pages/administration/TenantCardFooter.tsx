import {
  PencilSquareIcon,
  TrashIcon,
  PlusCircleIcon,
  UserGroupIcon,
  Bars3Icon,
  Square3Stack3DIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/16/solid'
import IconButton from '@/components/IconButton'

const actionIconClass = 'size-4.5 min-[940px]:size-5'

interface TenantCardFooterProps {
  isSuperAdmin: boolean
  isAdmin: boolean
  tenantId: string
  onDelete: () => void
}

const TenantCardFooter = ({
  isSuperAdmin,
  isAdmin,
  tenantId,
  onDelete,
}: TenantCardFooterProps) => (
  <>
    <IconButton
      label="View Tenant Details"
      icon={<Bars3Icon className={actionIconClass} />}
      href={`/tenants/${tenantId}/details`}
      className="text-indigo-500 hover:bg-indigo-100"
    />

    {(isSuperAdmin || isAdmin) && (
      <IconButton
        label="Edit Tenant"
        icon={<PencilSquareIcon className={actionIconClass} />}
        href={`/tenants/${tenantId}/edit?returnTo=panel`}
        className="text-muted hover:bg-gray-200"
      />
    )}

    {!isSuperAdmin && (
      <IconButton
        label="View Assigned Projects"
        icon={<ClipboardDocumentListIcon className={actionIconClass} />}
        href={`/tenants/${tenantId}/projects/assign`}
        className="text-blue-600 hover:bg-brand-muted"
      />
    )}

    {isSuperAdmin && (
      <IconButton
        label="Assign Projects"
        icon={<PlusCircleIcon className={actionIconClass} />}
        href={`/tenants/${tenantId}/projects/assign`}
        className="text-blue-600 hover:bg-brand-muted"
      />
    )}

    {(isSuperAdmin || isAdmin) && (
      <IconButton
        label="Capabilities"
        icon={<Square3Stack3DIcon className={actionIconClass} />}
        href={`/tenants/${tenantId}/details#capabilities`}
        className="text-amber-600 hover:bg-amber-50"
      />
    )}

    {(isSuperAdmin || isAdmin) && (
      <IconButton
        label="Manage Members"
        icon={<UserGroupIcon className={actionIconClass} />}
        href={`/tenants/${tenantId}/details#members`}
        className="text-violet-700 hover:bg-violet-100"
      />
    )}

    {isSuperAdmin && (
      <IconButton
        label="Delete Tenant"
        icon={<TrashIcon className={actionIconClass} />}
        onClick={onDelete}
        className="text-red-600 hover:bg-red-50"
      />
    )}
  </>
)

export default TenantCardFooter
