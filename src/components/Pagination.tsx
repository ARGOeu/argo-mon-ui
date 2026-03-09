import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/16/solid'

const navButtonClass =
  'p-1 rounded-lg border border-line-strong bg-white cursor-pointer transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-surface-muted'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalElements: number
  itemLabel?: string
  className?: string
  onPrev: () => void
  onNext: () => void
}

const Pagination = ({
  currentPage,
  totalPages,
  totalElements,
  itemLabel = 'items',
  className,
  onPrev,
  onNext,
}: PaginationProps) => {
  if (totalPages <= 0) return null

  return (
    <div
      className={`flex items-center justify-between px-4 py-1.5 border border-line rounded-lg mt-2 bg-white ${className ?? ''}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm text-body font-medium">
          Page {currentPage} of {totalPages}
        </span>
        <span className="text-sm text-muted">
          ({totalElements} total {itemLabel})
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={currentPage === 1}
          className={navButtonClass}
          aria-label="Previous page"
        >
          <ChevronLeftIcon className="size-5 text-muted" />
        </button>
        <button
          onClick={onNext}
          disabled={currentPage >= totalPages}
          className={navButtonClass}
          aria-label="Next page"
        >
          <ChevronRightIcon className="size-5 text-muted" />
        </button>
      </div>
    </div>
  )
}

export default Pagination
