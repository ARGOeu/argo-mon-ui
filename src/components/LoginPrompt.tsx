import Button from './Button'
import { LockClosedIcon } from '@heroicons/react/24/outline'

interface LoginPromptProps {
  title?: string
  description?: string
  onLogin: () => void
}

function LoginPrompt({
  title = 'Authentication Required',
  description = 'Please login to access this page and manage your status pages',
  onLogin,
}: LoginPromptProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md">
        <div className="mb-2">
          <LockClosedIcon className="mx-auto h-16 w-16 text-subtle" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground mb-1">{title}</h2>
        <p className="text-muted mb-4">{description}</p>
        <Button variant="primary" size="md" onClick={() => onLogin()}>
          Login
        </Button>
      </div>
    </div>
  )
}

export default LoginPrompt
