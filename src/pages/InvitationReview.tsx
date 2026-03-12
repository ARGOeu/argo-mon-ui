import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/auth/useAuth'
import {
  useGetUserInvitationById,
  useRespondToInvitation,
} from '@/hooks/useInvitations'
import Button from '@/components/Button'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorDisplay from '@/components/ErrorDisplay'
import { toast } from 'sonner'

const containerClass =
  'min-h-screen flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-[#f5f7fa] to-[#e9ecef]'

const cardClass =
  'bg-white rounded-xl shadow-lg px-6 sm:px-10 py-6 max-w-[600px] w-full'

export const InvitationReview = () => {
  const { id: invitationId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { authenticated, initialized, registered, login } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)

  const {
    data: invitation,
    isLoading,
    error,
  } = useGetUserInvitationById(
    invitationId || '',
    authenticated && registered && !!invitationId,
  )

  const respondMutation = useRespondToInvitation()

  useEffect(() => {
    if (initialized && !authenticated) {
      login(window.location.href)
    }
  }, [initialized, authenticated, login])

  const handleAccept = () => {
    if (!invitationId) return

    setIsProcessing(true)
    respondMutation.mutate(
      {
        invitationId,
        data: { action: 'ACCEPT' },
      },
      {
        onSuccess: async () => {
          toast.success('Invitation accepted successfully!')

          setTimeout(() => {
            navigate('/my-invitations')
          }, 2000)
        },
        onError: (error) => {
          toast.error(`Failed to accept invitation: ${error.message}`)
          setIsProcessing(false)
        },
      },
    )
  }

  const handleReject = () => {
    if (!invitationId) return

    setIsProcessing(true)
    respondMutation.mutate(
      {
        invitationId,
        data: { action: 'REJECT' },
      },
      {
        onSuccess: () => {
          toast.success('Invitation rejected')
          setTimeout(() => {
            navigate('/')
          }, 2000)
        },
        onError: (error) => {
          toast.error(`Failed to reject invitation: ${error.message}`)
          setIsProcessing(false)
        },
      },
    )
  }

  if (!initialized || !authenticated || !registered || isLoading) {
    return (
      <div className={containerClass}>
        <div className="flex flex-col items-center gap-4 text-muted">
          <LoadingSpinner />
          <p>Loading invitation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <>
        <div className={containerClass}>
          <div className={cardClass}>
            <ErrorDisplay
              error={
                error ||
                'This invitation may have expired or is no longer valid.'
              }
              context="invitation"
            />
            <div className="mt-6">
              <Button variant="secondary" size="md" href="/">
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (invitation && invitation.status !== 'PENDING') {
    const isPreviouslyAccepted = invitation.status === 'ACCEPTED'

    return (
      <>
        <div className={containerClass}>
          <div className={cardClass}>
            <div className="flex justify-center mb-6">
              {isPreviouslyAccepted ? (
                <CheckCircleIcon className="size-16 text-emerald-500" />
              ) : (
                <XCircleIcon className="size-16 text-amber-500" />
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 m-0 mb-1">
              Invitation Processed
            </h1>
            <p className="text-base text-muted text-center mt-4 mb-8 leading-relaxed">
              You have {invitation.status.toLowerCase()} this invitation to join{' '}
              <strong className="text-gray-800 font-semibold">
                {invitation.tenant_name}
              </strong>
              .
            </p>
            <div className="flex flex-col sm:flex-row justify-between flex-wrap gap-3">
              {isPreviouslyAccepted && (
                <Button
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto"
                  href="/my-invitations"
                >
                  My Invitations
                </Button>
              )}
              <Button
                variant="secondary"
                size="md"
                className="w-full sm:w-auto"
                href="/"
              >
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className={containerClass}>
        <div className={cardClass}>
          <div className="text-center mb-4 pb-3 border-b-2 border-line">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 m-0 mb-1">
              Tenant Invitation
            </h1>
            <p className="text-base text-muted m-0">
              Review and respond to this invitation
            </p>
          </div>

          <div className="mb-6">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-body tracking-wide">
                  Tenant Name
                </label>
                <div className="text-sm text-gray-800 px-3 py-2 bg-surface-muted rounded-md border border-line">
                  {invitation?.tenant_name || 'N/A'}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-body tracking-wide">
                  Role
                </label>
                <div className="text-sm text-gray-800 px-3 py-2 bg-surface-muted rounded-md border border-line">
                  {invitation?.role === 'admin' ? 'Tenant Admin' : 'Member'}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-body tracking-wide">
                  Email
                </label>
                <div className="text-sm text-gray-800 px-3 py-2 bg-surface-muted rounded-md border border-line">
                  {invitation?.email || 'N/A'}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-body tracking-wide">
                  Invited On
                </label>
                <div className="text-sm text-gray-800 px-3 py-2 bg-surface-muted rounded-md border border-line">
                  {invitation?.created_at
                    ? new Date(invitation.created_at).toLocaleString('en-GB', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'N/A'}
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-brand-subtle border border-blue-200 rounded-lg">
              <p className="m-0 text-sm text-blue-800 leading-relaxed">
                By accepting this invitation, you will become a{' '}
                <strong>
                  {invitation?.role === 'admin' ? 'Tenant Admin' : 'Member'}
                </strong>{' '}
                of the <strong>{invitation?.tenant_name}</strong> tenant. You
                will be able to
                {invitation?.role === 'admin'
                  ? ' manage tenant settings, members, and projects.'
                  : ' view tenant information.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between flex-wrap gap-3">
            <Button
              variant="secondary"
              size="md"
              className="w-full sm:w-auto"
              onClick={handleReject}
              disabled={isProcessing}
            >
              {isProcessing &&
              respondMutation.variables?.data.action === 'REJECT' ? (
                <>
                  <LoadingSpinner size="sm" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircleIcon className="size-6" />
                  Reject Invitation
                </>
              )}
            </Button>
            <Button
              variant="primary"
              size="md"
              className="w-full sm:w-auto"
              onClick={handleAccept}
              disabled={isProcessing}
            >
              {isProcessing &&
              respondMutation.variables?.data.action === 'ACCEPT' ? (
                <>
                  <LoadingSpinner size="sm" />
                  Accepting...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="size-6" />
                  Accept Invitation
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
