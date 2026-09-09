import {
  Bars3Icon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline'
import { BarChart3, ListTree, Settings } from 'lucide-react'

export type CapabilityKey =
  | 'metrics'
  | 'status'
  | 'issues'
  | 'downtimes'
  | 'summary'

export type CapabilityNavItems = CapabilityKey | 'node-config'

interface NavItem {
  key: CapabilityNavItems
  title: string
  subtitle: string
  icon: typeof BarChart3
  available: boolean
}

const CAPABILITY_ITEMS: NavItem[] = [
  {
    key: 'metrics',
    title: 'Metrics',
    subtitle: 'Metrics (Availability, Reliability, Uptime)',
    icon: BarChart3,
    available: true,
  },
  {
    key: 'status',
    title: 'Status',
    subtitle: 'Status timelines',
    icon: Bars3Icon,
    available: false,
  },
  {
    key: 'issues',
    title: 'Issues',
    subtitle: 'Latest Issues',
    icon: ExclamationTriangleIcon,
    available: false,
  },
  {
    key: 'downtimes',
    title: 'Downtimes',
    subtitle: 'Scheduled downtimes',
    icon: WrenchScrewdriverIcon,
    available: false,
  },
  {
    key: 'summary',
    title: 'Summary',
    subtitle: 'Status, metrics, downtimes and issues combined',
    icon: ListTree,
    available: false,
  },
]

const NODE_CONFIG_ITEM: NavItem = {
  key: 'node-config',
  title: 'Node configuration',
  subtitle: 'Manage the default report and node status',
  icon: Settings,
  available: true,
}

interface NavCardProps {
  item: NavItem
  isSelected: boolean
  onSelect: (key: CapabilityNavItems) => void
}

const NavCard = ({ item, isSelected, onSelect }: NavCardProps) => {
  const Icon = item.icon

  const iconBadgeClasses = !item.available
    ? 'bg-slate-50 text-slate-300'
    : isSelected
      ? 'bg-blue-100 text-blue-600'
      : 'bg-blue-50 text-blue-500'

  const boxClasses = !item.available
    ? 'cursor-default border-transparent bg-white'
    : isSelected
      ? 'border-blue-400 bg-white shadow-sm'
      : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40'

  return (
    <button
      type="button"
      disabled={!item.available}
      onClick={() => item.available && onSelect(item.key)}
      className={`relative flex w-full ${item.available ? 'cursor-pointer' : ''} items-center gap-3 rounded-xl border p-3 text-left transition-colors ${boxClasses}`}
    >
      <div
        className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${iconBadgeClasses}`}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <div
          className={`text-sm font-semibold ${
            !item.available
              ? 'text-slate-300'
              : isSelected
                ? 'text-blue-700'
                : 'text-slate-600'
          }`}
        >
          {item.title}
        </div>
        <p
          className={`truncate text-xs ${
            item.available ? 'text-slate-400' : 'text-slate-300'
          }`}
        >
          {item.subtitle}
        </p>
      </div>
      {!item.available && (
        <span className="absolute right-2 top-2 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
          Soon
        </span>
      )}
    </button>
  )
}

interface CapabilityNavProps {
  selected: CapabilityNavItems
  onSelect: (key: CapabilityNavItems) => void
  capEnabled: boolean
  showNodeConfig: boolean
}

const CapabilityNav = ({
  selected,
  onSelect,
  capEnabled,
  showNodeConfig,
}: CapabilityNavProps) => {
  return (
    <nav className="flex flex-col gap-3">
      {capEnabled &&
        CAPABILITY_ITEMS.map((item) => (
          <NavCard
            key={item.key}
            item={item}
            isSelected={item.key === selected}
            onSelect={onSelect}
          />
        ))}

      {showNodeConfig && (
        <>
          {capEnabled && <hr className="my-1 border-slate-100" />}
          <NavCard
            item={NODE_CONFIG_ITEM}
            isSelected={selected === 'node-config'}
            onSelect={onSelect}
          />
        </>
      )}
    </nav>
  )
}

export default CapabilityNav
