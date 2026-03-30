import { useState, useRef, useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import {
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/16/solid'
import type { KeyboardEvent } from 'react'

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
  searchable?: boolean
  className?: string
}

const SelectDropdown = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  disabled = false,
  searchable = false,
  className,
}: SelectDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const listboxId = useId()

  const filteredOptions =
    searchable && searchQuery
      ? options.filter((option) =>
          option.label.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : options

  useEffect(() => {
    if (!isOpen) return
    const handleMouseDown = (e: MouseEvent) => {
      if (
        !containerRef.current?.contains(e.target as Node) &&
        !menuRef.current?.contains(e.target as Node)
      ) {
        handleClose()
      }
    }

    const handleResize = () => handleClose()

    document.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('resize', handleResize)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('resize', handleResize)
    }
  }, [isOpen])

  useEffect(() => {
    if (activeIndex < 0 || !isOpen) return
    document
      .getElementById(`${listboxId}-option-${activeIndex}`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, isOpen, listboxId])

  useEffect(() => {
    if (isOpen && searchable) {
      searchInputRef.current?.focus()
    }
  }, [isOpen, searchable])

  const handleClose = () => {
    setIsOpen(false)
    setActiveIndex(-1)
    setSearchQuery('')
  }

  const selectedLabel = options.find((option) => option.value === value)?.label

  const openMenu = () => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setMenuPos({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    setActiveIndex(filteredOptions.findIndex((o) => o.value === value))
    setIsOpen(true)
  }

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    handleClose()
  }

  const handleToggle = () => {
    if (disabled) return
    if (isOpen) {
      handleClose()
    } else {
      openMenu()
    }
  }

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    allowSpace = false,
  ) => {
    if (disabled) return
    const selectOrOpen = () => {
      if (isOpen && activeIndex >= 0) {
        handleSelect(filteredOptions[activeIndex].value)
      } else if (!isOpen) {
        openMenu()
      }
    }
    switch (e.key) {
      case 'Enter':
        e.preventDefault()
        selectOrOpen()
        break
      case ' ':
        if (!allowSpace) break
        e.preventDefault()
        selectOrOpen()
        break
      case 'Escape':
        e.preventDefault()
        handleClose()
        break
      case 'ArrowDown':
        e.preventDefault()
        if (!isOpen) {
          openMenu()
        } else {
          setActiveIndex((prev) =>
            Math.min(prev + 1, filteredOptions.length - 1),
          )
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (isOpen) {
          setActiveIndex((prev) => Math.max(prev - 1, 0))
        }
        break
    }
  }

  return (
    <div className={`relative ${className ?? ''}`} ref={containerRef}>
      <input
        type="text"
        readOnly
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={
          activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
        }
        value={selectedLabel ?? ''}
        placeholder={placeholder}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={(e) => handleKeyDown(e, true)}
        className="w-full cursor-pointer pr-9 py-1.5"
      />
      <ChevronUpDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-muted shrink-0 pointer-events-none" />

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              top: menuPos.top,
              left: menuPos.left,
              width: menuPos.width,
            }}
            className="fixed z-50 bg-white border border-line rounded-md shadow-lg overflow-hidden animate-fade-in"
          >
            {searchable && (
              <div className="flex items-center gap-2 px-3 py-2 border-b border-line">
                <MagnifyingGlassIcon className="size-3.5 text-muted shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search..."
                  className="flex-1 text-sm border-0 outline-none ring-0 focus:ring-0 bg-transparent p-0 placeholder:text-subtle"
                />
              </div>
            )}
            <ul
              id={listboxId}
              className="max-h-60 overflow-y-auto"
              role="listbox"
            >
              {filteredOptions.length === 0 ? (
                <li className="px-4 py-3 text-sm text-subtle italic text-center">
                  No results found
                </li>
              ) : (
                filteredOptions.map((option, index) => (
                  <li
                    id={`${listboxId}-option-${index}`}
                    key={option.value}
                    role="option"
                    aria-selected={option.value === value}
                    onClick={() => handleSelect(option.value)}
                    className={`px-4 py-1.5 mb-px last:mb-0 rounded-md text-sm cursor-pointer transition-colors ${
                      option.value === value || index === activeIndex
                        ? 'bg-brand-subtle text-brand font-medium'
                        : 'text-foreground hover:bg-surface-muted'
                    }`}
                  >
                    {option.label}
                  </li>
                ))
              )}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  )
}

export default SelectDropdown
