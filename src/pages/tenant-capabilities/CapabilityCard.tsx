import { type ReactElement } from 'react'
import { ChevronRight } from 'lucide-react'
import CapabilityEndpoint from './CapabilityEndpoint'

const statItemClass = 'flex flex-col items-end border-l border-slate-100 pl-3'
const statLabelClass =
  'text-[9px] font-bold uppercase text-slate-400 tracking-wider'
const statValueClass = 'text-xl font-black leading-none mt-0.5'

export interface Stats {
  name: string
  value: number
  colorClass?: string
}

interface CapabilityCardProps {
  title: string
  description: string
  icon: ReactElement
  uiUrl: string
  apiUrl: string
  apiDoc?: string
  apiAccess?: string
  colorClass: string
  docUrl: string
  stats?: Stats[]
  statsPlaceholder?: string
  statsPlaceholderLabel?: string
}

const CapabilityCard = ({
  title,
  description,
  icon,
  uiUrl,
  apiUrl,
  apiDoc,
  apiAccess,
  colorClass,
  docUrl,
  stats,
  statsPlaceholder,
  statsPlaceholderLabel,
}: CapabilityCardProps) => {
  return (
    <div className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <div className="p-4 flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg shadow-sm ${colorClass}`}>
              <div className="scale-90">{icon}</div>
            </div>
            <h2 className="text-base font-bold text-slate-800 tracking-tight">
              {title}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {stats
              ? stats.map((item) => (
                  <div key={item.name} className={statItemClass}>
                    <span className={statLabelClass}>
                      {item.name || 'Stat'}
                    </span>
                    <span
                      className={`${statValueClass} ${item.colorClass ? item.colorClass : item.value > 90 ? 'text-green-600' : item.value > 70 ? 'text-amber-600' : 'text-red-600'}`}
                    >
                      {item.value}
                    </span>
                  </div>
                ))
              : statsPlaceholder && (
                  <div className={statItemClass}>
                    {statsPlaceholderLabel && (
                      <span className={statLabelClass}>
                        {statsPlaceholderLabel}
                      </span>
                    )}
                    <span className={`${statValueClass} text-slate-300`}>
                      {statsPlaceholder}
                    </span>
                  </div>
                )}
          </div>
        </div>

        <p className="text-sm text-slate-500 mb-4 leading-normal">
          {description}
        </p>

        <div className="space-y-3">
          <CapabilityEndpoint label="User Interface" url={uiUrl} />
          <CapabilityEndpoint
            label="API Access"
            url={apiUrl}
            isApi={true}
            apiAccess={apiAccess}
            apiDoc={apiDoc}
          />
        </div>
      </div>

      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex justify-end items-center">
        <a
          href={docUrl}
          target="_blank"
          className="group hover:cursor-pointer flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
        >
          View Documentation
          <ChevronRight className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>
    </div>
  )
}

export default CapabilityCard
