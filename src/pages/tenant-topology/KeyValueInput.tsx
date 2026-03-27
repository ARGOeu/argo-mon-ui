import { PlusIcon, TrashIcon } from '@heroicons/react/16/solid'
import IconButton from '@/components/IconButton'

export interface Label {
  id: string
  key: string
  value: string
}

interface KeyValueInputProps {
  labels: Label[]
  onLabelsChange: (labels: Label[]) => void
}

const KeyValueInput = ({ labels, onLabelsChange }: KeyValueInputProps) => {
  const handleAdd = () => {
    onLabelsChange([...labels, { id: crypto.randomUUID(), key: '', value: '' }])
  }

  const handleChange = (
    index: number,
    field: 'key' | 'value',
    value: string,
  ) => {
    onLabelsChange(
      labels.map((label, i) =>
        i === index ? { ...label, [field]: value } : label,
      ),
    )
  }

  const handleRemove = (index: number) => {
    onLabelsChange(labels.filter((_, i) => i !== index))
  }

  return (
    <>
      {labels.length === 0 && (
        <p className="text-sm text-subtle italic">No labels added</p>
      )}
      {labels.map((label, index) => (
        <div key={label.id} className="flex items-center gap-2">
          <input
            type="text"
            value={label.key}
            onChange={(e) => handleChange(index, 'key', e.target.value)}
            placeholder="Key"
            className="flex-1"
          />
          <span className="text-muted text-sm shrink-0">→</span>
          <input
            type="text"
            value={label.value}
            onChange={(e) => handleChange(index, 'value', e.target.value)}
            placeholder="Value"
            className="flex-1"
          />
          <IconButton
            icon={<TrashIcon className="size-4.5" />}
            label="Remove label"
            onClick={() => handleRemove(index)}
            className="text-red-600 hover:bg-red-50 shrink-0"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={handleAdd}
        className="flex items-center gap-1.5 text-sm text-brand hover:text-brand-strong transition-colors w-fit cursor-pointer mt-1"
      >
        <PlusIcon className="size-4" />
        Add label
      </button>
    </>
  )
}

export default KeyValueInput
