import React, { useState, useEffect } from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import { 
  Settings, User, MapPin, Globe, Bell, Shield, 
  Check, Plus, Trash2, Sprout, Plane, Flame, Building2
} from 'lucide-react'

export default function SettingsPage({ 
  user, 
  isSignedIn, 
  userRole, 
  setUserRole, 
  cropStage, 
  setCropStage, 
  currentLocation,
  onSelectLocation 
}) {
  const [language, setLanguage] = useState('en')
  const [notifications, setNotifications] = useState({
    extremeStorms: true,
    sprayingWindow: true,
    aviationTurbulence: false,
    dailySummary: true
  })
  const [savedFarms, setSavedFarms] = useState([
    { id: 1, name: 'Pune Plot A (Soybean)', lat: 18.5204, lon: 73.8567, crop: 'Soybean (Flowering)' },
    { id: 2, name: 'Nashik Vineyard (Grapes)', lat: 19.9975, lon: 73.7898, crop: 'Grapes (Pruning)' },
    { id: 3, name: 'Ludhiana Farm (Wheat/Paddy)', lat: 30.9010, lon: 75.8573, crop: 'Basmati Rice' }
  ])
  const [newFarmName, setNewFarmName] = useState('')

  const handleAddFarm = (e) => {
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

  const handleDeleteFarm = (id) => {
    setSavedFarms(prev => prev.filter(f => f.id !== id))
  }

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      
      {/* Title Header */}
      <div className="pb-2 border-b border-slate-200/80">
        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-sky-600" />
          Settings & User Preferences
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure persona profiles, saved agricultural plots, languages, and alert thresholds
        </p>
      </div>

      {/* Profile & Persona Management Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
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
                    className={`p-3 rounded-2xl border flex items-center gap-2 transition ${
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
              WeatherGPT adjusts chemical spray windows and fungal alerts based on this specific crop cycle.
            </p>
          </div>
        </div>
      </div>

      {/* Language & Regional Settings */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Globe className="w-4 h-4 text-sky-600" />
          Language Preference
        </h3>

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
              onClick={() => setLanguage(lang.id)}
              className={`p-3 rounded-2xl border text-center transition ${
                language === lang.id
                  ? 'bg-sky-50 text-sky-800 border-sky-300 font-black shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Saved Farms & Locations Manager */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-sky-600" />
          Saved Plots, Farms & Airway Corridors
        </h3>

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
            className="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition shrink-0"
          >
            <Plus className="w-4 h-4" /> Save Plot
          </button>
        </form>

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
                  onClick={() => onSelectLocation({ name: farm.name, lat: farm.lat, lon: farm.lon, crop: farm.crop })}
                  className="px-3 py-1 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-[11px] border border-sky-200"
                >
                  Switch Location
                </button>
                <button
                  onClick={() => handleDeleteFarm(farm.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition rounded-lg hover:bg-slate-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
