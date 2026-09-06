import React, { useEffect, useRef, useState } from 'react'
import { WeatherThemeKey, WEATHER_THEMES } from '../utils/weatherThemes'

interface WeatherBackgroundProps {
  theme?: WeatherThemeKey | string
  className?: string
  children?: React.ReactNode
  showControls?: boolean
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  length?: number
  opacity: number
  pulseSpeed?: number
  phase?: number
  sway?: number
}

export default function WeatherBackground({
  theme = 'sunny-day',
  className = '',
  children,
}: WeatherBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // Safe theme key with fallback
  const validThemeKey: WeatherThemeKey = (WEATHER_THEMES[theme as WeatherThemeKey] ? theme : 'sunny-day') as WeatherThemeKey
  
  // Crossfade state management
  const [currentTheme, setCurrentTheme] = useState<WeatherThemeKey>(validThemeKey)
  const [prevTheme, setPrevTheme] = useState<WeatherThemeKey | null>(null)
  const [isCrossfading, setIsCrossfading] = useState(false)
  
  // Reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  // Handle theme transitions with smooth crossfade (~700ms)
  useEffect(() => {
    if (validThemeKey !== currentTheme) {
      setPrevTheme(currentTheme)
      setCurrentTheme(validThemeKey)
      setIsCrossfading(true)

      const timer = setTimeout(() => {
        setPrevTheme(null)
        setIsCrossfading(false)
      }, 750)

      return () => clearTimeout(timer)
    }
  }, [validThemeKey, currentTheme])

  // Reduced motion check
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // Visibility detection with IntersectionObserver (lazy-initialize and throttle when out of viewport)
  useEffect(() => {
    if (!containerRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.05 }
    )
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // Canvas particle engine
  useEffect(() => {
    if (prefersReducedMotion || !isVisible) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = canvas.parentElement?.clientWidth || 300)
    let height = (canvas.height = canvas.parentElement?.clientHeight || 200)

    // Handle resize
    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return
      width = canvas.width = canvas.parentElement.clientWidth
      height = canvas.height = canvas.parentElement.clientHeight
    }
    window.addEventListener('resize', handleResize)

    const currentConfig = WEATHER_THEMES[currentTheme]
    const themeType = currentConfig.type
    const isNight = currentConfig.isNight

    // Particle pool
    const particles: Particle[] = []

    // 1. Initialize Particles depending on Theme Type
    if (themeType === 'rainy' || themeType === 'stormy') {
      const rainCount = themeType === 'stormy' ? 45 : 32
      for (let i = 0; i < rainCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: -1.2 + Math.random() * 0.5,
          vy: 8 + Math.random() * 6,
          length: 12 + Math.random() * 14,
          size: 1.2,
          opacity: 0.25 + Math.random() * 0.45,
        })
      }
    } else if (themeType === 'snowy') {
      const snowCount = 30
      for (let i = 0; i < snowCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.6,
          vy: 0.8 + Math.random() * 1.2,
          size: 1.5 + Math.random() * 2.5,
          opacity: 0.4 + Math.random() * 0.5,
          sway: Math.random() * Math.PI * 2,
        })
      }
    } else if (isNight) {
      // Starry particles for all night themes
      const starCount = 35
      for (let i = 0; i < starCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * (height * 0.85),
          vx: 0,
          vy: 0,
          size: 0.8 + Math.random() * 1.6,
          opacity: 0.2 + Math.random() * 0.7,
          pulseSpeed: 0.02 + Math.random() * 0.03,
          phase: Math.random() * Math.PI * 2,
        })
      }
    } else if (themeType === 'sunny') {
      // Warm sunlit ambient dust motes
      const moteCount = 18
      for (let i = 0; i < moteCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -0.3 - Math.random() * 0.4,
          size: 1.2 + Math.random() * 2.0,
          opacity: 0.2 + Math.random() * 0.4,
          phase: Math.random() * Math.PI * 2,
        })
      }
    }

    let time = 0

    const render = () => {
      time += 0.02
      ctx.clearRect(0, 0, width, height)

      if (themeType === 'rainy' || themeType === 'stormy') {
        // Rain particle rendering
        ctx.lineWidth = 1.2
        ctx.lineCap = 'round'

        for (const p of particles) {
          p.x += p.vx
          p.y += p.vy

          if (p.y > height) {
            p.y = -p.length!
            p.x = Math.random() * (width + 40)
          }
          if (p.x < 0) {
            p.x = width + 20
          }

          ctx.beginPath()
          ctx.strokeStyle = isNight
            ? `rgba(186, 230, 253, ${p.opacity})`
            : `rgba(255, 255, 255, ${p.opacity})`
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x + p.vx * 2, p.y + p.length!)
          ctx.stroke()
        }
      } else if (themeType === 'snowy') {
        // Snow particle rendering
        for (const p of particles) {
          p.sway! += 0.02
          p.x += p.vx + Math.sin(p.sway!) * 0.5
          p.y += p.vy

          if (p.y > height) {
            p.y = -5
            p.x = Math.random() * width
          }
          if (p.x > width) p.x = 0
          if (p.x < 0) p.x = width

          ctx.beginPath()
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
        }
      } else if (isNight) {
        // Twinkling stars rendering
        for (const p of particles) {
          const currentAlpha = Math.max(
            0.1,
            Math.min(0.95, p.opacity + Math.sin(time * 2 + (p.phase || 0)) * 0.25)
          )
          ctx.beginPath()
          ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
        }
      } else if (themeType === 'sunny') {
        // Floating sun motes rendering
        for (const p of particles) {
          p.x += p.vx
          p.y += p.vy
          if (p.y < 0) {
            p.y = height + 5
            p.x = Math.random() * width
          }
          const alpha = p.opacity * (0.6 + Math.sin(time + (p.phase || 0)) * 0.4)
          ctx.beginPath()
          ctx.fillStyle = `rgba(254, 243, 199, ${alpha})`
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [currentTheme, prefersReducedMotion, isVisible])

  const curConfig = WEATHER_THEMES[currentTheme]
  const prevConfig = prevTheme ? WEATHER_THEMES[prevTheme] : null

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden transition-all duration-700 ${className}`}
    >
      {/* ─── LAYER A: PREVIOUS THEME (FADING OUT DURING CROSSFADE) ─── */}
      {isCrossfading && prevConfig && (
        <div
          className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-700 ease-in-out opacity-0"
          style={{ background: prevConfig.skyGradient }}
        >
          <VisualDecorations themeConfig={prevConfig} isReducedMotion={prefersReducedMotion} />
        </div>
      )}

      {/* ─── LAYER B: CURRENT THEME (FADING IN) ─── */}
      <div
        className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-700 ease-in-out ${
          isCrossfading ? 'opacity-100 animate-in fade-in duration-700' : 'opacity-100'
        }`}
        style={{ background: curConfig.skyGradient }}
      >
        <VisualDecorations themeConfig={curConfig} isReducedMotion={prefersReducedMotion} />
      </div>

      {/* ─── LAYER C: LIGHTWEIGHT HTML5 CANVAS PARTICLES ─── */}
      {!prefersReducedMotion && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-1 pointer-events-none w-full h-full"
        />
      )}

      {/* ─── LAYER D: CONTRAST VIGNETTE OVERLAY (ENSURES HIGH TEXT READABILITY) ─── */}
      <div
        className="absolute inset-0 z-2 pointer-events-none"
        style={{
          background: curConfig.isNight
            ? 'linear-gradient(180deg, rgba(15, 23, 42, 0.25) 0%, rgba(15, 23, 42, 0.15) 50%, rgba(15, 23, 42, 0.45) 100%)'
            : 'linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.35) 100%)',
        }}
      />

      {/* ─── FOREGROUND CONTENT ─── */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  )
}

