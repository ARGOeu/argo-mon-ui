import type { ComponentType } from 'react'

const tabBase =
  'px-6 py-3 pb-2 text-base font-medium bg-transparent border-0 rounded-t-md border-b-2 cursor-pointer transition-all -mb-0.5 relative flex items-center gap-1'
const tabActive = 'text-brand border-b-brand hover:border-b-brand'
const tabInactive =
  'text-muted border-b-transparent hover:text-body hover:bg-surface-muted hover:border-b-gray-300'

export interface TabItem {
  id: string
  label: string
  icon?: ComponentType<{ className?: string }>
  hasError?: boolean
}

interface TabsProps {
  tabs: TabItem[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
}

const Tabs = ({ tabs, activeTab, onChange, className }: TabsProps) => (
  <div className={`flex gap-2 border-b-2 border-line ${className ?? ''}`}>
    {tabs.map((tab) => {
      const Icon = tab.icon
      return (
        <button
          key={tab.id}
          type="button"
          className={`${tabBase} ${activeTab === tab.id ? tabActive : tabInactive}`}
          onClick={() => onChange(tab.id)}
        >
          {Icon && <Icon className="size-5" />}
          {tab.label}
          {tab.hasError ? (
            <span
              className={`inline-block size-[6px] rounded-full bg-red-500 ml-[6px] transition-opacity ${tab.hasError ? 'opacity-100' : 'opacity-0'}`}
            />
          ) : null}
        </button>
      )
    })}
  </div>
)

export default Tabs
