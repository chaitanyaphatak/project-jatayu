import React from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'
import { Lock } from 'lucide-react'

interface AuthProtectedActionProps {
  onAction: () => void
  children: React.ReactNode
  fallbackMessage?: string
  className?: string
  showLockIcon?: boolean
}

/**
 * Reusable wrapper for buttons and interactive elements that require Clerk Authentication.
 * If user is signed in -> executes onAction()
 * If user is signed out -> opens Clerk modal sign-in with clear UX prompt.
 */
export default function AuthProtectedAction({
  onAction,
  children,
  fallbackMessage = 'Please sign in to access this feature.',
  className = '',
  showLockIcon = false
}: AuthProtectedActionProps) {
  const { isSignedIn } = useUser()
  const { openSignIn } = useClerk()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isSignedIn) {
      onAction()
    } else {
      openSignIn({
        fallbackRedirectUrl: window.location.pathname
      })
    }
  }

  return (
    <div onClick={handleClick} className={`inline-flex items-center cursor-pointer ${className}`}>
      {children}
      {!isSignedIn && showLockIcon && (
        <Lock className="w-3 h-3 ml-1 text-slate-400 opacity-80 shrink-0" />
      )}
    </div>
  )
}

/**
 * Custom React hook to wrap any arbitrary callback with an authentication gate.
 */
export function useAuthGate() {
  const { isSignedIn, user } = useUser()
  const { openSignIn } = useClerk()

  const executeGuarded = (callback: () => void, promptMessage?: string) => {
    if (isSignedIn) {
      callback()
    } else {
      openSignIn({
        fallbackRedirectUrl: window.location.pathname
      })
    }
  }

  return {
    isSignedIn: Boolean(isSignedIn),
    user,
    executeGuarded
  }
}
