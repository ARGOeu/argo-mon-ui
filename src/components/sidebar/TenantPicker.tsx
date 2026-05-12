import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router'
import {
  ChevronUpDownIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/16/solid'
import type { Tenant } from '@/types/tenants'
import TenantAvatar from './TenantAvatar'

interface TenantPickerProps {
  tenants: Tenant[]
  activeTenantId: string | null
  onSelect: () => void
}

export default function TenantPicker({
  tenants,
  activeTenantId,
  onSelect,
}: TenantPickerProps) {
  const [open, setOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  const activeTenant = activeTenantId
    ? tenants.find((t) => t.id === activeTenantId)
    : null
  const displayName = activeTenant?.info?.name ?? 'Select tenant'

  useEffect(() => {
    if (!open) return
    const handleDocumentClick = (e: MouseEvent) => {
      if (!pickerRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleDocumentClick)
    return () => document.removeEventListener('mousedown', handleDocumentClick)
  }, [open])

  const handleToggle = () => setOpen((prev) => !prev)
  const handleSelect = () => {
    setOpen(false)
    onSelect()
  }

  return (
    <div ref={pickerRef} className="relative mx-2">
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-surface-strong transition-colors cursor-pointer"
      >
        {activeTenant ? (
          <TenantAvatar
            name={activeTenant.info.name}
            image={activeTenant.info.image}
          />
        ) : (
          <BuildingOffice2Icon className="size-5 text-muted flex-shrink-0" />
        )}
        <span className="text-sm font-semibold text-foreground truncate flex-1 min-w-0 text-left">
          {displayName}
        </span>
        <ChevronUpDownIcon className="size-5 text-muted flex-shrink-0" />
      </button>

      <div
        className={`absolute left-0 right-0 top-full bg-white border border-line rounded shadow-lg z-20 py-1 max-h-60 overflow-y-auto ${open ? '' : 'hidden'}`}
      >
        {tenants.length === 0 ? (
          <p className="px-3 py-2 text-sm text-muted text-center">
            No tenants available
          </p>
        ) : (
          tenants.map((tenant) => (
            <Link
              key={tenant.id}
              to={`/tenants/${tenant.id}/details`}
              onClick={handleSelect}
              className={`flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-surface-muted ${
                tenant.id === activeTenantId
                  ? 'bg-brand-subtle text-brand font-medium'
                  : 'text-body'
              }`}
            >
              <TenantAvatar
                name={tenant.info.name}
                image={tenant.info.image}
                size="sm"
              />
              <span className="truncate">{tenant.info.name}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
