import React from 'react'
import { NavLink, useLocation, Link } from 'react-router-dom'
import { 
  BarChart3, Calendar, AlertTriangle, Layers, Sparkles, 
  Sprout, Users, TrendingUp, Settings, CloudRain, 
  Award, PanelLeftClose, PanelLeftOpen, MapPin, Radio,
  ShieldCheck, Activity, Wind
} from 'lucide-react'

export default function Sidebar({ 
  currentLocation, 
  trustScore, 
  userRole, 
  isCollapsed = false, 
  onToggleCollapse 
}) {
  const location = useLocation()

  const navItems = [
    { to: '/overview', label: 'Dashboard', icon: BarChart3, badge: 'Live' },
    { to: '/forecast', label: '7-Day Forecast', icon: Calendar },
    { to: '/alerts', label: 'Weather Alerts', icon: AlertTriangle, badge: 'Active', badgeColor: 'bg-amber-100 text-amber-800' },
    { to: '/maps', label: 'Interactive Maps & Radar', icon: Layers },
    { to: '/chat', label: 'Vayu AI Assistant', icon: Sparkles, badge: 'AI', badgeColor: 'bg-sky-100 text-sky-700' },
    { to: '/advisory', label: 'Farmer & Aviation Guide', icon: Sprout },
    { to: '/community', label: 'Community Reports', icon: Users },
    { to: '/climate', label: 'Climate & History', icon: TrendingUp },
    { to: '/settings', label: 'Settings', icon: Settings }
  ]

  const handleLogoClick = () => {
    if (location.pathname === '/overview' || location.pathname === '/') {
      window.location.reload()
    }
  }

  return (
    <aside 
      className={`bg-white border-r border-slate-200/90 h-screen sticky top-0 flex flex-col justify-between shrink-0 hidden lg:flex select-none z-30 shadow-xs transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header & Toggle */}
      <div className="border-b border-slate-100 shrink-0 bg-white">
        <div className={`p-4 flex items-center ${isCollapsed ? 'flex-col gap-3 justify-center' : 'justify-between gap-3'}`}>
          <Link 
            to="/overview"
            onClick={handleLogoClick}
            title="Click to go to Overview / Refresh"
            className="flex items-center gap-3 min-w-0 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-sky-600 to-blue-600 flex items-center justify-center shadow-md shadow-sky-500/20 ring-2 ring-sky-100 shrink-0 group-hover:scale-105 transition-transform">
              <CloudRain className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 truncate group-hover:text-sky-600 transition-colors">
                    WeatherGPT
                  </span>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 shrink-0">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium truncate">Pan-India Smart Weather</p>
              </div>
            )}
          </Link>

          {/* Collapse / Expand Toggle Button */}
          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0 cursor-pointer"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-5 h-5 text-sky-600" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation Section Links */}
      <nav className={`flex-1 overflow-y-auto overflow-x-hidden space-y-1.5 py-2.5 bg-white ${isCollapsed ? 'px-2.5' : 'px-3'}`}>
        {!isCollapsed && (
          <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Navigation
          </p>
        )}
        
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.to || (item.to === '/overview' && location.pathname === '/')

          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={isCollapsed ? item.label : undefined}
              className={`group relative flex items-center rounded-2xl text-xs font-bold transition-all ${
                isCollapsed 
                  ? 'justify-center p-3' 
                  : 'justify-between px-3 py-2.5'
              } ${
                isActive
                  ? 'bg-sky-50 text-sky-800 shadow-xs border border-sky-200/70 font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold'
              }`}
            >
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5 min-w-0'}`}>
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-700'}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!isCollapsed && item.badge && (
                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shrink-0 ${item.badgeColor || 'bg-emerald-100 text-emerald-800'}`}>
                  {item.badge}
                </span>
              )}

              {/* Floating tooltip for collapsed view */}
              {isCollapsed && (
                <div className="absolute left-full ml-3.5 px-3 py-1.5 bg-slate-900/95 text-white text-xs font-semibold rounded-xl shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150 z-50 flex items-center gap-2">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-sky-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          )
        })}

        {/* Rich Live Telemetry & Agro-Radar Widget (Fills space under navigation) */}
        {!isCollapsed && (
          <div className="pt-3 px-1 space-y-2">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-sky-50/80 via-blue-50/40 to-indigo-50/30 border border-sky-100/90 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-sky-800 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-sky-600 animate-pulse" /> Live Doppler Stream
                </span>
                <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                  96% Synced
                </span>
              </div>
              <div className="space-y-1 text-[11px] text-slate-600 font-medium">
                <p className="flex items-center justify-between">
                  <span>Radar Echo:</span>
                  <strong className="text-slate-800">25 km Active</strong>
                </p>
                <p className="flex items-center justify-between">
                  <span>Agro Window:</span>
                  <strong className="text-emerald-700">Favorable</strong>
                </p>
              </div>
              <Link
                to="/chat"
                className="w-full py-1.5 px-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold text-center block transition shadow-2xs"
              >
                Ask Vayu AI ✨
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Sidebar Location & Trust Score Footer */}
      <div className="p-3 shrink-0 border-t border-slate-100 bg-white">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-gradient-to-br from-slate-50 to-sky-50/50 border border-slate-200/80 group relative">
            <MapPin className="w-4 h-4 text-sky-600" />
            <span className="text-[10px] font-black text-amber-600 flex items-center gap-0.5">
              <Award className="w-3 h-3" /> {trustScore}
            </span>
            {/* Tooltip */}
            <div className="absolute left-full ml-3.5 px-3 py-2 bg-slate-900/95 text-white text-xs rounded-xl shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50">
              <p className="font-bold">{currentLocation?.name?.split(',')[0] || 'Current City'}</p>
              <p className="text-[10px] text-slate-300">Community Score: {trustScore} pts</p>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-sky-50/50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400">Current City</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-xs font-bold text-slate-800 truncate" title={currentLocation?.name}>
              {currentLocation?.name || 'Pune, Maharashtra'}
            </p>
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-medium">
              <span>Community Score:</span>
              <span className="font-bold text-amber-600 flex items-center gap-1">
                <Award className="w-3 h-3" /> {trustScore} Pts
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
