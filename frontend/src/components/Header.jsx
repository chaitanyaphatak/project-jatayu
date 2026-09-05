import React from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import { 
  AlertTriangle, Sprout, Plane, Flame, Building2, 
  PlusCircle, LogIn, Award, Menu
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
  return (
    <header className="border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
      {/* Top Proactive Alert Ticker */}
      <aside aria-label="Proactive alert ticker" className="bg-amber-50/95 border-b border-amber-200/80 px-4 py-1.5 text-xs text-amber-950 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0"></span>
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="font-bold text-amber-900 uppercase tracking-wider text-[10px] bg-amber-200/80 px-2 py-0.5 rounded-full border border-amber-300">
            {currentLocation?.name?.split(',')[0] || 'INDIA'} ALERT
          </span>
          <span className="font-semibold text-amber-950 truncate">
            {systemAlert?.title}: <span className="text-amber-800 font-normal">{systemAlert?.detail}</span>
          </span>
        </div>
        <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full bg-white text-amber-800 border border-amber-200 text-[10px] font-mono font-bold shrink-0">
          {systemAlert?.zScore}
        </span>
      </aside>

      {/* Main Header Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap lg:flex-nowrap">
        
        {/* Mobile Menu Button + Location on Mobile */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={onToggleMobileMenu}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-slate-800 text-xs truncate max-w-[140px]">
            {currentLocation?.name?.split(',')[0]}
          </span>
        </div>

        {/* Pan-India Search Bar (Full India Village & City Resolver) */}
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
              className={`px-2.5 py-1 rounded-xl flex items-center gap-1 transition ${
                userRole === 'farmer' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sprout className="w-3.5 h-3.5" /> Farmer
            </button>
            <button
              onClick={() => setUserRole('pilot')}
              className={`px-2.5 py-1 rounded-xl flex items-center gap-1 transition ${
                userRole === 'pilot' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plane className="w-3.5 h-3.5" /> Pilot
            </button>
            <button
              onClick={() => setUserRole('disaster_manager')}
              className={`px-2.5 py-1 rounded-xl flex items-center gap-1 transition ${
                userRole === 'disaster_manager' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5" /> Disaster
            </button>
            <button
              onClick={() => setUserRole('citizen')}
              className={`px-2.5 py-1 rounded-xl flex items-center gap-1 transition ${
                userRole === 'citizen' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> Citizen
            </button>
          </div>

          {/* Submit Ground Report Action */}
          <button
            onClick={onOpenReportModal}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1.5 transition shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Report Ground Truth</span>
          </button>

          {/* Clerk Auth Integration */}
          <SignedIn>
            <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-slate-200 shadow-xs">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-1 shadow-xs transition">
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </button>
            </SignInButton>
          </SignedOut>

        </div>

      </div>
    </header>
  )
}
