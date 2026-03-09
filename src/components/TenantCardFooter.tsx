import {
  PencilSquareIcon,
  TrashIcon,
  PlusCircleIcon,
  ListBulletIcon,
  UserGroupIcon,
  Bars3Icon,
  ShieldCheckIcon,
  Square3Stack3DIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/16/solid'
import IconButton from '@/components/IconButton'

const actionIconClass = 'size-4.5 min-[940px]:size-5'

interface TenantCardFooterProps {
  isSuperAdmin: boolean
  isAdmin: boolean
  onViewDetails: () => void
  onEdit: () => void
  onManageMembers: () => void
  onAssignProjects: () => void
  onViewStatus: () => void
  onReadiness: () => void
  onCapabilities: () => void
  onDelete: () => void
}

const TenantCardFooter = ({
  isSuperAdmin,
  isAdmin,
  onViewDetails,
  onEdit,
  onManageMembers,
  onAssignProjects,
  onViewStatus,
  onReadiness,
  onCapabilities,
  onDelete,
}: TenantCardFooterProps) => (
  <>
    <IconButton
      label="View Tenant Details"
      icon={<Bars3Icon className={actionIconClass} />}
      onClick={onViewDetails}
      className="text-indigo-500 hover:bg-indigo-100"
    />

    {(isSuperAdmin || isAdmin) && (
      <>
        <IconButton
          label="Edit Tenant"
          icon={<PencilSquareIcon className={actionIconClass} />}
          onClick={onEdit}
          className="text-muted hover:bg-gray-200"
        />
        <IconButton
          label="Manage Members"
          icon={<UserGroupIcon className={actionIconClass} />}
          onClick={onManageMembers}
          className="text-violet-700 hover:bg-violet-100"
        />
      </>
    )}

    {!isSuperAdmin && (
      <IconButton
        label="View Assigned Projects"
        icon={<ClipboardDocumentListIcon className={actionIconClass} />}
        onClick={onAssignProjects}
        className="text-blue-600 hover:bg-brand-muted"
      />
    )}

    {isSuperAdmin && (
      <IconButton
        label="Assign Projects"
        icon={<PlusCircleIcon className={actionIconClass} />}
        onClick={onAssignProjects}
        className="text-blue-600 hover:bg-brand-muted"
      />
    )}

    {(isSuperAdmin || isAdmin) && (
      <>
        <IconButton
          label="View Status"
          icon={<ListBulletIcon className={actionIconClass} />}
          onClick={onViewStatus}
          className="text-emerald-600 hover:bg-green-50"
        />
        <IconButton
          label="Check Readiness"
          icon={<ShieldCheckIcon className={actionIconClass} />}
          onClick={onReadiness}
          className="text-cyan-600 hover:bg-cyan-50"
        />
        <IconButton
          label="Capabilities"
          icon={<Square3Stack3DIcon className={actionIconClass} />}
          onClick={onCapabilities}
          className="text-amber-600 hover:bg-amber-50"
        />
      </>
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
