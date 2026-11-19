import { useState } from 'react'
import { Lock, Play, SquareArrowOutUpRight } from 'lucide-react'
import CopyButton from '@/components/CopyButton'

interface CapabilityEndpointProps {
  label: string
  url: string
  isApi?: boolean
  apiDoc?: string
  apiAccess?: string
}

const CapabilityEndpoint = ({
  label,
  url,
  isApi = false,
  apiDoc = '',
  apiAccess = '',
}: CapabilityEndpointProps) => {
  const [copied, setCopied] = useState(false)

  return (
    <div className="group relative">
      <span className="text-[9px] font-bold uppercase text-slate-400 tracking-widest leading-none">
        {label}
      </span>
      <div
        className={`mt-1 flex flex-col rounded-md border transition-all duration-200 ${
          isApi
            ? 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-inner'
            : 'bg-white border-slate-200 hover:border-blue-300'
        }`}
      >
        <div className="flex items-center justify-between p-2">
          <code
            className={`text-xs truncate font-mono font-medium ${isApi ? (copied ? 'text-black bg-green-300' : 'text-emerald-400') : 'text-blue-600'}`}
          >
            {url}
          </code>
          {isApi ? (
            <CopyButton
              value={url}
              label={`Copy ${label}`}
              dark
              onCopiedChange={setCopied}
              className="ml-2"
            />
          ) : (
            <a
              target="_blank"
              href={url}
              className="ml-2 p-1 text-slate-400 hover:text-blue-600 transition-colors"
            >
              <SquareArrowOutUpRight size={14} />
            </a>
          )}
        </div>
        {isApi && (
          <div className="flex gap-1.5 px-2 pb-2 pt-0.5 justify-end">
            <a
              target="_blank"
              href={apiAccess}
              className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all cursor-pointer border border-slate-700"
            >
              <div className="flex items-center">
                <Lock size={10} className="inline me-1.5" />
                Get Credentials
              </div>
            </a>
            <a
              target="_blank"
              href={apiDoc}
              className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all cursor-pointer border border-slate-700"
            >
              <div className="flex items-center">
                <Play size={10} className="inline me-1.5" />
                Try Request
              </div>
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default CapabilityEndpoint
