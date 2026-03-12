import { MagnifyingGlassIcon } from '@heroicons/react/16/solid'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  placeholder?: string
  maxWidth?: string
  className?: string
}

const SearchInput = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  maxWidth = 'max-w-sm',
  className,
}: SearchInputProps) => (
  <div className={`mb-2 ${className ?? ''}`}>
    <div className={`relative ${maxWidth}`}>
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-subtle pointer-events-none" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full py-2 pl-10 pr-10 text-sm"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 size-6 flex items-center justify-center p-3 bg-transparent border-none text-muted text-2xl cursor-pointer rounded-full transition-all hover:bg-surface-strong hover:text-body"
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  </div>
)

export default SearchInput
