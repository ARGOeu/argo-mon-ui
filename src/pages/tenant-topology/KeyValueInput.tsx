import { PlusIcon, TrashIcon } from '@heroicons/react/16/solid'
import IconButton from '@/components/IconButton'

export interface Label {
  id: string
  key: string
  value: string
}

interface DisallowedKey {
  key: string
  message: string
}

interface KeyValueInputProps {
  labels: Label[]
  onLabelsChange: (labels: Label[]) => void
  disallowedKeys?: DisallowedKey[]
}

const KeyValueInput = ({
  labels,
  onLabelsChange,
  disallowedKeys,
}: KeyValueInputProps) => {
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

  const getKeyError = (key: string): string => {
    if (!disallowedKeys || !key.trim()) {
      return ''
    }
    const match = disallowedKeys.find((dk) => dk.key === key.trim())
    return match?.message ?? ''
  }

  return (
    <>
      {labels.length === 0 && (
        <p className="text-sm text-subtle italic">No metadata added</p>
      )}
      {labels.map((label, index) => {
        const keyError = getKeyError(label.key)
        return (
          <div key={label.id} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex flex-col gap-1">
                <input
                  type="text"
                  value={label.key}
                  onChange={(e) => handleChange(index, 'key', e.target.value)}
                  placeholder="Key"
                  className={
                    keyError
                      ? '!border-red-500 focus:!border-red-500 focus:!ring-red-500/10'
                      : ''
                  }
                />
                {keyError && (
                  <span className="text-xs text-red-500">{keyError}</span>
                )}
              </div>
              <span className="text-muted text-sm shrink-0 self-start mt-2">
                →
              </span>
              <input
                type="text"
                value={label.value}
                onChange={(e) => handleChange(index, 'value', e.target.value)}
                placeholder="Value"
                className="flex-1 self-start"
              />
              <IconButton
                icon={<TrashIcon className="size-4.5" />}
                label="Remove metadata"
                onClick={() => handleRemove(index)}
                className="text-red-600 hover:bg-red-50 shrink-0 self-start mt-0.5"
              />
            </div>
          </div>
        )
      })}
      <button
        type="button"
        onClick={handleAdd}
        className="flex items-center gap-1.5 text-sm text-brand hover:text-brand-strong transition-colors w-fit cursor-pointer mt-1"
      >
        <PlusIcon className="size-4" />
        Add metadata
      </button>
    </>
  )
}

export default KeyValueInput
