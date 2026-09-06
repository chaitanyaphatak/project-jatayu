import React, { useState } from 'react'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react'
import { 
  Settings, User, MapPin, Globe, Bell, ShieldCheck,
  Plus, Trash2, Sprout, Plane, Flame, Building2, LogIn, UserPlus, CheckCircle2,
  Volume2, Bot, Sparkles, MessageSquare, Lock
} from 'lucide-react'
import { useAuthGate } from '../components/AuthProtectedAction'

export default function SettingsPage({ 
  user, 
  isSignedIn, 
  userRole, 
  setUserRole, 
  cropStage, 
  setCropStage, 
  currentLocation, 
  onSelectLocation,
  language = 'en',
  setLanguage
}) {
  const [notifications, setNotifications] = useState({
    extremeStorms: true,
    sprayingWindow: true,
    aviationTurbulence: false,
    dailySummary: true
  })
  const { isSignedIn: isAuthSignedIn, executeGuarded } = useAuthGate()
  const effectiveSignedIn = isSignedIn ?? isAuthSignedIn
  
  const [savedFarms, setSavedFarms] = useState([
    { id: 1, name: 'Pune Plot A (Soybean)', lat: 18.5204, lon: 73.8567, crop: 'Soybean (Flowering)' },
    { id: 2, name: 'Nashik Vineyard (Grapes)', lat: 19.9975, lon: 73.7898, crop: 'Grapes (Pruning)' },
    { id: 3, name: 'Ludhiana Farm (Wheat/Paddy)', lat: 30.9010, lon: 75.8573, crop: 'Basmati Rice' }
  ])
  const [newFarmName, setNewFarmName] = useState('')

  // Detect Google OAuth user
  const isGoogleUser = user?.externalAccounts?.some(acc => acc.provider === 'oauth_google')

  const handleAddFarm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFarmName.trim()) return
    setSavedFarms(prev => [
      ...prev,
      {
        id: Date.now(),
        name: newFarmName,
        lat: currentLocation?.lat || 18.5204,
        lon: currentLocation?.lon || 73.8567,
        crop: cropStage
      }
    ])
    setNewFarmName('')
  }

  const handleDeleteFarm = (id: number) => {
    setSavedFarms(prev => prev.filter(f => f.id !== id))
  }

  const languageDescriptions: Record<string, { title: string; desc: string; sample: string }> = {
    en: {
      title: 'English (Indian Standard)',
      desc: 'All Vayu AI chat answers, system advisories, and audio readouts will be delivered in clear English.',
      sample: '"Current temperature is 28°C with light rain probability."'
    },
    hi: {
      title: 'हिन्दी (Hindi)',
      desc: 'वायु AI चैट उत्तर, फसल सलाह, और ऑडियो वॉइस रीडआउट पूरी तरह से शुद्ध हिन्दी में उपलब्ध होंगे।',
      sample: '"वर्तमान तापमान 28°C है और हल्की बारिश की संभावना है।"'
    },
    mr: {
      title: 'मराठी (Marathi)',
      desc: 'वायू AI शेती सल्ला, हवामान अंदाज, आणि व्हॉइस रिस्पॉन्स मराठी भाषेत मिळतील.',
      sample: '"सध्याचे तापमान 28°C असून हलक्या पावसाची शक्यता आहे."'
    },
    pa: {
      title: 'ਪੰਜਾਬੀ (Punjabi)',
      desc: 'ਮੌਸਮ ਦੇ ਅਲਰਟ ਅਤੇ ਵਾਯੂ AI ਸਲਾਹ ਪੰਜਾਬੀ ਵਿੱਚ ਮੁਹੱਈਆ ਹੋਣਗੇ।',
      sample: '"ਮੌਜੂਦਾ ਤਾਪਮਾਨ 28°C ਹੈ ਅਤੇ ਹਲਕੀ ਬਾਰਿਸ਼ ਦੀ ਸੰਭਾਵਨਾ ਹੈ।"'
    },
    gu: {
      title: 'ગુજરાતી (Gujarati)',
      desc: 'હવામાનની ચેતવણીઓ અને વાયુ AI માર્ગદર્શન ગુજરાતીમાં મળશે.',
      sample: '"હાલનું તાપમાન 28°C છે અને હળવા વરસાદની શક્યતા છે."'
    },
    bn: {
      title: 'বাংলা (Bengali)',
      desc: 'আবহাওয়ার আপডেট এবং বায়ু এআই নির্দেশিকা বাংলায় উপলব্ধ হবে।',
      sample: '"বর্তমান তাপমাত্রা 28°C এবং হালকা বৃষ্টির সম্ভাবনা রয়েছে।"'
    },
    te: {
      title: 'తెలుగు (Telugu)',
      desc: 'వాతావరణ హెచ్చరికలు మరియు వాయు AI సమాచారం తెలుగులో అందుబాటులో ఉంటుంది.',
      sample: '"ప్రస్తుత ఉష్ణోగ్రత 28°C మరియు తేలికపాటి వర్షం పడే అవకాశం ఉంది."'
    },
    ta: {
      title: 'தமிழ் (Tamil)',
      desc: 'வானிலை எச்சரிக்கைகள் மற்றும் வாயு AI பதில்கள் தமிழில் கிடைக்கும்.',
      sample: '"தற்போதைய வெப்பநிலை 28°C மற்றும் லேசான மழைக்கு வாய்ப்புள்ளது."'
    }
  }

  const activeLangInfo = languageDescriptions[language] || languageDescriptions.en

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      
      {/* Title Header */}
      <div className="pb-2 border-b border-slate-200/80">
        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-sky-600" />
          Settings & Regional Preferences
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure persona profiles, regional languages, agricultural plots, and notification triggers
        </p>
      </div>

      {/* Account & Security Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            Account & Authentication
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Clerk SSO
          </span>
        </div>

        {/* Signed In State */}
        <SignedIn>
          <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50/70 via-blue-50/40 to-slate-50 border border-sky-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative shrink-0">
                {user?.imageUrl ? (
                  <img 
                    src={user.imageUrl} 
                    alt={user.fullName || 'User Avatar'} 
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-sky-200 shadow-xs"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center font-black text-base shadow-xs">
                    {user?.firstName?.[0] || user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white flex items-center justify-center text-[9px] text-white font-bold">
                  ✓
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-extrabold text-sm text-slate-900 truncate">
                    {user?.fullName || user?.firstName || 'Authenticated User'}
                  </p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium truncate">
                  {user?.primaryEmailAddress?.emailAddress || 'Jatayu Member'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isGoogleUser ? '🔵 Signed in via Google' : '🔐 Email & Password'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </SignedIn>

        {/* Signed Out State */}
        <SignedOut>
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-sky-50/30 to-blue-50/20 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <p className="text-xs font-bold text-slate-900">
                Sign in or register an account to synchronize your weather data
              </p>
              <p className="text-[11px] text-slate-500 max-w-md">
                Save agricultural plots, sync past chat conversations with Vayu AI, and get personalized SMS alerts.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
                <button
                  id="settings-signin-btn"
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200/90 flex items-center justify-center gap-1.5 transition shadow-2xs shrink-0 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-500" />
                  Sign In
                </button>
              </SignInButton>

              <SignUpButton mode="modal" fallbackRedirectUrl="/dashboard">
                <button
                  id="settings-signup-btn"
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-600 via-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white flex items-center justify-center gap-1.5 transition shadow-xs shrink-0 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </div>
        </SignedOut>
      </div>

      {/* Language Preference & Live Explanation Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-600" />
            Regional Language Preference
          </h3>
          <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200 uppercase">
            Active: {language}
          </span>
        </div>

        {/* Language Selection Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
          {[
            { id: 'en', label: 'English (Default)' },
            { id: 'hi', label: 'हिन्दी (Hindi)' },
            { id: 'mr', label: 'मराठी (Marathi)' },
            { id: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
            { id: 'gu', label: 'ગુજરાતી (Gujarati)' },
            { id: 'bn', label: 'বাংলা (Bengali)' },
            { id: 'te', label: 'తెలుగు (Telugu)' },
            { id: 'ta', label: 'தமிழ் (Tamil)' }
          ].map((lang) => (
            <button
              key={lang.id}
              type="button"
              onClick={() => setLanguage?.(lang.id)}
              className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                language === lang.id
                  ? 'bg-sky-50 text-sky-800 border-sky-300 font-black shadow-xs ring-2 ring-sky-100'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* Interactive Explanation Box showing exactly what this language affects */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-sky-50/50 border border-sky-200/80 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span>How your selected language ({activeLangInfo.title}) is used:</span>
          </div>
          
          <ul className="space-y-1.5 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <Bot className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
              <span><strong>VAYU AI Chat Responses:</strong> AI automatically generates solutions and crop guidance in this language.</span>
            </li>
            <li className="flex items-start gap-2">
              <Volume2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Voice Dictation & Text-to-Speech:</strong> Speech recognition and Read Aloud speak in the selected native dialect.</span>
            </li>
          </ul>

          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-xs font-medium text-slate-700 italic">
            Example output: {activeLangInfo.sample}
          </div>
        </div>
      </div>

      {/* Profile & Persona Management Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <User className="w-4 h-4 text-sky-600" />
          User Profile & Primary Persona
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Active Role</label>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              {[
                { id: 'farmer', label: 'Farmer / Agro', icon: Sprout, color: 'text-emerald-700' },
                { id: 'pilot', label: 'Aviation Pilot', icon: Plane, color: 'text-sky-700' },
                { id: 'disaster_manager', label: 'Disaster Mgr', icon: Flame, color: 'text-rose-700' },
                { id: 'citizen', label: 'Citizen', icon: Building2, color: 'text-slate-700' }
              ].map((role) => {
                const Icon = role.icon
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setUserRole(role.id)}
                    className={`p-3 rounded-2xl border flex items-center gap-2 transition cursor-pointer ${
                      userRole === role.id
                        ? 'bg-sky-50 border-sky-300 font-black shadow-xs ring-2 ring-sky-100'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${role.color}`} />
                    <span>{role.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Crop Stage / Context</label>
            <input
              type="text"
              value={cropStage}
              onChange={(e) => setCropStage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 font-semibold focus:outline-none focus:border-sky-400 focus:bg-white"
              placeholder="e.g. Flowering & Pod Formation (Soybean)"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Jatayu adjusts chemical spray windows and fungal alerts based on this specific crop cycle.
            </p>
          </div>
        </div>
      </div>

      {/* Saved Farms & Plots (Auth-gated cloud sync) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-sky-600" />
          Saved Plots, Farms &amp; Airway Corridors
          {!effectiveSignedIn && (
            <span className="ml-auto text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" /> Sign in to cloud-sync
            </span>
          )}
        </h3>

        {effectiveSignedIn ? (
          <form onSubmit={handleAddFarm} className="flex gap-2">
            <input
              type="text"
              value={newFarmName}
              onChange={(e) => setNewFarmName(e.target.value)}
              placeholder="Save current location as new plot (e.g. Satara Vineyard Block B)..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Save Plot
            </button>
          </form>
        ) : (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-50 border border-sky-200/80 flex items-center gap-3">
            <Lock className="w-5 h-5 text-sky-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-sky-900">Cloud-sync your agricultural plots</p>
              <p className="text-[11px] text-sky-700 mt-0.5">Sign in to save farm plots, sync across devices, and receive crop-stage-specific alerts.</p>
            </div>
            <button
              type="button"
              onClick={() => executeGuarded(() => {}, 'Sign in to save farm plots and sync across devices')}
              className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition shrink-0 cursor-pointer"
            >
              Sign In
            </button>
          </div>
        )}

        <div className="space-y-2 pt-2">
          {savedFarms.map((farm) => (
            <div key={farm.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-sky-600" />
                <div>
                  <p className="font-bold text-slate-900">{farm.name}</p>
                  <p className="text-[11px] text-slate-500">Crop: {farm.crop}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectLocation({ name: farm.name, lat: farm.lat, lon: farm.lon, crop: farm.crop })}
                  className="px-3 py-1 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-[11px] border border-sky-200 cursor-pointer"
                >
                  Switch Location
                </button>
                {effectiveSignedIn && (
                  <button
                    type="button"
                    onClick={() => handleDeleteFarm(farm.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition rounded-lg hover:bg-slate-200 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
