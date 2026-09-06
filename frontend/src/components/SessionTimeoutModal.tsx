import React from 'react'

interface SessionTimeoutModalProps {
  isOpen: boolean
  secondsLeft: number
  onStaySignedIn: () => void
  onSignOut: () => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0
    ? `${m}:${String(s).padStart(2, '0')}`
    : `${s}s`
}

/**
 * Security-first session timeout warning modal.
 * Shown 2 minutes before automatic logout due to inactivity.
 */
export default function SessionTimeoutModal({
  isOpen,
  secondsLeft,
  onStaySignedIn,
  onSignOut,
}: SessionTimeoutModalProps) {
  if (!isOpen) return null

  const progress = Math.max(0, Math.min(1, secondsLeft / 120)) // 120s = 2 min
  const circumference = 2 * Math.PI * 26 // r=26
  const strokeDash = circumference * progress
  const isUrgent = secondsLeft <= 30

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          animation: 'stFadeIn 0.25s ease',
        }}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="st-title"
        aria-describedby="st-desc"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 60%, #0f2044 100%)',
            border: '1px solid rgba(148,163,184,0.18)',
            borderRadius: '1.5rem',
            padding: '2.5rem 2.25rem 2rem',
            maxWidth: '420px',
            width: '100%',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,179,237,0.08) inset',
            animation: 'stSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            textAlign: 'center',
          }}
        >
          {/* Ring timer */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative', width: 72, height: 72 }}>
              <svg width="72" height="72" viewBox="0 0 60 60" style={{ transform: 'rotate(-90deg)' }}>
                {/* Track */}
                <circle
                  cx="30" cy="30" r="26"
                  fill="none"
                  stroke="rgba(148,163,184,0.15)"
                  strokeWidth="4"
                />
                {/* Progress */}
                <circle
                  cx="30" cy="30" r="26"
                  fill="none"
                  stroke={isUrgent ? '#f87171' : '#38bdf8'}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${strokeDash} ${circumference}`}
                  style={{ transition: 'stroke-dasharray 0.9s linear, stroke 0.4s' }}
                />
              </svg>
              {/* Center icon */}
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: '1.6rem' }}>🔒</span>
              </div>
            </div>
          </div>

          {/* Heading */}
          <h2
            id="st-title"
            style={{
              fontSize: '1.2rem',
              fontWeight: 700,
              color: '#f1f5f9',
              marginBottom: '0.5rem',
              letterSpacing: '-0.02em',
            }}
          >
            Session Expiring Soon
          </h2>

          {/* Description */}
          <p
            id="st-desc"
            style={{
              fontSize: '0.875rem',
              color: '#94a3b8',
              lineHeight: 1.6,
              marginBottom: '1.5rem',
            }}
          >
            You've been inactive for a while. For your security, you'll be automatically signed out in
          </p>

          {/* Countdown */}
          <div
            style={{
              fontSize: '2.75rem',
              fontWeight: 800,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.03em',
              color: isUrgent ? '#f87171' : '#38bdf8',
              marginBottom: '1.75rem',
              transition: 'color 0.4s',
              lineHeight: 1,
            }}
            aria-live="assertive"
            aria-atomic="true"
          >
            {formatTime(secondsLeft)}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              onClick={onSignOut}
              style={{
                flex: 1,
                padding: '0.7rem 1rem',
                borderRadius: '0.75rem',
                border: '1px solid rgba(148,163,184,0.2)',
                background: 'rgba(255,255,255,0.05)',
                color: '#94a3b8',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.15)'
                ;(e.currentTarget as HTMLButtonElement).style.color = '#f87171'
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(248,113,113,0.4)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'
                ;(e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(148,163,184,0.2)'
              }}
            >
              Sign Out
            </button>

            <button
              onClick={onStaySignedIn}
              autoFocus
              style={{
                flex: 2,
                padding: '0.7rem 1.25rem',
                borderRadius: '0.75rem',
                border: 'none',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(14,165,233,0.35)',
                transition: 'all 0.2s',
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 24px rgba(14,165,233,0.5)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(14,165,233,0.35)'
              }}
            >
              ✓ Stay Signed In
            </button>
          </div>

          {/* Fine print */}
          <p style={{ fontSize: '0.72rem', color: '#475569', marginTop: '1.25rem' }}>
            Move your mouse or press any key to continue your session automatically.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes stFadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes stSlideUp { from { opacity: 0; transform: translateY(24px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
      `}</style>
    </>
  )
}

