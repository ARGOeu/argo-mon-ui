import Button from '@/components/Button'

interface NotFoundProps {
  showHomeButton?: boolean
}

const NotFound = ({ showHomeButton = true }: NotFoundProps) => (
  <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center py-16">
    <p className="text-7xl font-bold text-gray-300 leading-none select-none">
      404
    </p>
    <h1 className="text-2xl font-semibold text-foreground my-2">
      Page Not Found
    </h1>
    <p className="text-muted mb-4 max-w-sm">
      The page you're looking for doesn't exist or has been moved.
    </p>
    {showHomeButton && (
      <Button href="/" size="sm">
        Go to Home
      </Button>
    )}
  </div>
)

export default NotFound
