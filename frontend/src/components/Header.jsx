import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, useUser, useClerk } from '@clerk/clerk-react'
import { 
  AlertTriangle, Sprout, Plane, Flame, Building2, 
  PlusCircle, LogIn, Menu, CloudRain, CheckCircle2, 
  ChevronDown, User, LogOut, Settings, BellRing
} from 'lucide-react'
import IndiaSearchBar from './IndiaSearchBar'

export default function Header({ 
  currentLocation, 
  onSelectLocation, 
  onDetectLocation, 
  systemAlert,
  userRole,
  setUserRole,
  onOpenReportModal,
  trustScore,
  onToggleMobileMenu
}) {
  const { user } = useUser()
  const { openUserProfile, signOut } = useClerk()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = () => {
    setIsUserMenuOpen(false)
    signOut(() => {
      window.location.href = '/'
    })
  }

  const handleOpenProfile = () => {
    setIsUserMenuOpen(false)
    openUserProfile()
  }

  // Format alert text nicely without raw machine codes
  const formattedAlertDetail = systemAlert?.detail 
    ? systemAlert.detail.replace(/\(Z-Score:[^)]+\)/gi, '').trim()
    : 'Clear skies and favorable conditions throughout the day.'

  const formattedAlertTitle = systemAlert?.title 
    ? systemAlert.title.replace(/Hyperlocal Meteorological Advisory/i, 'Weather Advisory')
    : 'Local Weather Update'

  return (
    <header className="border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
      
      {/* 1. Main Header Bar: Logo, Search, Persona Switcher & Auth */}
      <div className="px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap lg:flex-nowrap">
        
        {/* Left Side: Mobile Menu Button + Clickable Brand Logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={onToggleMobileMenu}
            aria-label="Open mobile menu"
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link 
            to="/overview" 
            onClick={() => {
              if (window.location.pathname === '/' || window.location.pathname === '/overview') {
                window.location.reload()
              }
            }}
            className="flex items-center gap-1.5 font-black text-slate-900 text-sm"
          >
            <CloudRain className="w-5 h-5 text-sky-600" />
            <span>WeatherGPT</span>
          </Link>
        </div>

        {/* Pan-India Search Bar */}
        <div className="flex-1 max-w-xl">
          <IndiaSearchBar 
            currentLocation={currentLocation}
            onSelectLocation={onSelectLocation}
            onDetectLocation={onDetectLocation}
          />
        </div>

        {/* Role Persona Switcher & Auth Actions */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          
          {/* Persona Segmented Control */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setUserRole('farmer')}
              className={`px-2.5 py-1 rounded-xl flex items-center gap-1 transition cursor-pointer ${
                userRole === 'farmer' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sprout className="w-3.5 h-3.5" /> Farmer
            </button>
            <button
              onClick={() => setUserRole('pilot')}
              className={`px-2.5 py-1 rounded-xl flex items-center gap-1 transition cursor-pointer ${
                userRole === 'pilot' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plane className="w-3.5 h-3.5" /> Pilot
            </button>
            <button
              onClick={() => setUserRole('disaster_manager')}
              className={`px-2.5 py-1 rounded-xl flex items-center gap-1 transition cursor-pointer ${
                userRole === 'disaster_manager' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5" /> Disaster
            </button>
            <button
              onClick={() => setUserRole('citizen')}
              className={`px-2.5 py-1 rounded-xl flex items-center gap-1 transition cursor-pointer ${
                userRole === 'citizen' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> Citizen
            </button>
          </div>

          {/* Submit Ground Report Action */}
          <button
            onClick={onOpenReportModal}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Report Weather</span>
          </button>

          {/* Clerk Auth: Full clickable user pill with compact popup menu */}
          <SignedIn>
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(prev => !prev)}
                className="flex items-center gap-2.5 bg-white pl-2 pr-3 py-1.5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-sky-300 hover:bg-sky-50/40 transition cursor-pointer select-none"
                title="Account Menu"
              >
                {/* User Avatar Image */}
                {user?.imageUrl ? (
                  <img 
                    src={user.imageUrl} 
                    alt={user.fullName || 'User'} 
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-sky-100 shrink-0" 
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 ring-2 ring-sky-100">
                    {(user?.firstName || user?.fullName || 'U').charAt(0).toUpperCase()}
                  </div>
                )}

                {/* User Name & Active Badge */}
                <div className="hidden sm:block text-left text-xs leading-tight">
                  <p className="font-bold text-slate-800 truncate max-w-[120px]">
                    {user?.firstName || user?.fullName?.split(' ')[0] || 'User'}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] text-emerald-600 font-bold capitalize">
                      Active
                    </span>
                  </div>
                </div>

                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Compact Custom Dropdown Popover */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  
                  {/* User Header in Dropdown */}
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                    {user?.imageUrl ? (
                      <img 
                        src={user.imageUrl} 
                        alt={user.fullName || 'User'} 
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-sky-100 shrink-0" 
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {(user?.firstName || user?.fullName || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 text-xs truncate">
                        {user?.fullName || user?.firstName || 'Logged in User'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {user?.primaryEmailAddress?.emailAddress || 'WeatherGPT Member'}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-1.5 space-y-0.5">
                    <button
                      onClick={handleOpenProfile}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-2.5 transition cursor-pointer"
                    >
                      <User className="w-4 h-4 text-sky-600" />
                      <span>Manage Account & Profile</span>
                    </button>

                    <Link
                      to="/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-2.5 transition"
                    >
                      <Settings className="w-4 h-4 text-slate-500" />
                      <span>Weather Preferences</span>
                    </Link>

                    <div className="pt-1 my-1 border-t border-slate-100"></div>

                    <button
                      onClick={handleSignOut}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>Sign Out</span>
                    </button>
                  </div>

                </div>
              )}
            </div>
          </SignedIn>

          <SignedOut>
            {/* Single Clerk Sign In */}
            <SignInButton mode="modal" afterSignInUrl="/overview" afterSignUpUrl="/overview">
              <button
                id="header-signin-btn"
                className="px-3 py-1.5 h-8 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            </SignInButton>
          </SignedOut>

        </div>

      </div>

      {/* 2. Improved Proactive Alert Bar (Clean typography, fully readable without truncation cut-off) */}
      <aside aria-label="Weather advisory banner" className="bg-gradient-to-r from-amber-50/95 via-amber-100/40 to-orange-50/95 border-t border-amber-200/80 px-4 py-2 text-xs text-amber-950 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0"></span>
          <span className="font-extrabold text-amber-900 uppercase tracking-wide text-[10px] bg-amber-200/90 px-2 py-0.5 rounded-full border border-amber-300/80 shrink-0">
            {currentLocation?.name?.split(',')[0] || 'INDIA'} ADVISORY
          </span>
          <p className="text-xs text-slate-800 font-medium leading-normal">
            <strong className="text-slate-900">{formattedAlertTitle}:</strong> {formattedAlertDetail}
          </p>
        </div>
        <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/90 text-emerald-800 border border-emerald-200 text-[10px] font-bold shrink-0 shadow-2xs">
          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Live Update
        </span>
      </aside>

    </header>
  )
}
