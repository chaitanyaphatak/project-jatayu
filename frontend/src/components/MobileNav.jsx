import React, { useEffect } from 'react'
import { NavLink, useLocation, Link } from 'react-router-dom'
import { 
  BarChart3, Calendar, AlertTriangle, Layers, 
  Sparkles, Sprout, Users, TrendingUp, Settings, X, CloudRain, Award
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
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm lg:hidden flex">
      <div className="w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
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
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-sm">
              <CloudRain className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-900">WeatherGPT</span>
              <span className="ml-1 text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 border border-sky-200">
                LIVE
              </span>
            </div>
          </Link>
          <button 
            onClick={onClose}
            aria-label="Close navigation menu"
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links Navigation */}
        <div className="p-3 flex-1 overflow-y-auto">
          <p className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
                  className={`flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-sky-50 text-sky-800 border border-sky-200 font-black shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${item.badgeColor || 'bg-emerald-100 text-emerald-800'}`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-1 text-center">
          <p className="text-xs font-bold text-slate-800 truncate">
            {currentLocation?.name || 'Selected City'}
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            WeatherGPT Smart Weather Platform
          </p>
        </div>

      </div>

      {/* Backdrop click to close */}
      <div className="flex-1" onClick={onClose} />
    </div>
  )
}
