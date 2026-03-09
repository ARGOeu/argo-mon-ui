interface CardProps {
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

const Card = ({ children, footer, className }: CardProps) => (
  <div
    className={`bg-white border border-line rounded-lg overflow-visible flex flex-col ${className ?? ''}`}
  >
    <div className="flex-1">{children}</div>
    {footer && (
      <div className="bg-surface-muted py-1 px-4 border-t border-gray-100 flex justify-end items-center gap-2 rounded-b-lg">
        {footer}
      </div>
    )}
  </div>
)

export default Card
