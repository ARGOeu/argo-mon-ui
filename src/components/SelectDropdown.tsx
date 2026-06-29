import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  useId,
} from 'react'
import { createPortal } from 'react-dom'
import {
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/16/solid'
import type { KeyboardEvent } from 'react'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
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
  const [searchQuery, setSearchQuery] = useState('')
  const [menuPos, setMenuPos] = useState<{
    top?: number
    bottom?: number
    left: number
    width: number
  }>({ left: 0, width: 0 })
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

  const activeIndexRef = useRef(activeIndex)
  activeIndexRef.current = activeIndex

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setActiveIndex(-1)
    setSearchQuery('')
  }, [])

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
    const handleScroll = (e: Event) => {
      if (!menuRef.current?.contains(e.target as Node)) handleClose()
    }

    document.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('resize', handleClose)
    window.addEventListener('scroll', handleScroll, true)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('resize', handleClose)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [isOpen, handleClose])

  useEffect(() => {
    if (activeIndex >= 0 && isOpen) {
      document
        .getElementById(`${listboxId}-option-${activeIndex}`)
        ?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex, isOpen, listboxId])

  useEffect(() => {
    if (isOpen && searchable) {
      searchInputRef.current?.focus()
    }
  }, [isOpen, searchable])

  useLayoutEffect(() => {
    if (!isOpen || !menuRef.current || !containerRef.current) return

    const gap = 4
    const trigger = containerRef.current.getBoundingClientRect()
    const menuHeight = menuRef.current.getBoundingClientRect().height
    const left = Math.max(
      0,
      Math.min(trigger.left, window.innerWidth - trigger.width),
    )
    const spaceBelow = window.innerHeight - trigger.bottom
    const spaceNeeded = menuHeight + gap
    const fitsBelow = spaceBelow >= spaceNeeded

    setMenuPos(
      fitsBelow
        ? { top: trigger.bottom + gap, left, width: trigger.width }
        : {
            bottom: window.innerHeight - trigger.top + gap,
            left,
            width: trigger.width,
          },
    )
  }, [isOpen])

  const openMenu = () => {
    if (!containerRef.current) return
    setActiveIndex(filteredOptions.findIndex((o) => o.value === value))
    setIsOpen(true)
  }

  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return
    onChange(option.value)
    handleClose()
  }

  const findNextEnabledIndex = (from: number, direction: 1 | -1): number => {
    let index = from + direction
    while (index >= 0 && index < filteredOptions.length) {
      if (!filteredOptions[index].disabled) {
        return index
      }
      index += direction
    }
    return from
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
    const handleActivate = () => {
      if (isOpen && activeIndexRef.current >= 0) {
        handleSelect(filteredOptions[activeIndexRef.current])
      } else if (!isOpen) {
        openMenu()
      }
    }
    switch (e.key) {
      case 'Enter':
        e.preventDefault()
        handleActivate()
        break
      case ' ':
        if (!allowSpace) break
        e.preventDefault()
        handleActivate()
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
          setActiveIndex((prev) => findNextEnabledIndex(prev, 1))
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (isOpen) {
          setActiveIndex((prev) => findNextEnabledIndex(prev, -1))
        }
        break
    }
  }

  const selectedLabel = options.find((o) => o.value === value)?.label

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
              bottom: menuPos.bottom,
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
                filteredOptions.map((option, index) =>
                  option.disabled ? (
                    <li
                      key={option.value}
                      role="presentation"
                      className="px-3 pt-2.5 pb-0.5 text-xs font-semibold uppercase tracking-wider text-muted select-none cursor-default"
                    >
                      {option.label}
                    </li>
                  ) : (
                    <li
                      id={`${listboxId}-option-${index}`}
                      key={option.value}
                      role="option"
                      aria-selected={option.value === value}
                      onClick={() => handleSelect(option)}
                      className={`px-4 py-1.5 mb-px last:mb-0 rounded-md text-sm cursor-pointer transition-colors ${
                        option.value === value || index === activeIndex
                          ? 'bg-brand-subtle text-brand font-medium'
                          : 'text-foreground hover:bg-surface-muted'
                      }`}
                    >
                      {option.label}
                    </li>
                  ),
                )
              )}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  )
}

export default SelectDropdown
