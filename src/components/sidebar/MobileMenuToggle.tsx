import { Bars3Icon } from '@heroicons/react/16/solid'

interface MobileMenuToggleProps {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export default function MobileMenuToggle({
  isOpen,
  onOpen,
  onClose,
}: MobileMenuToggleProps) {
  return (
    <>
      <button
        onClick={onOpen}
        className={`md:hidden sticky w-10 h-10 top-6 left-3 z-50 p-2 bg-white rounded-lg shadow-lg border border-line hover:bg-surface-muted transition-colors cursor-pointer${isOpen ? ' invisible pointer-events-none' : ''}`}
        aria-label="Open menu"
      >
        <Bars3Icon className="size-6 text-body" />
      </button>

      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-30"
          onClick={onClose}
        />
      )}
    </>
  )
}
