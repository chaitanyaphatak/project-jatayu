import React, { useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useUser, useAuth, useClerk } from '@clerk/clerk-react'
import { useIdleTimeout } from './hooks/useIdleTimeout'
import SessionTimeoutModal from './components/SessionTimeoutModal'

// Layout Components
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import MobileNav from './components/MobileNav'
import ReportModal from './components/ReportModal'

// Page Views
import OverviewPage from './pages/OverviewPage'
import ForecastPage from './pages/ForecastPage'
import AlertsPage from './pages/AlertsPage'
import MapsPage from './pages/MapsPage'
import ChatPage from './pages/ChatPage'
import AdvisoryPage from './pages/AdvisoryPage'
import CommunityPage from './pages/CommunityPage'
import ClimatePage from './pages/ClimatePage'
import SettingsPage from './pages/SettingsPage'

import { LocationItem, WeatherData, SystemAlert, CrowdReport, UserRole } from './types'
import { getCachedWeather, setCachedWeather } from './utils/weatherCache'

export default function App() {
  const { isSignedIn, user } = useUser()
  const { getToken } = useAuth()
  const { signOut } = useClerk()

  // ─── Security: Auto-logout after 20 min of inactivity ──────────────────────
  const handleIdleTimeout = useCallback(async () => {
    await signOut()
  }, [signOut])

  const { showWarning, secondsLeft, resetTimer } = useIdleTimeout({
    onTimeout: handleIdleTimeout,
    enabled: !!isSignedIn,
  })

  // ─── localStorage helpers ───────────────────────────────────────────────────
  const lsKey = (key: string) => `wgpt_${user?.id || 'guest'}_${key}`

  const lsRead = <T,>(key: string, fallback: T): T => {
    try {
      const raw = localStorage.getItem(lsKey(key))
      return raw ? JSON.parse(raw) : fallback
    } catch { return fallback }
  }

  const lsWrite = (key: string, value: any) => {
    try { localStorage.setItem(lsKey(key), JSON.stringify(value)) } catch {}
  }

  // Default fallback location
  const DEFAULT_LOCATION: LocationItem = {
    name: 'Pune (Haveli), Maharashtra',
    state: 'Maharashtra',
    region: 'West',
    lat: 18.5204,
    lon: 73.8567,
    type: 'Agri-Metro Hub',
    crop: 'Soybean & Sugarcane',
    risk: 'Convective Updraft & Showers'
  }

  // Active Pan-India Location State
  const [currentLocation, setCurrentLocation] = useState<LocationItem>(() =>
    lsRead('location', DEFAULT_LOCATION)
  )

  // User Profile & Role State
  const [userRole, setUserRole] = useState<UserRole>(() => lsRead('role', 'farmer'))
  const [cropStage, setCropStage] = useState<string>(() => lsRead('cropStage', 'Flowering & Pod Formation (Soybean)'))
  const [trustScore, setTrustScore] = useState<number>(() => lsRead('trustScore', 120))
  const [language, setLanguage] = useState<string>(() => lsRead('language', 'en'))

  const handleSetLanguage = (newLang: string) => {
    setLanguage(newLang)
    lsWrite('language', newLang)
  }

  // Modals & Mobile Drawer State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Desktop Collapsible Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('jatayu_sidebar_collapsed') === 'true'
    } catch {
      return false
    }
  })

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev
      try {
        localStorage.setItem('jatayu_sidebar_collapsed', String(next))
      } catch {}
      return next
    })
  }

  // Keyboard shortcut Ctrl+B / Cmd+B to toggle sidebar navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Crowd Reports & Leaderboard State
  const [crowdReports, setCrowdReports] = useState<CrowdReport[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [nowcastCorrection, setNowcastCorrection] = useState<any>(null)

  // Live Weather Telemetry State
  const [weather, setWeather] = useState<WeatherData>({
    temp: 26.5,
    feelsLike: 27.0,
    condition: 'Partly cloudy with stratocumulus',
    humidity: 78,
    windSpeed: 12.4,
    surfacePressure: 1008.5,
    rainProb: 40,
    aqi: 45,
    sourcesUsed: ['Open-Meteo (ECMWF/GFS)', 'OpenWeatherMap', 'WeatherAPI.com'],
    sourceReadings: [
      { name: 'Open-Meteo (ECMWF/GFS)', short_name: 'Open-Meteo', temp: 26.3, weight_percent: 50, raw_weight: 0.35, status: 'active', model_desc: 'ECMWF & GFS NWP Physics' },
      { name: 'OpenWeatherMap', short_name: 'OpenWeather', temp: 28.5, weight_percent: 29, raw_weight: 0.20, status: 'active', model_desc: 'Global Observation & Radar Grid' },
      { name: 'WeatherAPI.com', short_name: 'WeatherAPI', temp: 24.1, weight_percent: 21, raw_weight: 0.15, status: 'active', model_desc: 'Micro-climate Observation Network' }
    ],
    confidenceLevel: 'moderate',
    confidenceLabel: 'Moderate confidence',
    confidenceDesc: 'Sources vary by 4.4°C across NWP & micro-climate models',
    confidenceSpread: 4.4,
    modelAgreement: 88,
    modelRating: 'Moderate Variance (4.4°C)',
    contributingFactors: [],
    activityImpact: null
  })

  // Weather Loading State for Instant Optimistic UI Feedback
  const [isWeatherLoading, setIsWeatherLoading] = useState(false)

  // Proactive Alert Ticker State
  const [systemAlert, setSystemAlert] = useState<SystemAlert>({
    title: 'Hyperlocal Meteorological Advisory',
    detail: 'Optimal window for agrochemical spraying before afternoon convective cycle.',
    zScore: 'Isolation Forest: +1.0σ Anomaly'
  })

  // 1. Fetch live telemetry from backend Tri-Source engine with caching
  const fetchLiveWeather = async (
    lat = currentLocation.lat, 
    lon = currentLocation.lon, 
    name = currentLocation.name,
    silent = false
  ) => {
    if (!silent) setIsWeatherLoading(true)
    try {
      const res = await fetch(`/api/v1/weather/current?lat=${lat}&lon=${lon}&location_name=${encodeURIComponent(name)}`)
      if (res.ok) {
        const data = await res.json()
        const newWeather: WeatherData = {
          temp: data.temperature,
          feelsLike: data.feels_like,
          condition: data.condition,
          humidity: data.humidity,
          windSpeed: data.wind_speed,
          surfacePressure: data.surface_pressure || 1008.0,
          rainProb: data.precipitation_prob,
          weatherCode: data.weather_code,
          isDay: data.is_day !== undefined ? data.is_day : true,
          conditionCode: data.condition_code,
          aqi: data.air_quality_index || 48,
          visibility: data.visibility_km ?? 10.0,
          uvIndex: data.uv_index ?? 5.2,
          sourcesUsed: data.sources_used || ['Open-Meteo', 'WeatherAPI.com', 'OpenWeatherMap'],
          sourceReadings: data.source_readings || [],
          confidenceLevel: data.confidence_level || 'moderate',
          confidenceLabel: data.confidence_label || 'Moderate confidence',
          confidenceDesc: data.confidence_desc || 'Multi-source blended observation',
          confidenceSpread: data.confidence_spread !== undefined ? data.confidence_spread : 2.5,
          modelAgreement: data.model_agreement_score || 92,
          modelRating: data.model_agreement_rating || 'High Consensus',
          contributingFactors: data.contributing_factors || [],
          activityImpact: data.activity_impact
        }
        setWeather(newWeather)
        setCachedWeather(lat, lon, newWeather)
      }
    } catch (err) {
      console.warn('Weather fetch fallback:', err)
    } finally {
      setIsWeatherLoading(false)
    }
  }

  // 2. Fetch proactive alerts
  const fetchLiveAlerts = async (lat = currentLocation.lat, lon = currentLocation.lon) => {
    try {
      const res = await fetch(`/api/v1/alerts?lat=${lat}&lon=${lon}&role=${userRole}&crop_stage=${encodeURIComponent(cropStage)}`)
      if (res.ok) {
        const data = await res.json()
        if (data && data.length > 0) {
          const a = data[0]
          setSystemAlert({
            title: a.title,
            detail: `${a.description} — Action: ${a.recommended_action}`,
            zScore: `Isolation Forest: +${a.z_score}σ Anomaly`
          })
        }
      }
    } catch (e) {
      console.warn('Alerts fetch deferred:', e)
    }
  }

  // 3. Fetch crowd reports & leaderboard
  const fetchCrowdData = async (lat = currentLocation.lat, lon = currentLocation.lon) => {
    try {
      const [r1, r2, r3] = await Promise.all([
        fetch('/api/v1/crowd/reports'),
        fetch('/api/v1/crowd/leaderboard'),
        fetch(`/api/v1/crowd/nowcast-correction?lat=${lat}&lon=${lon}`)
      ])
      if (r1.ok) setCrowdReports(await r1.json())
      if (r2.ok) setLeaderboard(await r2.json())
      if (r3.ok) setNowcastCorrection(await r3.json())
    } catch (e) {
      console.warn('Crowd fetch deferred:', e)
    }
  }

  // Handle location selection with immediate live update
  const handleSelectLocation = (loc: LocationItem) => {
    setCurrentLocation(loc)
    lsWrite('location', loc)

    // Instant local cache swap if available
    const cached = getCachedWeather(loc.lat, loc.lon)
    if (cached.data) {
      setWeather(cached.data)
    }

    // Trigger instant fresh fetch for the new location
    fetchLiveWeather(loc.lat, loc.lon, loc.name, !!cached.data)
    fetchLiveAlerts(loc.lat, loc.lon)
    fetchCrowdData(loc.lat, loc.lon)
  }

  // Persist role changes
  const handleSetUserRole = (role: UserRole) => {
    setUserRole(role)
    lsWrite('role', role)
  }

  // Persist cropStage changes
  const handleSetCropStage = (stage: string) => {
    setCropStage(stage)
    lsWrite('cropStage', stage)
  }

  // Persist trustScore changes
  const handleAddTrustScore = (delta: number) => {
    setTrustScore(prev => {
      const next = prev + delta
      lsWrite('trustScore', next)
      return next
    })
  }

  // Handle GPS location detection with smart reverse geocoding
  const handleDetectGPSLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(4))
          const lon = parseFloat(pos.coords.longitude.toFixed(4))
          let placeName = `Live Station (${lat}, ${lon})`
          let stateName = 'India'

          try {
            const res = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`)
            if (res.ok) {
              const data = await res.json()
              const props = data.features?.[0]?.properties || {}
              const place = props.name || props.city || props.district || ''
              const state = props.state || ''
              const district = props.county || props.district || ''
              if (place) {
                const distStr = district && district !== place ? ` (${district})` : ''
                placeName = `${place}${distStr}, ${state || 'India'}`
                stateName = state || 'India'
              }
            }
          } catch (e) {
            console.warn('Reverse geocoding error:', e)
          }

          const gpsLocation: LocationItem = {
            name: placeName,
            state: stateName,
            region: 'Local Sector',
            lat: lat,
            lon: lon,
            type: 'Live GPS Location',
            crop: 'Regional Agriculture',
            risk: 'Micro-climate Monitoring'
          }
          handleSelectLocation(gpsLocation)
        },
        (err) => {
          console.warn('GPS error:', err)
          alert('GPS location permission denied. Please pick a location from the search bar.')
        }
      )
    }
  }

  // Single source-of-truth effect: fires on location (lat/lon) or role/crop change.
  // Using lat/lon primitives instead of full object reference avoids false triggers
  // when the same location object is re-created with the same coordinates.
  useEffect(() => {
    const lat = currentLocation.lat
    const lon = currentLocation.lon
    const name = currentLocation.name

    fetchLiveWeather(lat, lon, name, false)
    fetchLiveAlerts(lat, lon)
    fetchCrowdData(lat, lon)

    const interval = setInterval(() => {
      fetchLiveWeather(lat, lon, name, true) // silent background refresh
      fetchLiveAlerts(lat, lon)
    }, 60000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocation.lat, currentLocation.lon, userRole, cropStage])

  // Restore user-specific data on sign-in
  useEffect(() => {
    if (isSignedIn && user) {
      const savedLocation = lsRead<LocationItem | null>('location', null)
      const savedRole = lsRead<UserRole | null>('role', null)
      const savedCropStage = lsRead<string | null>('cropStage', null)
      const savedTrustScore = lsRead<number | null>('trustScore', null)

      if (savedLocation) setCurrentLocation(savedLocation)
      if (savedRole) setUserRole(savedRole)
      if (savedCropStage) setCropStage(savedCropStage)
      if (savedTrustScore !== null) setTrustScore(savedTrustScore)
    }
  }, [isSignedIn, user?.id])

  // Sync profile to backend on sign-in
  useEffect(() => {
    async function syncBackendProfile() {
      if (isSignedIn && user) {
        try {
          const token = await getToken()
          await fetch('/api/v1/auth/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              full_name: user.fullName || user.primaryEmailAddress?.emailAddress,
              role: userRole,
              crop_stage: cropStage,
              language_preference: language
            })
          })
        } catch (err) {
          console.warn('Profile sync deferred:', err)
        }
      }
    }
    syncBackendProfile()
  }, [isSignedIn, user?.id])

  // Handle Ground Report Submission
  const handleSubmitReport = async (reportData: any) => {
    const token = isSignedIn ? await getToken() : 'guest_token'
    const res = await fetch('/api/v1/crowd/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...reportData,
        latitude: currentLocation.lat + (Math.random() - 0.5) * 0.02,
        longitude: currentLocation.lon + (Math.random() - 0.5) * 0.02,
        location_name: currentLocation.name
      })
    })
    if (res.ok) {
      handleAddTrustScore(15)
      fetchCrowdData()
    }
  }

  return (
    <BrowserRouter>
      <div className="h-screen max-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-sky-50/25 to-blue-50/20 text-slate-800 flex font-['Plus_Jakarta_Sans',sans-serif]">
        
        {/* Persistent Desktop Collapsible Sidebar (Fixed in place) */}
        <Sidebar 
          currentLocation={currentLocation}
          trustScore={trustScore}
          userRole={userRole}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />

        {/* Mobile Navigation Drawer */}
        <MobileNav 
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          currentLocation={currentLocation}
          trustScore={trustScore}
        />

        {/* Main Content View Wrapper (Dedicated Smooth Scrollable Area) */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto overflow-x-hidden">
          
          {/* Top Header (Pinned Sticky at the Top) */}
          <Header 
            currentLocation={currentLocation}
            onSelectLocation={handleSelectLocation}
            onDetectLocation={handleDetectGPSLocation}
            systemAlert={systemAlert}
            userRole={userRole}
            setUserRole={handleSetUserRole}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            trustScore={trustScore}
            onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
          />

          {/* Top Subtle Weather Sync Progress Bar */}
          {isWeatherLoading && (
            <div className="sticky top-[53px] left-0 right-0 z-40 h-[2.5px] bg-slate-200/60 overflow-hidden pointer-events-none">
              <div className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 animate-pulse w-full shadow-xs" />
            </div>
          )}

          {/* Page Routing Views */}
          <main className="p-3 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
            <Routes>
              <Route 
                path="/" 
                element={
                  <OverviewPage 
                    weather={weather}
                    currentLocation={currentLocation}
                    userRole={userRole}
                    systemAlert={systemAlert}
                    crowdReports={crowdReports}
                    isLoading={isWeatherLoading}
                    onRefreshWeather={() => fetchLiveWeather(currentLocation.lat, currentLocation.lon, currentLocation.name, false)}
                  />
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <OverviewPage 
                    weather={weather}
                    currentLocation={currentLocation}
                    userRole={userRole}
                    systemAlert={systemAlert}
                    crowdReports={crowdReports}
                    isLoading={isWeatherLoading}
                    onRefreshWeather={() => fetchLiveWeather(currentLocation.lat, currentLocation.lon, currentLocation.name, false)}
                  />
                } 
              />
              <Route 
                path="/overview" 
                element={
                  <OverviewPage 
                    weather={weather}
                    currentLocation={currentLocation}
                    userRole={userRole}
                    systemAlert={systemAlert}
                    crowdReports={crowdReports}
                    isLoading={isWeatherLoading}
                    onRefreshWeather={() => fetchLiveWeather(currentLocation.lat, currentLocation.lon, currentLocation.name, false)}
                  />
                } 
              />
              <Route 
                path="/forecast" 
                element={
                  <ForecastPage 
                    currentLocation={currentLocation}
                    weather={weather}
                  />
                } 
              />
              <Route 
                path="/alerts" 
                element={
                  <AlertsPage 
                    currentLocation={currentLocation}
                    userRole={userRole}
                    cropStage={cropStage}
                  />
                } 
              />
              <Route 
                path="/maps" 
                element={
                  <MapsPage 
                    currentLocation={currentLocation}
                    crowdReports={crowdReports}
                  />
                } 
              />
              <Route 
                path="/chat" 
                element={
                  <ChatPage 
                    currentLocation={currentLocation}
                    weather={weather}
                    userRole={userRole}
                    cropStage={cropStage}
                    user={user}
                    isSignedIn={isSignedIn}
                    getToken={getToken}
                    language={language}
                  />
                } 
              />
              <Route 
                path="/advisory" 
                element={
                  <AdvisoryPage 
                    currentLocation={currentLocation}
                    weather={weather}
                    userRole={userRole}
                    cropStage={cropStage}
                  />
                } 
              />
              <Route 
                path="/community" 
                element={
                  <CommunityPage 
                    currentLocation={currentLocation}
                    crowdReports={crowdReports}
                    leaderboard={leaderboard}
                    nowcastCorrection={nowcastCorrection}
                    onOpenReportModal={() => setIsReportModalOpen(true)}
                  />
                } 
              />
              <Route 
                path="/climate" 
                element={
                  <ClimatePage 
                    currentLocation={currentLocation}
                  />
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <SettingsPage 
                    user={user}
                    isSignedIn={isSignedIn}
                    userRole={userRole}
                    setUserRole={handleSetUserRole}
                    cropStage={cropStage}
                    setCropStage={handleSetCropStage}
                    currentLocation={currentLocation}
                    onSelectLocation={handleSelectLocation}
                    language={language}
                    setLanguage={handleSetLanguage}
                  />
                } 
              />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>

          {/* Clean App Footer */}
          <footer className="border-t border-slate-200/80 bg-white/70 py-4 px-6 text-center text-xs text-slate-500 font-medium">
            Jatayu &copy; 2026 — Pan-India Hyperlocal Weather Intelligence & Multi-Source Ground Truth Platform.
          </footer>

        </div>

        {/* Ground Report Modal */}
        <ReportModal 
          isOpen={isReportModalOpen} 
          onClose={() => setIsReportModalOpen(false)} 
          onSubmitReport={handleSubmitReport}
        />

        {/* Session Timeout Warning Modal (security: auto-logout after 20 min idle) */}
        <SessionTimeoutModal
          isOpen={showWarning}
          secondsLeft={secondsLeft}
          onStaySignedIn={resetTimer}
          onSignOut={handleIdleTimeout}
        />

      </div>
    </BrowserRouter>
  )
}
