import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  BarChart3, Calendar, AlertTriangle, Layers, Sparkles, 
  Sprout, Users, TrendingUp, Settings, CloudRain, MapPin, 
  ShieldCheck, Award, ChevronRight
} from 'lucide-react'

export default function Sidebar({ currentLocation, trustScore, userRole }) {
  const location = useLocation()

  const navItems = [
    { to: '/overview', label: 'Overview', icon: BarChart3, badge: 'Live' },
    { to: '/forecast', label: '7-Day & Hourly Forecast', icon: Calendar },
    { to: '/alerts', label: 'Alerts & Anomalies', icon: AlertTriangle, badge: 'Active', badgeColor: 'bg-amber-100 text-amber-800' },
    { to: '/maps', label: 'Interactive Maps & Radar', icon: Layers },
    { to: '/chat', label: 'WeatherGPT AI Assistant', icon: Sparkles, badge: 'AI', badgeColor: 'bg-sky-100 text-sky-700' },
    { to: '/advisory', label: 'Agricultural & Aviation', icon: Sprout },
    { to: '/community', label: 'Community Ground Truth', icon: Users },
    { to: '/climate', label: 'Climate Trends & History', icon: TrendingUp },
    { to: '/settings', label: 'Settings & Preferences', icon: Settings }
  ]

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0 hidden lg:flex select-none z-30 shadow-xs">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-sky-600 to-blue-600 flex items-center justify-center shadow-md shadow-sky-500/20 ring-2 ring-sky-100">
            <CloudRain className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900">WeatherGPT</span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Pan-India AI Intelligence</p>
          </div>
        </div>

        {/* Navigation Section Links */}
        <nav className="p-3 space-y-1">
          <p className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.to || (item.to === '/overview' && location.pathname === '/')

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-sky-50 text-sky-800 shadow-xs border border-sky-200/70 font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold'
                }`}
              >
                <div className="flex items-center gap-2.5">
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

      {/* Sidebar Location & Trust Footer */}
      <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-slate-50 to-sky-50/50 border border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase text-slate-400">Selected Location</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
        <p className="text-xs font-bold text-slate-800 truncate" title={currentLocation?.name}>
          {currentLocation?.name || 'Pune (Haveli), Maharashtra'}
        </p>
        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-medium">
          <span>Trust Score:</span>
          <span className="font-bold text-amber-600 flex items-center gap-1">
            <Award className="w-3 h-3" /> {trustScore} Pts
          </span>
        </div>
      </div>
    </aside>
  )
}
