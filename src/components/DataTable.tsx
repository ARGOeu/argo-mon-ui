import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import type { ReactNode } from 'react'

export const thBase =
  'px-4 py-3 text-left text-sm font-semibold text-body whitespace-nowrap'

export const tdBase = 'px-4 py-2.5 text-sm text-gray-800'

const sortButtonClass =
  'group flex items-center gap-1 w-full bg-transparent border-none p-0 text-sm font-semibold text-body tracking-wider cursor-pointer text-left transition-all hover:text-foreground'

interface SortableColumnHeaderProps {
  children: ReactNode
  isActive: boolean
  isAscending: boolean
  onClick: () => void
}

export const SortableColumnHeader = ({
  children,
  isActive,
  isAscending,
  onClick,
}: SortableColumnHeaderProps) => (
  <button className={sortButtonClass} onClick={onClick}>
    <span>{children}</span>
    {isActive ? (
      isAscending ? (
        <ChevronUpIcon className="size-4 text-gray-800 stroke-[2.5] shrink-0" />
      ) : (
        <ChevronDownIcon className="size-4 text-gray-800 stroke-[2.5] shrink-0" />
      )
    ) : (
      <span className="flex flex-col h-[1.4rem] justify-center shrink-0">
        <ChevronUpIcon className="size-4 text-subtle stroke-2 opacity-80 transition-opacity group-hover:opacity-100" />
        <ChevronDownIcon className="size-4 text-subtle stroke-2 opacity-80 transition-opacity group-hover:opacity-100" />
      </span>
    )}
  </button>
)

interface DataTableProps {
  children: ReactNode
  isEmpty?: boolean
  emptyMessage?: string
  emptyColSpan?: number
  className?: string
  tableClassName?: string
  scrollable?: boolean
}

const DataTable = ({
  children,
  isEmpty,
  emptyMessage = 'No items found',
  emptyColSpan = 1,
  className,
  tableClassName,
  scrollable,
}: DataTableProps) => (
  <div
    className={`bg-white border border-line rounded-lg shadow-sm overflow-hidden ${scrollable ? 'flex flex-col' : ''} ${className ?? ''}`}
  >
    {scrollable ? (
      <div className="overflow-auto flex-1">
        <TableInner
          isEmpty={isEmpty}
          emptyMessage={emptyMessage}
          emptyColSpan={emptyColSpan}
          tableClassName={tableClassName}
        >
          {children}
        </TableInner>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <TableInner
          isEmpty={isEmpty}
          emptyMessage={emptyMessage}
          emptyColSpan={emptyColSpan}
          tableClassName={tableClassName}
        >
          {children}
        </TableInner>
      </div>
    )}
  </div>
)

interface TableInnerProps {
  children: ReactNode
  isEmpty?: boolean
  emptyMessage: string
  emptyColSpan: number
  tableClassName?: string
}

const TableInner = ({
  children,
  isEmpty,
  emptyMessage,
  emptyColSpan,
  tableClassName,
}: TableInnerProps) => {
  const tableClass = `w-full border-collapse ${tableClassName ?? ''}`
  if (isEmpty) {
    return (
      <table className={tableClass}>
        <tbody>
          <tr>
            <td
              colSpan={emptyColSpan}
              className="text-center text-subtle italic py-8 px-4 text-sm"
            >
              {emptyMessage}
            </td>
          </tr>
        </tbody>
      </table>
    )
  }
  return <table className={tableClass}>{children}</table>
}

export default DataTable
