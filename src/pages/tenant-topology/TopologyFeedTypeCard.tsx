import { Fragment, useId } from 'react'
import type { ReactNode } from 'react'
import Badge from '@/components/Badge'
import type { FeedTextPart, TopologyFeedTypeInfo } from './topologyFeedTypeInfo'

const kindLabels: Record<TopologyFeedTypeInfo['kind'], string> = {
  generic: 'Generic',
  specific: 'Specific',
}

const kindClasses: Record<TopologyFeedTypeInfo['kind'], string> = {
  generic: 'bg-violet-100 text-violet-700',
  specific: 'bg-brand-muted text-brand-strong',
}

const hasContent = (parts?: FeedTextPart[]): parts is FeedTextPart[] =>
  !!parts?.some((part) =>
    typeof part === 'string' ? part.trim() !== '' : part.text.trim() !== '',
  )

interface FeedTextProps {
  parts: FeedTextPart[]
}

const FeedText = ({ parts }: FeedTextProps) => (
  <>
    {parts.map((part, index) =>
      typeof part === 'string' ? (
        <Fragment key={index}>{part}</Fragment>
      ) : (
        <a
          key={index}
          href={part.href}
          target="_blank"
          rel="noopener noreferrer"
          title={part.href}
          className="font-medium text-brand underline underline-offset-2 hover:text-brand-strong"
        >
          {part.text}
        </a>
      ),
    )}
  </>
)

interface TopologyFeedTypeCardProps {
  name: string
  value: string
  title: string
  info: TopologyFeedTypeInfo
  isSelected: boolean
  onSelect: (value: string) => void
  children?: ReactNode
}

const TopologyFeedTypeCard = ({
  name,
  value,
  title,
  info,
  isSelected,
  onSelect,
  children,
}: TopologyFeedTypeCardProps) => {
  const id = useId()
  const titleId = `${id}-title`
  const descriptionId = `${id}-description`

  const { logo, bestFor } = info
  const paragraphs = info.description.filter(hasContent)
  const showBestFor = hasContent(bestFor)
  const hasDescription = paragraphs.length > 0 || showBestFor

  return (
    <div
      className={`relative rounded-lg border has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand ${
        isSelected
          ? 'border-brand bg-brand-subtle'
          : 'border-line bg-white hover:border-line-strong hover:bg-surface-muted'
      }`}
    >
      <label
        className={`grid cursor-pointer items-start gap-x-3 gap-y-2 px-4 py-3 ${
          logo
            ? 'grid-cols-[auto_1fr_auto] sm:grid-rows-[auto_1fr]'
            : 'grid-cols-[1fr_auto]'
        }`}
      >
        <input
          type="radio"
          name={name}
          value={value}
          checked={isSelected}
          onChange={() => onSelect(value)}
          aria-labelledby={titleId}
          aria-describedby={hasDescription ? descriptionId : undefined}
          className="sr-only"
        />

        {logo && (
          <span className="flex size-16 items-center justify-center rounded-lg border border-line bg-white p-0.5 sm:row-span-2">
            <img src={logo} alt="" className="size-full object-contain" />
          </span>
        )}

        <span
          className={`flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 ${
            logo ? 'self-center sm:self-start' : 'self-start'
          }`}
        >
          <span
            id={titleId}
            className="text-base font-semibold text-foreground"
          >
            {title}
          </span>
          <Badge size="sm" className={kindClasses[info.kind]}>
            {kindLabels[info.kind]}
          </Badge>
        </span>

        <span
          aria-hidden="true"
          className={`mt-0.5 flex size-5 items-center justify-center rounded-full border-2 ${
            isSelected ? 'border-brand bg-brand' : 'border-line-strong bg-white'
          }`}
        >
          {isSelected && <span className="size-2 rounded-full bg-white" />}
        </span>

        {hasDescription && (
          <span
            id={descriptionId}
            className={`block min-w-0 max-w-4xl space-y-1.5 text-sm leading-5 ${
              logo
                ? 'col-span-3 sm:col-span-2 sm:col-start-2 sm:-mt-1'
                : 'col-span-2 -mt-1'
            }`}
          >
            {paragraphs.length > 0 && (
              <span className="block space-y-1 text-body">
                {paragraphs.map((parts, index) => (
                  <span key={index} className="block">
                    <FeedText parts={parts} />
                  </span>
                ))}
              </span>
            )}
            {showBestFor && (
              <span className="block text-muted">
                <span className="font-medium text-body">Best for: </span>
                <FeedText parts={bestFor} />
              </span>
            )}
          </span>
        )}
      </label>

      {isSelected && children && (
        <div
          className={`border-t border-brand-muted px-4 pb-3 pt-2.5 ${
            logo ? 'sm:pl-23' : ''
          }`}
        >
          {children}
        </div>
      )}
    </div>
  )
}

export default TopologyFeedTypeCard
