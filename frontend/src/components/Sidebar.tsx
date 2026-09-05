import React from 'react'
import { NavLink, useLocation, Link } from 'react-router-dom'
import { 
  BarChart3, Calendar, AlertTriangle, Layers, Sparkles, 
  Sprout, Users, TrendingUp, Settings, CloudRain, 
  Award, PanelLeftClose, PanelLeftOpen, MapPin, Radio,
  ShieldCheck, Activity
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
      className={`bg-white border-r border-slate-200/90 h-screen max-h-screen sticky top-0 flex flex-col justify-between shrink-0 hidden lg:flex select-none z-30 shadow-xs transition-all duration-300 ease-in-out overflow-hidden ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header & Toggle */}
      <div className="border-b border-slate-100 shrink-0 bg-white">
        <div className={`p-3.5 flex items-center ${isCollapsed ? 'flex-col gap-3 justify-center' : 'justify-between gap-3'}`}>
          <Link 
            to="/overview"
            onClick={handleLogoClick}
            title="Click to go to Overview / Refresh"
            className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-500 via-sky-600 to-blue-600 flex items-center justify-center shadow-md shadow-sky-500/20 ring-2 ring-sky-100 shrink-0 group-hover:scale-105 transition-transform">
              <CloudRain className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 truncate group-hover:text-sky-600 transition-colors">
                    WeatherGPT
                  </span>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 border border-sky-200 shrink-0">
                    PRO
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium truncate">Pan-India Smart Weather</p>
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

      {/* Navigation Section Links: Smooth scroll without hiding elements */}
      <nav className={`flex-1 overflow-y-auto space-y-1 py-2 bg-white ${isCollapsed ? 'px-2' : 'px-2.5'}`}>
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
                  ? 'justify-center p-2.5' 
                  : 'justify-between px-3 py-2'
              } ${
                isActive
                  ? 'bg-sky-50 text-sky-800 shadow-2xs border border-sky-200/70 font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold'
              }`}
            >
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5 min-w-0'}`}>
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-700'}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!isCollapsed && item.badge && (
                <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full shrink-0 ${item.badgeColor || 'bg-emerald-100 text-emerald-800'}`}>
                  {item.badge}
                </span>
              )}

              {/* Floating tooltip for collapsed view */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900/95 text-white text-xs font-semibold rounded-xl shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150 z-50 flex items-center gap-2">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-sky-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Compact Sidebar Location & Trust Footer: Doesn't hide navigation */}
      <div className="p-2.5 shrink-0 border-t border-slate-100 bg-white">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-50 border border-slate-200/80 group relative">
            <MapPin className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-[9px] font-black text-amber-600 flex items-center gap-0.5">
              <Award className="w-3 h-3" /> {trustScore}
            </span>
            <div className="absolute left-full ml-3 px-3 py-2 bg-slate-900/95 text-white text-xs rounded-xl shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50">
              <p className="font-bold">{currentLocation?.name?.split(',')[0] || 'Current City'}</p>
              <p className="text-[10px] text-slate-300">Trust: {trustScore} pts</p>
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <p className="text-xs font-bold text-slate-800 truncate" title={currentLocation?.name}>
                  {currentLocation?.name?.split(',')[0] || 'Pune'}
                </p>
              </div>
              <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5 shrink-0">
                <Award className="w-3 h-3" /> {trustScore}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              {currentLocation?.state || 'Maharashtra'} • {currentLocation?.region || 'West'} India
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}
