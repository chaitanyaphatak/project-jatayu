import React, { useEffect } from 'react'
import { NavLink, useLocation, Link } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, SignUpButton, useUser, useClerk } from '@clerk/clerk-react'
import { 
  BarChart3, Calendar, AlertTriangle, Layers, 
  Sparkles, Sprout, Users, TrendingUp, Settings, X, CloudRain, Award,
  MapPin, ShieldCheck, CheckCircle2, LogIn, UserPlus, LogOut, User
} from 'lucide-react'

export default function MobileNav({ isOpen, onClose, currentLocation, trustScore }) {
  const location = useLocation()
  const { user } = useUser()
  const { signOut, openUserProfile } = useClerk()

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: BarChart3, badge: 'Live' },
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
            to="/dashboard"
            onClick={() => {
              onClose()
              if (location.pathname === '/dashboard' || location.pathname === '/overview' || location.pathname === '/') {
                window.location.reload()
              }
            }}
            className="flex items-center gap-2"
          >
            <img 
              src="/jatayu_emblem.png" 
              alt="Jatayu Logo" 
              className="h-8 w-8 object-contain drop-shadow-xs shrink-0" 
            />
            <img 
              src="/jatayu_logo.png" 
              alt="Jatayu" 
              className="h-6 w-auto max-w-[120px] object-contain drop-shadow-xs" 
            />
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
              const isActive = location.pathname === item.to || 
                ((item.to === '/dashboard' || item.to === '/overview') && (location.pathname === '/' || location.pathname === '/overview' || location.pathname === '/dashboard'))

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

        {/* Rich Drawer Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/80 shrink-0 space-y-2.5">
          
          {/* Auth Section in Drawer */}
          <SignedOut>
            <div className="grid grid-cols-2 gap-2">
              <SignInButton mode="modal" fallbackRedirectUrl="/overview">
                <button
                  onClick={onClose}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-500" />
                  Sign In
                </button>
              </SignInButton>

              <SignUpButton mode="modal" fallbackRedirectUrl="/overview">
                <button
                  onClick={onClose}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="p-2 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between gap-2 shadow-2xs">
              <div 
                onClick={() => { onClose(); openUserProfile(); }}
                className="flex items-center gap-2 min-w-0 cursor-pointer flex-1"
              >
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="User" className="w-7 h-7 rounded-full object-cover ring-1 ring-sky-200 shrink-0" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {(user?.firstName || 'U').charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {user?.fullName || user?.firstName || 'Logged in User'}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-bold">Active Account</p>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose()
                  signOut(() => { window.location.href = '/' })
                }}
                title="Sign Out"
                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </SignedIn>

          {/* Current Location Badge */}
          <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
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
            <span>© 2026 Jatayu Weather Intelligence</span>
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
