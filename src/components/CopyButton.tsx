import { useEffect, useRef, useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { Check, Copy } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type CopyButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const COPIED_DELAY = 1500
const COPIED_TEXT = 'Copied'

const sizeClasses: Record<CopyButtonSize, { padding: string; icon: string }> = {
  xs: { padding: 'p-0.5', icon: 'size-3' },
  sm: { padding: 'p-1', icon: 'size-3.5' },
  md: { padding: 'p-1', icon: 'size-4' },
  lg: { padding: 'p-1.5', icon: 'size-5' },
  xl: { padding: 'p-2', icon: 'size-6' },
}

const looks = {
  light: {
    shape: 'rounded',
    stroke: 2,
    idle: 'text-subtle hover:bg-surface-strong hover:text-body',
    copied: 'bg-emerald-100 text-emerald-700',
  },
  dark: {
    shape: 'rounded',
    stroke: 2,
    idle: 'text-slate-400 hover:bg-slate-800 hover:text-white',
    copied: 'text-emerald-400',
  },
  overlay: {
    shape: 'rounded-sm',
    stroke: 2.5,
    idle: 'text-white/50 hover:bg-white/20 hover:text-white',
    copied: 'text-white/50 hover:bg-white/20 hover:text-white',
  },
}

interface CopyButtonProps {
  value: string | (() => string)
  label: string
  copiedLabel?: string
  size?: CopyButtonSize
  dark?: boolean
  overlay?: boolean
  icon?: LucideIcon
  children?: ReactNode
  stopPropagation?: boolean
  onCopiedChange?: (copied: boolean) => void
  className?: string
}

const CopyButton = ({
  value,
  label,
  copiedLabel = 'Copied!',
  size = 'sm',
  dark = false,
  overlay = false,
  icon: Icon = Copy,
  children,
  stopPropagation = false,
  onCopiedChange,
  className = '',
}: CopyButtonProps) => {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMountedRef = useRef(false)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const handleClick = async (e: MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) {
      e.stopPropagation()
    }
    const text = typeof value === 'function' ? value() : value
    if (!text) {
      return
    }
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error('Failed to copy:', error)
      return
    }
    if (!isMountedRef.current) {
      return
    }
    setCopied(true)
    onCopiedChange?.(true)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    timerRef.current = setTimeout(() => {
      setCopied(false)
      onCopiedChange?.(false)
    }, COPIED_DELAY)
  }

  const look = overlay ? looks.overlay : dark ? looks.dark : looks.light
  const { padding, icon: iconSize } = sizeClasses[size]
  const currentLabel = copied ? copiedLabel : label

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex shrink-0 cursor-pointer items-center justify-center transition-colors ${
        look.shape
      } ${children ? 'gap-1 px-1 py-0.5' : padding} ${
        copied ? look.copied : look.idle
      } ${className}`}
      aria-label={currentLabel}
      title={currentLabel}
    >
      {copied ? (
        <Check className={iconSize} strokeWidth={2.5} />
      ) : (
        <Icon className={iconSize} strokeWidth={look.stroke} />
      )}
      {children && (copied ? COPIED_TEXT : children)}
    </button>
  )
}

export default CopyButton
