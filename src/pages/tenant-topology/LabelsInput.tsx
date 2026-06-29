import { useState, type KeyboardEvent } from 'react'
import { XMarkIcon } from '@heroicons/react/16/solid'

interface LabelsInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
}

const LabelsInput = ({ tags, onChange }: LabelsInputProps) => {
  const [inputValue, setInputValue] = useState('')
  const [inputError, setInputError] = useState('')

  const addTag = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed || tags.includes(trimmed)) {
      setInputValue('')
      setInputError('')
      return
    }
    onChange([...tags, trimmed])
    setInputValue('')
    setInputError('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.includes(',')) {
      setInputError('Commas are not allowed in labels')
      return
    }
    setInputError('')
    setInputValue(value)
  }

  const handleRemove = (index: number) => {
    onChange(tags.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap gap-1.5 items-center border border-line-strong rounded-md px-3 py-1.5 bg-white focus-within:ring-2 focus-within:ring-brand/10 focus-within:border-brand cursor-text">
        {tags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="inline-flex items-center gap-1 bg-brand-muted text-brand text-xs font-medium px-2 py-0.5 rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="text-brand/70 hover:text-brand-strong hover:bg-brand/20 rounded-full p-px transition-colors cursor-pointer"
              aria-label={`Remove ${tag}`}
            >
              <XMarkIcon className="size-4" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={
            tags.length === 0
              ? `Type and press 'Enter' or 'Space' to add...`
              : ''
          }
          className="flex-1 min-w-[120px] !border-transparent !ring-0 p-0 text-sm bg-transparent"
        />
      </div>
      {inputError && <span className="text-xs text-red-500">{inputError}</span>}
    </div>
  )
}

export default LabelsInput
