import React, { useState } from 'react'
import { useSignIn, SignInButton } from '@clerk/clerk-react'

export function GoogleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  )
}

export default function GoogleSignInButton({ 
  className = "", 
  children, 
  variant = "standard" // "standard" | "compact" | "full"
}) {
  const { signIn, isLoaded } = useSignIn()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [error, setError] = useState(null)

  const handleGoogleSignIn = async () => {
    if (!isLoaded || !signIn) return
    setIsSigningIn(true)
    setError(null)
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: window.location.pathname || '/'
      })
    } catch (err) {
      console.warn('Direct Google OAuth redirect error, falling back to Clerk modal:', err)
      setError('Please use sign-in popup')
      setIsSigningIn(false)
    }
  }

  // If OAuth direct call threw or isn't loaded, fallback gracefully to SignInButton modal
  if (!isLoaded) {
    return (
      <SignInButton mode="modal">
        <button 
          type="button" 
          className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-xs ${className}`}
        >
          <GoogleIcon className="w-3.5 h-3.5" />
          <span>{children || "Continue with Google"}</span>
        </button>
      </SignInButton>
    )
  }

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={isSigningIn}
      title="Sign in securely with your Google Account"
      className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-xs hover:shadow hover:border-slate-300 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      <GoogleIcon className="w-4 h-4 shrink-0" />
      <span>{isSigningIn ? "Connecting Google..." : (children || "Continue with Google")}</span>
    </button>
  )
}
