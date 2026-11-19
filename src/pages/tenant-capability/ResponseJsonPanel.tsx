import CopyButton from '@/components/CopyButton'

interface ResponseJsonPanelProps {
  data?: object
}

const ResponseJsonPanel = ({ data }: ResponseJsonPanelProps) => {
  const json = JSON.stringify(data ?? { data: [] }, null, 2)

  return (
    <div className="relative h-full overflow-auto rounded-lg border border-slate-800 bg-slate-900 p-3">
      <CopyButton
        value={json}
        label="Copy response JSON"
        dark
        size="md"
        className="absolute right-2.5 top-2.5"
      />
      <pre className="font-mono text-xs leading-relaxed text-emerald-400">
        {json}
      </pre>
    </div>
  )
}

export default ResponseJsonPanel
