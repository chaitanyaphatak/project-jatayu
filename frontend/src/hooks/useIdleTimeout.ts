import { useEffect, useRef, useCallback, useState } from 'react'

const IDLE_TIMEOUT_MS   = 20 * 60 * 1000  // 20 minutes
const WARN_BEFORE_MS    =  2 * 60 * 1000  // warn 2 min before logout
const ACTIVITY_EVENTS   = [
  'mousemove', 'mousedown', 'keydown',
  'touchstart', 'scroll', 'wheel', 'click'
] as const

interface UseIdleTimeoutOptions {
  onTimeout: () => void
  enabled?: boolean
}

interface UseIdleTimeoutReturn {
  showWarning: boolean
  secondsLeft: number
  resetTimer: () => void
}

export function useIdleTimeout({
  onTimeout,
  enabled = true,
}: UseIdleTimeoutOptions): UseIdleTimeoutReturn {
  const [showWarning, setShowWarning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)

  const logoutTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warnTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownRef     = useRef<ReturnType<typeof setInterval> | null>(null)
  const warningActiveRef = useRef(false)

  const clearAllTimers = useCallback(() => {
    if (logoutTimerRef.current)  clearTimeout(logoutTimerRef.current)
    if (warnTimerRef.current)    clearTimeout(warnTimerRef.current)
    if (countdownRef.current)    clearInterval(countdownRef.current)
    logoutTimerRef.current  = null
    warnTimerRef.current    = null
    countdownRef.current    = null
  }, [])

  const startCountdown = useCallback(() => {
    let remaining = Math.round(WARN_BEFORE_MS / 1000)
    setSecondsLeft(remaining)
    countdownRef.current = setInterval(() => {
      remaining -= 1
      setSecondsLeft(remaining)
      if (remaining <= 0) {
        if (countdownRef.current) clearInterval(countdownRef.current)
      }
    }, 1000)
  }, [])

  const resetTimer = useCallback(() => {
    if (!enabled) return
    clearAllTimers()
    warningActiveRef.current = false
    setShowWarning(false)
    setSecondsLeft(0)

    warnTimerRef.current = setTimeout(() => {
      warningActiveRef.current = true
      setShowWarning(true)
      startCountdown()

      logoutTimerRef.current = setTimeout(() => {
        onTimeout()
      }, WARN_BEFORE_MS)
    }, IDLE_TIMEOUT_MS - WARN_BEFORE_MS)
  }, [enabled, clearAllTimers, startCountdown, onTimeout])

  useEffect(() => {
    if (!enabled) return

    resetTimer()

    const handleActivity = () => {
      if (!warningActiveRef.current) {
        resetTimer()
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !warningActiveRef.current) {
        resetTimer()
      }
    }

    ACTIVITY_EVENTS.forEach(evt =>
      window.addEventListener(evt, handleActivity, { passive: true })
    )
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearAllTimers()
      ACTIVITY_EVENTS.forEach(evt =>
        window.removeEventListener(evt, handleActivity)
      )
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])

  return { showWarning, secondsLeft, resetTimer }
}
