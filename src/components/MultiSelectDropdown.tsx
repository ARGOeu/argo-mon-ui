import { useState, useRef, useEffect } from 'react'
import {
  CheckIcon,
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/16/solid'
import Badge from '@/components/Badge'
import type { SelectOption } from '@/components/SelectDropdown'

interface MultiSelectDropdownProps {
  value: string[]
  onChange: (value: string[]) => void
  options: Pick<SelectOption, 'value' | 'label'>[]
  placeholder?: string
  disabled?: boolean
  searchable?: boolean
}

const MultiSelectDropdown = ({
  value,
  onChange,
  options,
  placeholder = 'Select options...',
  disabled = false,
  searchable = false,
}: MultiSelectDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Close the menu on a click outside of it or on Escape
  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleToggle = () => {
    if (disabled) {
      return
    }
    if (!isOpen) {
      setSearchQuery('')
    }
    setIsOpen(!isOpen)
  }

  const handleToggleOption = (optionValue: string) => {
    onChange(
      value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue],
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <div
        onClick={handleToggle}
        className={`flex items-center gap-2 py-1.5 pl-3 pr-2 text-sm border border-line-strong rounded-md transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10 ${
          disabled
            ? 'bg-surface-strong text-muted opacity-70 cursor-not-allowed'
            : 'bg-white cursor-pointer'
        }`}
      >
        <div className="flex flex-wrap flex-1 gap-1 min-w-0">
          {value.length === 0 ? (
            <span className="text-subtle">{placeholder}</span>
          ) : (
            value.map((selected) => {
              const label =
                options.find((o) => o.value === selected)?.label ?? selected
              return (
                <Badge
                  key={selected}
                  size="sm"
                  className="max-w-full gap-1 pr-1.5 bg-surface-strong text-body"
                >
                  <span className="truncate" title={label}>
                    {label}
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${label}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleOption(selected)
                    }}
                    className="shrink-0 rounded-full p-0.5 text-muted hover:bg-line-strong hover:text-foreground transition-colors cursor-pointer"
                  >
                    <XMarkIcon className="size-3" />
                  </button>
                </Badge>
              )
            })
          )}
        </div>
        <button
          type="button"
          disabled={disabled}
          aria-label="Show options"
          aria-expanded={isOpen}
          className="shrink-0"
        >
          <ChevronUpDownIcon className="size-4 text-muted" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden bg-white border border-line rounded-md shadow-lg">
          {searchable && (
            <div className="flex items-center gap-2 px-3 py-2 border-b border-line">
              <MagnifyingGlassIcon className="size-3.5 text-muted shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                autoFocus
                className="flex-1 text-sm border-0 outline-none ring-0 focus:ring-0 bg-transparent p-0 placeholder:text-subtle"
              />
            </div>
          )}
          <ul className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-3 text-sm text-subtle italic text-center">
                No results found
              </li>
            ) : (
              filteredOptions.map((option) => {
                const isChecked = value.includes(option.value)
                return (
                  <li key={option.value}>
                    <label className="flex items-center gap-3 px-3 py-1.5 text-sm text-foreground cursor-pointer hover:bg-surface-strong focus-within:bg-surface-strong">
                      <span
                        className={`relative size-4 shrink-0 rounded border flex items-center justify-center ${
                          isChecked
                            ? 'bg-brand border-brand'
                            : 'border-line-strong bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={isChecked}
                          onChange={() => handleToggleOption(option.value)}
                        />
                        {isChecked && (
                          <CheckIcon className="size-3 text-white" />
                        )}
                      </span>
                      <span className="break-all">{option.label}</span>
                    </label>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export default MultiSelectDropdown
