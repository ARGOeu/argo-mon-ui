import { ChevronDownIcon } from '@heroicons/react/16/solid'

export interface ActionMenuItem {
  label: string
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  onClick: () => void
}

interface ActionMenuProps {
  label: string
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  items: ActionMenuItem[]
  disabled?: boolean
  className?: string
  menuClassName?: string
}

const ActionMenu = ({
  label,
  icon: Icon,
  items,
  disabled = false,
  className = '',
  menuClassName = 'w-40',
}: ActionMenuProps) => (
  <div className="dropdown group">
    <div
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-haspopup="menu"
      aria-disabled={disabled}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-line-strong text-body transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer hover:bg-surface-strong'
      } ${className}`}
    >
      {Icon && <Icon className="size-5" aria-hidden />}
      {label}
      <ChevronDownIcon
        className="size-4 transition-transform group-focus-within:rotate-180"
        aria-hidden
      />
    </div>

    {!disabled && (
      <ul
        role="menu"
        tabIndex={0}
        className={`dropdown-content z-10 mt-1 rounded-md border border-line bg-white p-1 shadow-lg ${menuClassName}`}
      >
        {items.map((item) => (
          <li key={item.label} role="none">
            <button
              type="button"
              role="menuitem"
              onClick={(e) => {
                item.onClick()
                e.currentTarget.blur()
              }}
              className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-sm text-body cursor-pointer transition-colors hover:bg-surface-muted"
            >
              {item.icon && (
                <item.icon className="size-4 text-muted" aria-hidden />
              )}
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
)

export default ActionMenu
