import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  BarChart3, Calendar, AlertTriangle, Layers, 
  Sparkles, Sprout, Users, TrendingUp, Settings, X 
} from 'lucide-react'

export default function MobileNav({ isOpen, onClose }) {
  const location = useLocation()

  const navItems = [
    { to: '/overview', label: 'Overview', icon: BarChart3 },
    { to: '/forecast', label: '7-Day Forecast', icon: Calendar },
    { to: '/alerts', label: 'Alerts & Warnings', icon: AlertTriangle },
    { to: '/maps', label: 'Interactive Maps', icon: Layers },
    { to: '/chat', label: 'AI Decision Chat', icon: Sparkles },
    { to: '/advisory', label: 'Agriculture & Aviation', icon: Sprout },
    { to: '/community', label: 'Community Ground Truth', icon: Users },
    { to: '/climate', label: 'Climate Trends', icon: TrendingUp },
    { to: '/settings', label: 'Settings', icon: Settings }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm lg:hidden flex">
      <div className="w-72 bg-white h-full shadow-2xl p-5 flex flex-col justify-between animate-in slide-in-from-left duration-200">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <span className="font-extrabold text-base text-slate-900">Navigation Menu</span>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1 mt-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.to || (item.to === '/overview' && location.pathname === '/')

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-sky-50 text-sky-800 border border-sky-200 font-black'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        <div className="text-[11px] text-slate-400 text-center font-medium pt-4 border-t border-slate-100">
          WeatherGPT Pan-India Platform
        </div>
      </div>
      <div className="flex-1" onClick={onClose} />
    </div>
  )
}
