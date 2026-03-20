import { useState, useRef, useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { ChevronUpDownIcon } from '@heroicons/react/16/solid'
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
  const [activeIndex, setActiveIndex] = useState(-1)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()

  useEffect(() => {
    if (!isOpen) return
    const handleMouseDown = (e: MouseEvent) => {
      if (
        !containerRef.current?.contains(e.target as Node) &&
        !menuRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleResize = () => setIsOpen(false)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen])

  useEffect(() => {
    if (activeIndex < 0 || !isOpen) return
    document
      .getElementById(`${listboxId}-option-${activeIndex}`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, isOpen, listboxId])

  const selectedLabel = options.find((o) => o.value === value)?.label

  const openMenu = () => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setMenuPos({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    setActiveIndex(options.findIndex((o) => o.value === value))
    setIsOpen(true)
  }

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
    setActiveIndex(-1)
  }

  const handleToggle = () => {
    if (disabled) return
    if (isOpen) {
      setIsOpen(false)
      setActiveIndex(-1)
    } else {
      openMenu()
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (isOpen && activeIndex >= 0) {
          handleSelect(options[activeIndex].value)
        } else {
          handleToggle()
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setActiveIndex(-1)
        break
      case 'ArrowDown':
        e.preventDefault()
        if (!isOpen) {
          openMenu()
        } else {
          setActiveIndex((prev) => Math.min(prev + 1, options.length - 1))
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
        onKeyDown={handleKeyDown}
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
            <ul
              id={listboxId}
              className="max-h-60 overflow-y-auto"
              role="listbox"
            >
              {options.map((option, index) => (
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
              ))}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  )
}

export default SelectDropdown
