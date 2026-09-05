import React, { useEffect } from 'react'
import { NavLink, useLocation, Link } from 'react-router-dom'
import { 
  BarChart3, Calendar, AlertTriangle, Layers, 
  Sparkles, Sprout, Users, TrendingUp, Settings, X, CloudRain, Award,
  MapPin, ShieldCheck, CheckCircle2
} from 'lucide-react'

export default function MobileNav({ isOpen, onClose, currentLocation, trustScore }) {
  const location = useLocation()

  const navItems = [
    { to: '/overview', label: 'Overview', icon: BarChart3, badge: 'Live' },
    { to: '/forecast', label: '7-Day Forecast', icon: Calendar },
    { to: '/alerts', label: 'Weather Alerts', icon: AlertTriangle, badge: 'Active', badgeColor: 'bg-amber-100 text-amber-800' },
    { to: '/maps', label: 'Interactive Maps', icon: Layers },
    { to: '/chat', label: 'Vayu AI Assistant', icon: Sparkles, badge: 'AI', badgeColor: 'bg-sky-100 text-sky-700' },
    { to: '/advisory', label: 'Farmer & Aviation Guide', icon: Sprout },
    { to: '/community', label: 'Community Reports', icon: Users },
    { to: '/climate', label: 'Climate & History', icon: TrendingUp },
    { to: '/settings', label: 'Settings', icon: Settings }
  ]

  // Close drawer on Escape key and lock body scroll
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm lg:hidden flex">
      <div className="w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-left duration-200">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-50/60 to-white shrink-0">
          <Link 
            to="/overview"
            onClick={() => {
              onClose()
              if (location.pathname === '/overview' || location.pathname === '/') {
                window.location.reload()
              }
            }}
            className="flex items-center gap-2.5"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 ring-2 ring-sky-100">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base text-slate-900">WeatherGPT</span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 border border-sky-200">
                  LIVE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Smart Weather Platform</p>
            </div>
          </Link>
          <button 
            onClick={onClose}
            aria-label="Close navigation menu"
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links Navigation */}
        <div className="p-3 flex-1 overflow-y-auto space-y-1">
          <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Menu
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.to || (item.to === '/overview' && location.pathname === '/')

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? 'bg-sky-50 text-sky-800 border border-sky-200/90 font-black shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-emerald-100 text-emerald-800'}`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Rich Drawer Footer (Eliminating blank white void) */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/80 shrink-0 space-y-2.5">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {currentLocation?.name?.split(',')[0] || 'Pune'}
                </p>
                <p className="text-[10px] text-slate-400 font-medium truncate">
                  {currentLocation?.state || 'Maharashtra'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 flex items-center gap-1 shrink-0">
              <Award className="w-3 h-3 text-amber-600" /> {trustScore} pts
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium px-1">
            <span>© 2026 WeatherGPT</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Live Data
            </span>
          </div>
        </div>

      </div>

      {/* Backdrop click to close */}
      <div className="flex-1" onClick={onClose} />
    </div>
  )
}