/**
 * Visual Decorative Elements (Sun Flares, Cloud Shapes, Mist Waves, Lightning Flash)
 * Uses GPU-accelerated transforms (transform, opacity) exclusively.
 */
function VisualDecorations({
  themeConfig,
  isReducedMotion,
}: {
  themeConfig: typeof WEATHER_THEMES[WeatherThemeKey]
  isReducedMotion: boolean
}) {
  const { type, isNight } = themeConfig

  if (isReducedMotion) {
    return null
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 1. SUNNY DAY DECORATIONS (Sunburst Glow & Radial Aura) */}
      {type === 'sunny' && !isNight && (
        <>
          {/* Main Sun Disc with Breathing Pulse */}
          <div
            className="absolute -top-12 -right-12 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-radial from-amber-200/90 via-amber-300/40 to-transparent blur-xl"
            style={{
              animation: 'sunGlowPulse 6s ease-in-out infinite alternate',
              willChange: 'transform, opacity',
            }}
          />
          {/* Subtle Secondary Golden Halo */}
          <div
            className="absolute -top-4 -right-4 w-32 h-32 rounded-full bg-gradient-to-br from-yellow-100/80 to-amber-400/20 blur-md"
            style={{
              animation: 'sunGlowPulse 4s ease-in-out infinite alternate-reverse',
              willChange: 'transform, opacity',
            }}
          />
        </>
      )}

      {/* 2. CLEAR NIGHT DECORATIONS (Moon Halo Glow) */}
      {type === 'sunny' && isNight && (
        <div
          className="absolute top-2 right-4 w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-radial from-indigo-200/25 via-sky-300/10 to-transparent blur-lg"
          style={{
            animation: 'moonGlow 8s ease-in-out infinite alternate',
            willChange: 'transform, opacity',
          }}
        />
      )}

      {/* 3. CLOUDY DECORATIONS (Multi-layered Drifting Organic Cloud Shapes) */}
      {type === 'cloudy' && (
        <>
          {/* Back Cloud Layer (Slower, Larger) */}
          <div
            className={`absolute top-1 -left-20 w-[140%] h-24 sm:h-32 rounded-full ${
              isNight ? 'bg-slate-700/25' : 'bg-white/35'
            } blur-2xl`}
            style={{
              animation: 'cloudDriftSlow 42s linear infinite',
              willChange: 'transform',
            }}
          />
          {/* Mid Cloud Layer */}
          <div
            className={`absolute top-8 -left-10 w-[120%] h-20 sm:h-28 rounded-full ${
              isNight ? 'bg-slate-800/30' : 'bg-white/45'
            } blur-xl`}
            style={{
              animation: 'cloudDriftMid 28s linear infinite',
              willChange: 'transform',
            }}
          />
          {/* Front Cloud Puff */}
          <div
            className={`absolute top-14 left-1/4 w-48 h-16 rounded-full ${
              isNight ? 'bg-slate-900/35' : 'bg-white/60'
            } blur-lg`}
            style={{
              animation: 'cloudDriftFast 20s linear infinite',
              willChange: 'transform',
            }}
          />
        </>
      )}

      {/* 4. STORMY DECORATIONS (Lightning Flash Overlay) */}
      {type === 'stormy' && (
        <>
          {/* Periodic Lightning Flash Overlay */}
          <div
            className="absolute inset-0 bg-purple-100/40 mix-blend-screen pointer-events-none"
            style={{
              animation: 'lightningFlash 7.5s ease-in-out infinite',
              willChange: 'opacity',
            }}
          />
          {/* Ominous Dark Cloud Masses */}
          <div
            className="absolute -top-10 -left-10 w-[130%] h-36 bg-indigo-950/60 blur-2xl"
            style={{
              animation: 'cloudDriftMid 24s linear infinite',
              willChange: 'transform',
            }}
          />
        </>
      )}

      {/* 5. FOGGY / HUMID DECORATIONS (Drifting Translucent Mist Waves) */}
      {type === 'foggy' && (
        <>
          <div
            className={`absolute -bottom-8 -left-20 w-[150%] h-36 ${
              isNight ? 'bg-slate-600/30' : 'bg-white/50'
            } blur-3xl`}
            style={{
              animation: 'fogWave 16s ease-in-out infinite alternate',
              willChange: 'transform, opacity',
            }}
          />
          <div
            className={`absolute top-4 -left-10 w-[130%] h-28 ${
              isNight ? 'bg-slate-700/25' : 'bg-slate-200/40'
            } blur-2xl`}
            style={{
              animation: 'fogWave 22s ease-in-out infinite alternate-reverse',
              willChange: 'transform, opacity',
            }}
          />
        </>
      )}
    </div>
  )
}
