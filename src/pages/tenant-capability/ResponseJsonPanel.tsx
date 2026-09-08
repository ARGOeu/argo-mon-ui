import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

interface ResponseJsonPanelProps {
  data?: object
}

const ResponseJsonPanel = ({ data }: ResponseJsonPanelProps) => {
  const [copied, setCopied] = useState(false)
  const json = JSON.stringify(data ?? { data: [] }, null, 2)

  const handleCopy = () => {
    navigator.clipboard?.writeText(json)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="relative h-full overflow-auto rounded-lg border border-slate-800 bg-slate-900 p-3">
      <button
        onClick={handleCopy}
        className="absolute right-2.5 top-2.5 rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
        aria-label="Copy response JSON"
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </button>
      <pre className="font-mono text-xs leading-relaxed text-emerald-400">
        {json}
      </pre>
    </div>
  )
}

export default ResponseJsonPanel
