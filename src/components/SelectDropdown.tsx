import { useState, useRef, useEffect } from 'react'
import { ChevronUpDownIcon } from '@heroicons/react/16/solid'

export interface SelectOption {
  value: string
  label: string
}

interface SelectDropdownProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
}

const SelectDropdown = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  disabled = false,
  className,
}: SelectDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleMouseDown = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [isOpen])

  const selectedLabel = options.find((o) => o.value === value)?.label

  const handleToggle = () => {
    if (!disabled) setIsOpen((prev) => !prev)
  }

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className ?? ''}`} ref={dropdownRef}>
      <input
        type="text"
        readOnly
        value={selectedLabel ?? ''}
        placeholder={placeholder}
        disabled={disabled}
        onClick={handleToggle}
        className="w-full cursor-pointer pr-9"
      />
      <ChevronUpDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-muted shrink-0 pointer-events-none" />

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-line rounded-md shadow-lg overflow-hidden animate-fade-in">
          <ul className="max-h-60 overflow-y-auto" role="listbox">
            {options.map((option) => (
              <li
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                onClick={() => handleSelect(option.value)}
                className={`px-4 py-1.5 mb-px last:mb-0 rounded-md text-sm cursor-pointer transition-colors ${
                  option.value === value
                    ? 'bg-brand-subtle text-brand font-medium'
                    : 'text-foreground hover:bg-surface-muted'
                }`}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default SelectDropdown
