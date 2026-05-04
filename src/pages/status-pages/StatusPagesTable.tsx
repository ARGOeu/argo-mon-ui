import {
  ArrowTopRightOnSquareIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/16/solid'
import DataTable, { thBase, tdBase } from '@/components/DataTable'
import ErrorDisplay from '@/components/ErrorDisplay'
import IconButton from '@/components/IconButton'
import LoadingSpinner from '@/components/LoadingSpinner'
import type { Page, UserPages } from '@/types/pages'

interface StatusPagesTableProps {
  data: Page | UserPages | undefined
  isLoading: boolean
  error: Error | null
  isAllSelected: boolean
  embedded?: boolean
  onView: (slug: string) => void
  onEdit: (id: string | undefined, tenantId: string | undefined) => void
  onDeleteClick: (
    id: string | undefined,
    name: string,
    tenantId: string | undefined,
  ) => void
}

const StatusPagesTable = ({
  data,
  isLoading,
  error,
  isAllSelected,
  embedded,
  onView,
  onEdit,
  onDeleteClick,
}: StatusPagesTableProps) => {
  const colSpan = isAllSelected ? 6 : 5
  const emptyMessage = isAllSelected
    ? 'No status pages found'
    : 'No status pages found for this tenant'

  const thead = (
    <thead className="bg-surface-strong border-b border-line">
      <tr>
        <th className={`${thBase} ${isAllSelected ? 'w-[18%]' : 'w-[22%]'}`}>
          Name
        </th>
        <th className={`${thBase} ${isAllSelected ? 'w-[18%]' : 'w-[22%]'}`}>
          Path
        </th>
        <th className={`${thBase} ${isAllSelected ? 'w-[15%]' : 'w-[18%]'}`}>
          Report
        </th>
        {isAllSelected && <th className={`${thBase} w-[17%]`}>Tenant Name</th>}
        <th className={`${thBase} ${isAllSelected ? 'w-[15%]' : 'w-[18%]'}`}>
          Updated
        </th>
        <th className={`${thBase} w-[15%]`}>Actions</th>
      </tr>
    </thead>
  )

  let tbody: React.ReactNode

  if (isLoading) {
    tbody = (
      <tbody>
        <tr>
          <td colSpan={colSpan}>
            <div className="flex items-center justify-center py-10">
              <LoadingSpinner />
            </div>
          </td>
        </tr>
      </tbody>
    )
  } else if (error) {
    tbody = (
      <tbody>
        <tr>
          <td colSpan={colSpan}>
            <div className="px-6 py-4">
              <ErrorDisplay error={error} context="status pages" />
            </div>
          </td>
        </tr>
      </tbody>
    )
  } else if (!data?.content || data.content.length === 0) {
    tbody = (
      <tbody>
        <tr>
          <td
            colSpan={colSpan}
            className="text-center text-subtle italic py-8 px-4 text-sm"
          >
            {emptyMessage}
          </td>
        </tr>
      </tbody>
    )
  } else {
    tbody = (
      <tbody className="divide-y divide-gray-200">
        {data.content.map((item) => (
          <tr
            key={item.id}
            className="hover:bg-surface-muted transition-colors"
          >
            <td className={tdBase}>
              <span className="text-foreground break-words">{item.name}</span>
            </td>
            <td className={tdBase}>
              <span className="font-mono break-all">{item.slug}</span>
            </td>
            <td className={tdBase}>
              <span className="break-words">{item.report}</span>
            </td>
            {isAllSelected && (
              <td className={tdBase}>
                <span className="break-words">
                  {'tenant_name' in item ? item.tenant_name : ''}
                </span>
              </td>
            )}
            <td className={`${tdBase} whitespace-nowrap text-muted`}>
              {item?.updated_at
                ? new Date(item.updated_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    timeZone: 'UTC',
                  })
                : item?.created_at
                  ? new Date(item.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      timeZone: 'UTC',
                    })
                  : null}
            </td>
            <td className={`${tdBase} whitespace-nowrap`}>
              <div className="flex items-center gap-1">
                <IconButton
                  icon={
                    <ArrowTopRightOnSquareIcon className="size-4 md:size-5" />
                  }
                  label="View Page"
                  onClick={() => onView(item.slug)}
                  className="text-blue-600 hover:bg-brand-subtle"
                />
                <IconButton
                  icon={<PencilSquareIcon className="size-4 md:size-5" />}
                  label="Edit Page"
                  onClick={() => onEdit(item.id, item.tenant_id)}
                  className="text-muted hover:bg-surface-strong"
                />
                <IconButton
                  icon={<TrashIcon className="size-4 md:size-5" />}
                  label="Delete Page"
                  onClick={() =>
                    onDeleteClick(item.id, item.name, item.tenant_id)
                  }
                  className="text-red-600 hover:bg-red-50"
                />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    )
  }

  if (embedded) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse table-fixed min-w-[800px]">
          {thead}
          {tbody}
        </table>
      </div>
    )
  }

  return (
    <DataTable tableClassName="table-fixed min-w-[800px]">
      {thead}
      {tbody}
    </DataTable>
  )
}

export default StatusPagesTable
