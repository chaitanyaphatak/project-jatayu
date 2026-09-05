import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useUser, useAuth } from '@clerk/clerk-react'

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

export default function App() {
  const { isSignedIn, user } = useUser()
  const { getToken } = useAuth()

  // Active Pan-India Location State
  const [currentLocation, setCurrentLocation] = useState({
    name: 'Pune (Haveli), Maharashtra',
    state: 'Maharashtra',
    region: 'West',
    lat: 18.5204,
    lon: 73.8567,
    type: 'Agri-Metro Hub',
    crop: 'Soybean & Sugarcane',
    risk: 'Convective Updraft & Showers'
  })

  // User Profile & Role State
  const [userRole, setUserRole] = useState('farmer') // 'farmer' | 'pilot' | 'citizen' | 'disaster_manager'
  const [cropStage, setCropStage] = useState('Flowering & Pod Formation (Soybean)')
  const [trustScore, setTrustScore] = useState(120)

  // Modals & Mobile Drawer State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Crowd Reports & Leaderboard State
  const [crowdReports, setCrowdReports] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [nowcastCorrection, setNowcastCorrection] = useState(null)

  // Live Weather Telemetry State
  const [weather, setWeather] = useState({
    temp: 24.5,
    feelsLike: 26.2,
    condition: 'Partly cloudy with stratocumulus',
    humidity: 82,
    windSpeed: 11.4,
    surfacePressure: 1008.5,
    rainProb: 60,
    aqi: 45,
    sourcesUsed: ['Open-Meteo (NWP Ensemble)', 'WeatherAPI.com', 'OpenWeatherMap'],
    modelAgreement: 94,
    modelRating: 'High Consensus',
    contributingFactors: [],
    activityImpact: null
  })

  // Proactive Alert Ticker State
  const [systemAlert, setSystemAlert] = useState({
    title: 'Hyperlocal Meteorological Advisory',
    detail: 'Optimal window for agrochemical spraying before afternoon convective cycle.',
    zScore: 'Isolation Forest: +1.0σ Anomaly'
  })

  // 1. Fetch live telemetry from backend Tri-Source engine
  const fetchLiveWeather = async (lat = currentLocation.lat, lon = currentLocation.lon, name = currentLocation.name) => {
    try {
      const res = await fetch(`/api/v1/weather/current?lat=${lat}&lon=${lon}&location_name=${encodeURIComponent(name)}`)
      if (res.ok) {
        const data = await res.json()
        setWeather({
          temp: data.temperature,
          feelsLike: data.feels_like,
          condition: data.condition,
          humidity: data.humidity,
          windSpeed: data.wind_speed,
          surfacePressure: data.surface_pressure || 1008.0,
          rainProb: data.precipitation_prob,
          aqi: data.air_quality_index || 48,
          sourcesUsed: data.sources_used || ['Open-Meteo', 'WeatherAPI.com', 'OpenWeatherMap'],
          modelAgreement: data.model_agreement_score || 92,
          modelRating: data.model_agreement_rating || 'High Consensus',
          contributingFactors: data.contributing_factors || [],
          activityImpact: data.activity_impact
        })
      }
    } catch (err) {
      console.warn('Weather fetch fallback:', err)
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

  // Handle location selection
  const handleSelectLocation = (loc) => {
    setCurrentLocation(loc)
    fetchLiveWeather(loc.lat, loc.lon, loc.name)
    fetchLiveAlerts(loc.lat, loc.lon)
    fetchCrowdData(loc.lat, loc.lon)
  }

  // Handle GPS location detection
  const handleDetectGPSLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(4))
          const lon = parseFloat(pos.coords.longitude.toFixed(4))
          const gpsLocation = {
            name: `Live Station (${lat}, ${lon})`,
            state: 'India',
            region: 'Local Sector',
            lat: lat,
            lon: lon,
            type: 'GPS Station',
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

  useEffect(() => {
    fetchLiveWeather()
    fetchLiveAlerts()
    fetchCrowdData()
    const interval = setInterval(() => {
      fetchLiveWeather()
      fetchLiveAlerts()
    }, 60000)
    return () => clearInterval(interval)
  }, [currentLocation, userRole, cropStage])

  // Sync profile with Clerk on sign-in
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
              language_preference: 'en'
            })
          })
        } catch (err) {
          console.warn('Profile sync deferred:', err)
        }
      }
    }
    syncBackendProfile()
  }, [isSignedIn, user, userRole, cropStage])

  // Handle Ground Report Submission
  const handleSubmitReport = async (reportData) => {
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
      setTrustScore(prev => prev + 15)
      fetchCrowdData()
    }
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/25 to-blue-50/20 text-slate-800 flex font-['Plus_Jakarta_Sans',sans-serif]">
        
        {/* Persistent Desktop Sidebar */}
        <Sidebar 
          currentLocation={currentLocation}
          trustScore={trustScore}
          userRole={userRole}
        />

        {/* Mobile Navigation Drawer */}
        <MobileNav 
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content View Wrapper */}
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          
          {/* Top Header */}
          <Header 
            currentLocation={currentLocation}
            onSelectLocation={handleSelectLocation}
            onDetectLocation={handleDetectGPSLocation}
            systemAlert={systemAlert}
            userRole={userRole}
            setUserRole={setUserRole}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            trustScore={trustScore}
            onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
          />

          {/* Page Routing Views */}
          <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
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
                    setUserRole={setUserRole}
                    cropStage={cropStage}
                    setCropStage={setCropStage}
                    currentLocation={currentLocation}
                    onSelectLocation={handleSelectLocation}
                  />
                } 
              />
              <Route path="*" element={<Navigate to="/overview" replace />} />
            </Routes>
          </main>

          {/* Clean App Footer */}
          <footer className="border-t border-slate-200/80 bg-white/70 py-4 px-6 text-center text-xs text-slate-500 font-medium">
            WeatherGPT &copy; 2026 — Pan-India Hyperlocal Weather Intelligence & Multi-Source Ground Truth Platform.
          </footer>

        </div>

        {/* Ground Report Modal */}
        <ReportModal 
          isOpen={isReportModalOpen} 
          onClose={() => setIsReportModalOpen(false)} 
          onSubmitReport={handleSubmitReport}
        />

      </div>
    </BrowserRouter>
  )
}
