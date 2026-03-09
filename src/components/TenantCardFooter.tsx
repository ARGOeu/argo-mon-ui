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

const actionButtonBase =
  'p-1 min-[940px]:p-1.5 rounded-lg transition-all cursor-pointer border-none bg-transparent tooltip'

const actionIconClass = 'size-4 min-[940px]:size-5'

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
    <button
      aria-label="View Tenant Details"
      className={`${actionButtonBase} text-indigo-500 hover:bg-indigo-100`}
      data-tip="View Tenant Details"
      onClick={onViewDetails}
    >
      <Bars3Icon className={actionIconClass} />
    </button>

    {(isSuperAdmin || isAdmin) && (
      <>
        <button
          aria-label="Edit Tenant"
          className={`${actionButtonBase} text-muted hover:bg-gray-200`}
          data-tip="Edit Tenant"
          onClick={onEdit}
        >
          <PencilSquareIcon className={actionIconClass} />
        </button>
        <button
          aria-label="Manage Members"
          className={`${actionButtonBase} text-violet-700 hover:bg-violet-100`}
          data-tip="Manage Members"
          onClick={onManageMembers}
        >
          <UserGroupIcon className={actionIconClass} />
        </button>
      </>
    )}

    {!isSuperAdmin && (
      <button
        aria-label="View Assigned Projects"
        className={`${actionButtonBase} text-blue-600 hover:bg-brand-muted`}
        data-tip="View Assigned Projects"
        onClick={onAssignProjects}
      >
        <ClipboardDocumentListIcon className={actionIconClass} />
      </button>
    )}

    {isSuperAdmin && (
      <button
        aria-label="Assign Projects"
        className={`${actionButtonBase} text-blue-600 hover:bg-brand-muted`}
        data-tip="Assign Projects"
        onClick={onAssignProjects}
      >
        <PlusCircleIcon className={actionIconClass} />
      </button>
    )}

    {(isSuperAdmin || isAdmin) && (
      <>
        <button
          aria-label="View Status"
          className={`${actionButtonBase} text-emerald-600 hover:bg-green-50`}
          data-tip="View Status"
          onClick={onViewStatus}
        >
          <ListBulletIcon className={actionIconClass} />
        </button>
        <button
          aria-label="Check Readiness"
          className={`${actionButtonBase} text-cyan-600 hover:bg-cyan-50`}
          data-tip="Check Readiness"
          onClick={onReadiness}
        >
          <ShieldCheckIcon className={actionIconClass} />
        </button>
        <button
          aria-label="Capabilities"
          className={`${actionButtonBase} text-amber-600 hover:bg-amber-50`}
          data-tip="Capabilities"
          onClick={onCapabilities}
        >
          <Square3Stack3DIcon className="w-[1.3rem]" />
        </button>
      </>
    )}

    {isSuperAdmin && (
      <button
        aria-label="Delete Tenant"
        className={`${actionButtonBase} text-red-600 hover:bg-red-50`}
        data-tip="Delete Tenant"
        onClick={onDelete}
      >
        <TrashIcon className={actionIconClass} />
      </button>
    )}
  </>
)

export default TenantCardFooter
