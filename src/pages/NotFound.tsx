import { Link } from 'react-router-dom'

const NotFound = () => (
  <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center py-16">
    <p className="text-7xl font-bold text-gray-300 leading-none select-none">
      404
    </p>
    <h1 className="text-2xl font-semibold text-foreground my-2">
      Page Not Found
    </h1>
    <p className="text-muted mb-6 max-w-sm">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <Link
      to="/"
      className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors"
    >
      Go to Home
    </Link>
  </div>
)

export default NotFound
