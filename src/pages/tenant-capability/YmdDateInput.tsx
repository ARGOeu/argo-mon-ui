import { useEffect, useRef, useState } from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'

interface YmdDateInputProps {
  value: string // empty or YYY-MM-DD date
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  min?: string // min date in YYYY-MM-DD — days before this are disabled
  max?: string // max date in YYYY-MM-DD — days after this are disabled
}

const pad = (n: number) => String(n).padStart(2, '0')
const toYmd = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

const parseYmd = (s: string): Date | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isNaN(d.getTime()) ? null : d
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const YmdDateInput = ({
  value,
  onChange,
  placeholder,
  className,
  min,
  max,
}: YmdDateInputProps) => {
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => parseYmd(value) ?? new Date())
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => {
    const parsed = parseYmd(value)
    if (parsed) setViewDate(parsed)
  }, [value])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const selected = parseYmd(value)

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          placeholder={placeholder ?? 'YYYY-MM-DD'}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setOpen(true)}
          className={className}
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          aria-label="Open calendar"
        >
          <CalendarIcon className="size-4" />
        </button>
      </div>

      {open && (
        <div className="absolute z-10 mt-1 w-60 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="rounded px-1.5 py-0.5 text-slate-500 hover:bg-slate-100"
              aria-label="Previous month"
            >
              ‹
            </button>
            <span className="text-sm font-medium text-slate-700">
              {viewDate.toLocaleString('en-US', { month: 'long' })} {year}
            </span>
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="rounded px-1.5 py-0.5 text-slate-500 hover:bg-slate-100"
              aria-label="Next month"
            >
              ›
            </button>
          </div>

          <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-slate-400">
            {WEEKDAYS.map((w, i) => (
              <div key={i}>{w}</div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null) return <div key={i} />
              const cellYmd = toYmd(new Date(year, month, day))
              const isOutOfRange =
                (!!min && cellYmd < min) || (!!max && cellYmd > max)
              const isSelected =
                !!selected &&
                selected.getFullYear() === year &&
                selected.getMonth() === month &&
                selected.getDate() === day
              return (
                <button
                  key={i}
                  type="button"
                  disabled={isOutOfRange}
                  onClick={() => {
                    onChange(cellYmd)
                    setOpen(false)
                  }}
                  className={`rounded py-1 text-xs ${
                    isOutOfRange
                      ? 'cursor-not-allowed text-slate-300'
                      : isSelected
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700 hover:bg-blue-50'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {value && (
            <button
              type="button"
              onClick={() => {
                onChange('')
                setOpen(false)
              }}
              className="mt-2 w-full text-center text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default YmdDateInput
