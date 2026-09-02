import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

interface ClampedTextProps {
  text: string
  lines: number
  className?: string
}

const ClampedText = ({ text, lines, className }: ClampedTextProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isClamped, setIsClamped] = useState(false)
  const textRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const textElement = textRef.current
    if (textElement) {
      setIsClamped(textElement.scrollHeight > textElement.clientHeight)
    }
  }, [text, lines])

  const clampStyle: CSSProperties | undefined = isExpanded
    ? undefined
    : {
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: Math.max(1, Math.round(lines)),
        overflow: 'hidden',
      }

  return (
    <div>
      <p ref={textRef} style={clampStyle} className={className}>
        {text}
      </p>

      {isClamped && (
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-expanded={isExpanded}
          className="text-xs font-medium text-brand hover:underline cursor-pointer mt-0.5"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  )
}

export default ClampedText
