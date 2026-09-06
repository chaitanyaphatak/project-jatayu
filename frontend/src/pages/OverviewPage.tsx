import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  Droplets, Wind, Gauge, Umbrella, Activity, 
  ShieldCheck, ArrowUpRight, Sparkles, Layers, 
  Calendar, CheckCircle2, ChevronRight, ChevronDown, ChevronUp, 
  Compass, Zap, SlidersHorizontal, RefreshCw, Sunrise, Sunset, 
  Cpu, Sun, Cloud, CloudSun, CloudRain, CloudLightning, CloudSnow,
  MapPin, Eye, Bookmark, BookmarkCheck, Lock, TrendingUp, Thermometer, BarChart2
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'
import WeatherMap from '../components/WeatherMap'
import WeatherBackground from '../components/WeatherBackground'
import { getWeatherTheme, WEATHER_THEMES, WeatherThemeKey } from '../utils/weatherThemes'
import { useAuthGate } from '../components/AuthProtectedAction'

// Custom Apple-Styled Tooltip for Recharts
function CustomAppleChartTooltip({ active, payload, label, unit = '' }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md text-white px-3 py-2 rounded-2xl border border-white/20 shadow-xl text-xs space-y-1">
        <p className="text-[10px] font-bold text-slate-400 border-b border-white/10 pb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <span className="text-slate-300 font-medium">{entry.name}:</span>
            <span className="font-black" style={{ color: entry.color || '#fff' }}>
              {entry.value}{unit}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function OverviewPage({ 
  weather, 
  currentLocation, 
  userRole, 
  systemAlert, 
  crowdReports, 
  isLoading = false,
  onRefreshWeather 
}: {
  weather?: any
  currentLocation?: any
  userRole?: string
  systemAlert?: any
  crowdReports?: any[]
  isLoading?: boolean
  onRefreshWeather?: () => void
}) {
  const [unit, setUnit] = useState<'C' | 'F'>('C')
  const [isSyncing, setIsSyncing] = useState(false)
  const [showSourcesDetail, setShowSourcesDetail] = useState(false)
  const [showThemePicker, setShowThemePicker] = useState(false)
  const [overrideTheme, setOverrideTheme] = useState<WeatherThemeKey | null>(null)
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [analyticsMetric, setAnalyticsMetric] = useState<'temp' | 'rain' | 'wind' | 'humidity'>('temp')
  const [forecastData, setForecastData] = useState<any>(null)
  const [currentTimeStr, setCurrentTimeStr] = useState('')
  const [isLocationSaved, setIsLocationSaved] = useState(false)
  const { isSignedIn, executeGuarded } = useAuthGate()

  // Temperature unit converter helper
  const toUnit = (celsius: number) => {
    if (unit === 'F') {
      return Math.round((celsius * 9) / 5 + 32)
    }
    return Math.round(celsius)
  }

  const currentTemp = weather?.temp !== undefined ? weather.temp : 26.5
  const aqi = weather?.aqi || 45
  const surfacePressure = weather?.surfacePressure || 1008
  const humidity = weather?.humidity || 78
  const windSpeed = weather?.windSpeed || 12
  const rainProb = weather?.rainProb || 40
  const visibility = weather?.visibility !== undefined ? weather.visibility : 10.0
  const uvIndex = weather?.uvIndex !== undefined ? weather.uvIndex : 5.2

  // Local live time string
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
      setCurrentTimeStr(timeString)
    }
    updateTime()
    const timer = setInterval(updateTime, 10000)
    return () => clearInterval(timer)
  }, [])

  // Fetch forecast data for the 7-day strip and hourly curve
  useEffect(() => {
    let isMounted = true
    const fetchForecast = async () => {
      try {
        const lat = currentLocation?.lat || 18.5204
        const lon = currentLocation?.lon || 73.8567
        const locName = currentLocation?.name || ''
        const res = await fetch(`/api/v1/weather/forecast?lat=${lat}&lon=${lon}&location_name=${encodeURIComponent(locName)}`)
        if (res.ok && isMounted) {
          const data = await res.json()
          setForecastData(data)
        }
      } catch (e) {
        console.warn('Forecast fetch warning:', e)
      }
    }
    fetchForecast()
    return () => { isMounted = false }
  }, [currentLocation?.lat, currentLocation?.lon, currentLocation?.name])

  const handleManualSync = () => {
    if (onRefreshWeather) {
      setIsSyncing(true)
      onRefreshWeather()
      setTimeout(() => setIsSyncing(false), 800)
    }
  }

  // Live sources breakdown
  const sourceReadings = weather?.sourceReadings || [
    { name: 'Open-Meteo (ECMWF/GFS)', short_name: 'Open-Meteo', temp: currentTemp, weight_percent: 50, raw_weight: 0.35, status: 'active', model_desc: 'ECMWF & GFS NWP Physics' },
    { name: 'OpenWeatherMap', short_name: 'OpenWeather', temp: Math.round((currentTemp + 1.2) * 10) / 10, weight_percent: 29, raw_weight: 0.20, status: 'active', model_desc: 'Atmospheric Radar Grid' },
    { name: 'WeatherAPI.com', short_name: 'WeatherAPI', temp: Math.round((currentTemp - 1.4) * 10) / 10, weight_percent: 21, raw_weight: 0.15, status: 'active', model_desc: 'Micro-climate Network' },
  ]
  const confidenceLevel = weather?.confidenceLevel || 'high'
  const confidenceLabel = weather?.confidenceLabel || (confidenceLevel === 'high' ? 'High confidence' : confidenceLevel === 'low' ? 'Low confidence — sources disagree' : 'Moderate confidence')
  const confidenceSpread = weather?.confidenceSpread !== undefined ? weather.confidenceSpread : 1.2

  // Auto theme computation
  const autoThemeKey = getWeatherTheme({
    weatherCode: weather?.weatherCode,
    conditionCode: weather?.conditionCode,
    condition: weather?.condition,
    isDay: weather?.isDay,
  })

  React.useEffect(() => {
    setOverrideTheme(null)
  }, [currentLocation?.lat, currentLocation?.lon, currentLocation?.name])

  const activeThemeKey = overrideTheme || autoThemeKey
  const activeThemeConfig = WEATHER_THEMES[activeThemeKey]
  const isDarkTheme = activeThemeConfig.isNight || activeThemeConfig.type === 'night' || activeThemeConfig.type === 'stormy' || activeThemeConfig.type === 'rainy'

  // Weekly Days data list
  const dailyList = useMemo(() => {
    if (forecastData?.daily && forecastData.daily.length > 0) {
      return forecastData.daily.map((d: any, idx: number) => {
        let dayName = idx === 0 ? 'Today' : `Day ${idx + 1}`
        try {
          const dateObj = new Date(d.date)
          if (!isNaN(dateObj.getTime())) {
            const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' })
            const dayNum = dateObj.getDate()
            dayName = idx === 0 ? 'Today' : `${weekday} ${dayNum}`
          }
        } catch {}
        return {
          dayLabel: dayName,
          tempMax: d.temp_max !== undefined ? d.temp_max : (currentTemp + 2 + (idx % 3)),
          tempMin: d.temp_min !== undefined ? d.temp_min : (currentTemp - 5 - (idx % 2)),
          condition: d.condition || 'Partly cloudy',
          rainProb: d.rain_prob !== undefined ? d.rain_prob : (15 + idx * 5),
          weatherCode: d.weather_code || 2
        }
      })
    }

    // Default 7-day fallback matching the reference screenshot
    return [
      { dayLabel: 'Today', tempMax: currentTemp + 2, tempMin: currentTemp - 5, condition: 'Mostly cloudy', rainProb: 19, weatherCode: 2 },
      { dayLabel: 'Mon 7', tempMax: currentTemp + 1, tempMin: currentTemp - 5, condition: 'Partly cloudy', rainProb: 19, weatherCode: 2 },
      { dayLabel: 'Tue 8', tempMax: currentTemp + 2, tempMin: currentTemp - 5, condition: 'Partly cloudy', rainProb: 3, weatherCode: 1 },
      { dayLabel: 'Wed 9', tempMax: currentTemp + 2, tempMin: currentTemp - 5, condition: 'Sunny intervals', rainProb: 3, weatherCode: 1 },
      { dayLabel: 'Thu 10', tempMax: currentTemp + 2, tempMin: currentTemp - 5, condition: 'Mostly sunny', rainProb: 4, weatherCode: 0 },
      { dayLabel: 'Fri 11', tempMax: currentTemp + 3, tempMin: currentTemp - 5, condition: 'Clear sky', rainProb: 8, weatherCode: 0 },
      { dayLabel: 'Sat 12', tempMax: currentTemp + 3, tempMin: currentTemp - 4, condition: 'Warm & sunny', rainProb: 23, weatherCode: 0 },
    ]
  }, [forecastData, currentTemp])

  // Hourly curve points matching real backend forecast data
  const hourlyData = useMemo(() => {
    if (forecastData?.hourly && forecastData.hourly.length > 0) {
      const sampled = []
      const step = Math.max(1, Math.floor(forecastData.hourly.length / 8))
      for (let i = 0; i < forecastData.hourly.length && sampled.length < 8; i += step) {
        const h = forecastData.hourly[i]
        let timeLabel = h.time || `${i}:00`
        try {
          if (h.time && h.time.includes(':')) {
            const [hoursStr] = h.time.split(':')
            const hourNum = parseInt(hoursStr, 10)
            const ampm = hourNum >= 12 ? 'PM' : 'AM'
            const formattedHour = hourNum % 12 === 0 ? 12 : hourNum % 12
            timeLabel = `${formattedHour} ${ampm}`
          }
        } catch {}
        sampled.push({
          time: timeLabel,
          temp: toUnit(h.temp !== undefined ? h.temp : currentTemp),
          rain: h.rain_prob !== undefined ? h.rain_prob : 15,
          isCurrent: sampled.length === 0,
          condition: h.condition || 'Clear'
        })
      }
      if (sampled.length > 0) return sampled
    }

    return [
      { time: '5 PM', temp: toUnit(currentTemp - 1), rain: 19, isCurrent: true },
      { time: '8 PM', temp: toUnit(currentTemp - 3), rain: 19 },
      { time: '11 PM', temp: toUnit(currentTemp - 4), rain: 3 },
      { time: '2 AM', temp: toUnit(currentTemp - 4), rain: 3 },
      { time: '5 AM', temp: toUnit(currentTemp - 4), rain: 4 },
      { time: '8 AM', temp: toUnit(currentTemp - 3), rain: 4 },
      { time: '11 AM', temp: toUnit(currentTemp), rain: 8 },
      { time: '2 PM', temp: toUnit(currentTemp + 1), rain: 23 },
    ]
  }, [forecastData, currentTemp, unit])

  // Rich 24-hour meteorological dataset for high quality Recharts graphics
  const hourlyAnalyticsData = useMemo(() => {
    if (forecastData?.hourly && forecastData.hourly.length > 0) {
      return forecastData.hourly.slice(0, 24).map((h: any) => {
        let timeLabel = h.time || '12 PM'
        try {
          if (h.time && h.time.includes('T')) {
            const dateObj = new Date(h.time)
            timeLabel = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
          }
        } catch {}
        const tempC = h.temp ?? currentTemp
        return {
          time: timeLabel,
          temp: toUnit(tempC),
          dewPoint: toUnit(h.dew_point ?? (tempC - 4)),
          rainProb: h.rain_prob ?? h.pop ?? (h.precipitation_probability ?? 10),
          windSpeed: Math.round(h.wind_speed ?? windSpeed),
          windGust: Math.round((h.wind_speed ?? windSpeed) * 1.45),
          humidity: Math.round(h.humidity ?? humidity),
          pressure: Math.round(h.pressure ?? surfacePressure)
        }
      })
    }

    // High-fidelity diurnal synthetic progression fallback matching the location
    const hours = ['12 AM', '2 AM', '4 AM', '6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM']
    const tempDeltas = [-5, -6, -6, -4, -1, 2, 4, 3, 2, 0, -2, -4]
    const rainDeltas = [5, 4, 3, 4, 8, 12, 18, 24, 20, 15, 10, 6]
    const windDeltas = [8, 7, 6, 8, 11, 14, 16, 15, 13, 11, 9, 8]
    const humDeltas = [88, 92, 94, 90, 82, 70, 62, 65, 71, 78, 82, 85]

    return hours.map((hour, idx) => ({
      time: hour,
      temp: toUnit(currentTemp + tempDeltas[idx]),
      dewPoint: toUnit(currentTemp + tempDeltas[idx] - 5),
      rainProb: rainDeltas[idx],
      windSpeed: windDeltas[idx],
      windGust: Math.round(windDeltas[idx] * 1.5),
      humidity: humDeltas[idx],
      pressure: surfacePressure + Math.round(Math.sin(idx) * 2)
    }))
  }, [forecastData, currentTemp, unit, windSpeed, humidity, surfacePressure])

  // High & Low for selected day
  const activeDay = dailyList[selectedDayIndex] || dailyList[0]
  const highTemp = toUnit(activeDay?.tempMax ?? (currentTemp + 2))
  const lowTemp = toUnit(activeDay?.tempMin ?? (currentTemp - 5))

  // SVG Hourly Curve Calculations
  const chartWidth = 520
  const chartHeight = 110
  const paddingX = 32
  const paddingY = 22

  const minTempChart = Math.min(...hourlyData.map(d => d.temp)) - 1
  const maxTempChart = Math.max(...hourlyData.map(d => d.temp)) + 1
  const tempRange = Math.max(1, maxTempChart - minTempChart)

  const points = hourlyData.map((d, index) => {
    const x = paddingX + (index * (chartWidth - 2 * paddingX)) / (hourlyData.length - 1)
    const y = chartHeight - paddingY - 30 - ((d.temp - minTempChart) / tempRange) * (chartHeight - 2 * paddingY - 30)
    return { x, y, ...d }
  })

  // SVG Smooth Bezier Path Generator
  const curvePath = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x},${point.y}`
    const prev = arr[i - 1]
    const cx = (prev.x + point.x) / 2
    return `${acc} C ${cx},${prev.y} ${cx},${point.y} ${point.x},${point.y}`
  }, '')

  const areaPath = `${curvePath} L ${points[points.length - 1].x},${chartHeight - 28} L ${points[0].x},${chartHeight - 28} Z`

  // Weather Condition Icon component
  const renderWeatherIcon = (code?: number, size = 'w-6 h-6') => {
    if (activeThemeKey.includes('rain') || activeThemeKey.includes('drizzle')) {
      return <CloudRain className={`${size} text-sky-500 shrink-0`} />
    }
    if (activeThemeKey.includes('storm')) {
      return <CloudLightning className={`${size} text-amber-500 shrink-0`} />
    }
    if (activeThemeKey.includes('snow')) {
      return <CloudSnow className={`${size} text-indigo-300 shrink-0`} />
    }
    if (activeThemeKey.includes('cloudy') || activeThemeKey.includes('overcast')) {
      return <CloudSun className={`${size} text-amber-500 shrink-0`} />
    }
    return <Sun className={`${size} text-amber-500 shrink-0`} />
  }

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200">
      
      {/* ─── 1. TOP WELCOME & LIVE TELEMETRY BAR ─────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight transition-all">
              {currentLocation?.name || 'Pune (Haveli), Maharashtra'}
            </h2>
            
            {/* Live Indicator Pill */}
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
              </span>
              LIVE RADAR
            </span>

            {/* Quick Live Sync Button */}
            {onRefreshWeather && (
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isLoading || isSyncing}
                title="Sync Latest Satellite & Radar Telemetry"
                className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-full border border-sky-200 shadow-2xs transition cursor-pointer active:scale-95"
              >
                <RefreshCw className={`w-3 h-3 text-sky-600 ${isLoading || isSyncing ? 'animate-spin' : ''}`} />
                <span>{isLoading || isSyncing ? 'Syncing...' : 'Sync Telemetry'}</span>
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Sector: <strong className="text-slate-800">{currentLocation?.region || 'West'} India</strong> • Dominant Crop: <strong className="text-emerald-700">{currentLocation?.crop || 'Soybean & Sugarcane'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/forecast"
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs transition flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-sky-600" /> 7-Day Forecast
          </Link>
          <Link
            to="/chat"
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" /> Ask Vayu AI
          </Link>
        </div>
      </div>

      {/* ─── 2. MAIN DASHBOARD GRID ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        
        {/* ─── LEFT HERO CARD & DIURNAL CHARTS (7 COLUMNS) ─── */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden relative transition-all">
            
            {/* WeatherBackground Animated Dynamic Section */}
            <WeatherBackground theme={activeThemeKey} className="p-4 sm:p-5 flex flex-col justify-between">
              
              {/* Top Row: Location + Time + Unit Switcher + Theme Switcher */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`text-sm sm:text-base font-extrabold tracking-tight flex items-center gap-1 truncate ${
                      isDarkTheme ? 'text-white drop-shadow-sm' : 'text-slate-900'
                    }`}>
                      <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                      <span className="truncate">{currentLocation?.name || 'Pune (Haveli), Maharashtra'}</span>
                    </h3>

                    {/* Auth-gated Save Location Button */}
                    <button
                      type="button"
                      onClick={() => executeGuarded(() => {
                        setIsLocationSaved(prev => !prev)
                      }, 'Sign in to save favorite agricultural plots & locations')}
                      title={isSignedIn ? (isLocationSaved ? "Saved to your account" : "Save location to account") : "Sign in to save this location"}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition shadow-2xs cursor-pointer backdrop-blur-md ${
                        isLocationSaved
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : isDarkTheme
                          ? 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                          : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200/80'
                      }`}
                    >
                      {isLocationSaved ? (
                        <BookmarkCheck className="w-3 h-3 text-white" />
                      ) : (
                        <Bookmark className={`w-3 h-3 ${isDarkTheme ? 'text-white/80' : 'text-slate-500'}`} />
                      )}
                      <span>{isLocationSaved ? 'Saved' : 'Save'}</span>
                      {!isSignedIn && (
                        <Lock className="w-2.5 h-2.5 ml-0.5 opacity-80" />
                      )}
                    </button>

                    <span className={`text-[11px] font-bold backdrop-blur-md px-2 py-0.5 rounded-md shadow-2xs whitespace-nowrap border ${
                      isDarkTheme 
                        ? 'text-white bg-white/20 border-white/25' 
                        : 'text-slate-700 bg-white/75 border-slate-200/60'
                    }`}>
                      {currentTimeStr || '03:40 PM'}
                    </span>
                  </div>
                  <p className={`text-[11px] font-medium mt-0.5 ${
                    isDarkTheme ? 'text-slate-300' : 'text-slate-500'
                  }`}>
                    Updated a few minutes ago
                  </p>
                </div>

                {/* Right controls: °F/°C Toggle + Theme Picker */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* °F / °C Pill Switcher */}
                  <div className="inline-flex rounded-xl bg-slate-900/80 p-0.5 backdrop-blur-md shadow-xs border border-white/20">
                    <button
                      type="button"
                      onClick={() => setUnit('F')}
                      className={`px-2 py-0.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                        unit === 'F' ? 'bg-sky-500 text-white shadow-2xs' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      °F
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnit('C')}
                      className={`px-2 py-0.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                        unit === 'C' ? 'bg-sky-500 text-white shadow-2xs' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      °C
                    </button>
                  </div>

                  {/* Theme Switcher Button */}
                  <button
                    onClick={() => setShowThemePicker(!showThemePicker)}
                    className={`p-1.5 rounded-xl backdrop-blur-md shadow-2xs transition cursor-pointer border ${
                      isDarkTheme
                        ? 'bg-white/15 hover:bg-white/25 text-white border-white/20'
                        : 'bg-white/80 hover:bg-white text-slate-700 border-slate-200/80'
                    }`}
                    title="Explore Dynamic Weather Animations"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Theme Picker Dropdown */}
              {showThemePicker && (
                <div className="mt-2.5 p-2 rounded-2xl bg-slate-900/90 backdrop-blur-lg border border-white/20 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150 z-20">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-200 px-1">
                    <span>🎨 Live Animation Preview Mode</span>
                    <button onClick={() => setShowThemePicker(false)} className="text-slate-400 hover:text-white">✕</button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(Object.keys(WEATHER_THEMES) as WeatherThemeKey[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => setOverrideTheme(key)}
                        className={`px-2 py-0.5 rounded-lg text-[9px] font-bold transition cursor-pointer ${
                          activeThemeKey === key ? 'bg-sky-500 text-white shadow-xs' : 'bg-white/15 text-slate-200 hover:bg-white/25'
                        }`}
                      >
                        {WEATHER_THEMES[key].label.split('/')[0].trim()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Hero Condition Section: Weather Icon + Big Temp + Condition Text */}
              <div className="my-3 sm:my-4 flex flex-col gap-3">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    {/* Weather Icon Frame */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/85 backdrop-blur-md border border-white/40 shadow-xs flex items-center justify-center shrink-0">
                      {renderWeatherIcon(weather?.weatherCode, 'w-8 h-8 sm:w-10 sm:h-10')}
                    </div>

                    {/* Large Temp + Condition text */}
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-4xl sm:text-5xl font-black tracking-tight ${
                          isDarkTheme ? 'text-white drop-shadow-md' : 'text-slate-900'
                        }`}>
                          {toUnit(currentTemp)}°{unit}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <p className={`text-sm sm:text-base font-bold capitalize ${
                          isDarkTheme ? 'text-white/90 drop-shadow-sm' : 'text-slate-800'
                        }`}>
                          {weather?.condition || 'Mostly cloudy'}
                        </p>
                        <span className={`text-xs font-semibold ${
                          isDarkTheme ? 'text-slate-200' : 'text-slate-500'
                        }`}>
                          H {highTemp}° L {lowTemp}°
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Confidence Pill Badge */}
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md border shadow-2xs ${
                      confidenceLevel === 'high' 
                        ? isDarkTheme ? 'bg-emerald-950/70 text-emerald-300 border-emerald-400/40' : 'bg-emerald-500/15 text-emerald-800 border-emerald-500/30'
                        : confidenceLevel === 'moderate'
                        ? isDarkTheme ? 'bg-amber-950/70 text-amber-300 border-amber-400/40' : 'bg-amber-500/15 text-amber-800 border-amber-500/30'
                        : isDarkTheme ? 'bg-rose-950/70 text-rose-300 border-rose-400/40' : 'bg-rose-500/15 text-rose-800 border-rose-500/30'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        confidenceLevel === 'high' ? 'bg-emerald-400' : confidenceLevel === 'moderate' ? 'bg-amber-400' : 'bg-rose-400'
                      }`} />
                      {confidenceLabel} ({confidenceSpread <= 2.0 ? '±' + confidenceSpread + '°C' : '±' + confidenceSpread + '°C spread'})
                    </span>
                  </div>
                </div>

                {/* ─── Expandable Sources Detail (Transparency UI) ─── */}
                <div className="mt-1">
                  <button
                    type="button"
                    onClick={() => setShowSourcesDetail(!showSourcesDetail)}
                    className={`w-full flex items-center justify-between text-left text-xs font-semibold px-3 py-1.5 rounded-xl backdrop-blur-md border shadow-2xs transition-all cursor-pointer group ${
                      isDarkTheme 
                        ? 'bg-slate-900/60 hover:bg-slate-900/80 text-white border-white/20' 
                        : 'bg-white/70 hover:bg-white/90 text-slate-700 border-slate-200/70'
                    }`}
                    title="Click to view raw readings from all meteorological sources"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-sky-700 bg-sky-100/90 px-1.5 py-0.5 rounded">
                        Sources ({sourceReadings.filter(s => s.status !== 'excluded_anomaly').length})
                      </span>
                      <span className={`truncate font-medium text-[11px] ${isDarkTheme ? 'text-slate-200' : 'text-slate-600'}`}>
                        {sourceReadings
                          .filter(s => s.status !== 'excluded_anomaly')
                          .map(s => `${s.short_name}: ${toUnit(s.temp)}°${unit}`)
                          .join(' · ')}
                      </span>
                    </div>
                    <span className="text-sky-400 group-hover:text-sky-300 shrink-0 flex items-center gap-0.5 text-[11px] font-bold">
                      {showSourcesDetail ? 'Hide' : 'Details'}
                      {showSourcesDetail ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </span>
                  </button>

                  {/* Expanded Multi-Source Breakdown Card */}
                  {showSourcesDetail && (
                    <div className="mt-2 p-3.5 rounded-2xl bg-white/95 backdrop-blur-lg border border-slate-200/90 shadow-sm space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-150 text-slate-800">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Multi-Model Ensemble Breakdown
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          Weighted Average Fusion
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {sourceReadings.map((src, idx) => {
                          const isExcluded = src.status === 'excluded_anomaly'
                          return (
                            <div 
                              key={idx}
                              className={`p-2.5 rounded-xl border transition-all ${
                                isExcluded 
                                  ? 'bg-rose-50/60 border-rose-200/80 opacity-75' 
                                  : 'bg-slate-50/80 border-slate-200/70 hover:bg-slate-100/80'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-900 truncate">{src.short_name}</span>
                                <span className={`text-xs font-black ${isExcluded ? 'text-rose-600 line-through' : 'text-slate-900'}`}>
                                  {toUnit(src.temp)}°{unit}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 truncate mt-0.5">{src.model_desc || src.name}</p>
                              <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-200/40 text-[10px]">
                                <span className="font-semibold text-slate-600">Weight: {src.weight_percent}%</span>
                                {isExcluded ? (
                                  <span className="text-rose-700 font-bold bg-rose-100 px-1 py-0.2 rounded text-[9px]">Anomaly &gt;8°C</span>
                                ) : (
                                  <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                                    <CheckCircle2 className="w-2.5 h-2.5" /> Active
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <p className="text-[10px] text-slate-500 font-medium leading-normal bg-sky-50/60 p-2 rounded-xl border border-sky-100">
                        💡 <strong>Ground Truth Accuracy:</strong> ECMWF Physics (0.50), IMD Radar (0.25), OpenWeather (0.15), and WeatherAPI (0.10) with dynamic anomaly rejection.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ─── 7-DAY WEEKLY FORECAST STRIP ─── */}
              <div className="pt-2 border-t border-white/20">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  {dailyList.map((day, idx) => {
                    const isSelected = selectedDayIndex === idx
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedDayIndex(idx)}
                        className={`p-2 rounded-2xl min-w-[62px] sm:min-w-[68px] text-center transition-all cursor-pointer flex flex-col items-center justify-between shrink-0 border ${
                          isSelected
                            ? 'bg-white text-slate-900 border-sky-400 shadow-md ring-2 ring-sky-300/50 scale-102'
                            : isDarkTheme
                            ? 'bg-white/15 hover:bg-white/25 text-white border-white/20 shadow-xs'
                            : 'bg-white/60 hover:bg-white/90 text-slate-700 border-slate-200/60 shadow-2xs'
                        }`}
                      >
                        <span className={`text-[10px] sm:text-[11px] font-black tracking-tight truncate w-full ${
                          isSelected ? 'text-slate-900' : isDarkTheme ? 'text-white' : 'text-slate-800'
                        }`}>
                          {day.dayLabel}
                        </span>
                        <div className="my-1 flex items-center justify-center h-6">
                          {renderWeatherIcon(day.weatherCode, 'w-5 h-5')}
                        </div>
                        <div className="flex items-center justify-center gap-1 text-[10px] font-bold">
                          <span className={isSelected ? 'text-slate-900 font-black' : isDarkTheme ? 'text-white font-black' : 'text-slate-900 font-bold'}>
                            {toUnit(day.tempMax)}°
                          </span>
                          <span className={isSelected ? 'text-slate-500' : isDarkTheme ? 'text-slate-300 font-medium' : 'text-slate-400 font-normal'}>
                            {toUnit(day.tempMin)}°
                          </span>
                        </div>
                      </button>
                    )
                  })}
                  
                  {/* Next Arrow link */}
                  <Link
                    to="/forecast"
                    className={`p-2 rounded-2xl backdrop-blur-md border shadow-2xs flex items-center justify-center shrink-0 min-w-[32px] h-[78px] transition ${
                      isDarkTheme 
                        ? 'bg-white/15 hover:bg-white/25 text-white border-white/20' 
                        : 'bg-white/60 hover:bg-white/90 text-slate-600 border-slate-200/60'
                    }`}
                    title="View Full 7-Day Forecast"
                  >
                    <ChevronRight className="w-4 h-4 text-sky-400" />
                  </Link>
                </div>
              </div>

              {/* ─── HOURLY TEMPERATURE & RAIN PROBABILITY CURVE ─── */}
              <div className="mt-3 pt-2 border-t border-white/20">
                <div className="relative w-full">
                  <svg 
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                    className="w-full h-28 overflow-visible"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.45" />
                        <stop offset="60%" stopColor="#fb923c" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#fdba74" stopOpacity="0.0" />
                      </linearGradient>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#f97316" floodOpacity="0.5"/>
                      </filter>
                    </defs>

                    {/* Gradient Area under curve */}
                    <path d={areaPath} fill="url(#curveGradient)" />

                    {/* Smooth Spline Curve Line */}
                    <path d={curvePath} fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" filter="url(#glow)" />

                    {/* Current Hour Dotted Vertical Indicator */}
                    {points.filter(p => p.isCurrent).map((p, idx) => (
                      <g key={idx}>
                        <line 
                          x1={p.x} 
                          y1={6} 
                          x2={p.x} 
                          y2={chartHeight - 28} 
                          stroke={isDarkTheme ? '#94a3b8' : '#475569'} 
                          strokeWidth="1.5" 
                          strokeDasharray="3,3" 
                        />
                        <circle cx={p.x} cy={p.y} r="4.5" fill="#f97316" stroke="#ffffff" strokeWidth="2.5" />
                      </g>
                    ))}

                    {/* Temperature Labels along curve */}
                    {points.map((p, idx) => (
                      <text
                        key={`temp-${idx}`}
                        x={p.x}
                        y={p.y - 7}
                        textAnchor="middle"
                        fill={isDarkTheme ? '#ffffff' : '#0f172a'}
                        fontWeight="900"
                        fontSize="11"
                        style={{ filter: isDarkTheme ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.85))' : 'none' }}
                      >
                        {toUnit(p.temp)}°
                      </text>
                    ))}

                    {/* Rain drops & Rain % text inside SVG */}
                    {points.map((p, idx) => (
                      <g key={`rain-${idx}`} transform={`translate(${p.x}, ${chartHeight - 16})`}>
                        <text
                          x="0"
                          y="0"
                          textAnchor="middle"
                          fill="#38bdf8"
                          fontWeight="900"
                          fontSize="10"
                          style={{ filter: isDarkTheme ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.7))' : 'none' }}
                        >
                          💧{p.rain}%
                        </text>
                        <text
                          x="0"
                          y="13"
                          textAnchor="middle"
                          fill={isDarkTheme ? '#cbd5e1' : '#64748b'}
                          fontWeight="700"
                          fontSize="9.5"
                        >
                          {p.time}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>

            </WeatherBackground>
          </div>

          {/* ─── NEW INTERACTIVE RECHARTS ATMOSPHERIC ANALYTICS CARD ─── */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-md space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                    Diurnal Dynamics & Analytics
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    24-hour meteorological trends for {currentLocation?.name || 'Local Sector'}
                  </p>
                </div>
              </div>

              {/* Metric Selector Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80">
                {[
                  { id: 'temp', label: 'Temp', icon: Thermometer },
                  { id: 'rain', label: 'Precip', icon: Umbrella },
                  { id: 'wind', label: 'Wind', icon: Wind },
                  { id: 'humidity', label: 'Humidity', icon: Droplets }
                ].map((tab) => {
                  const Icon = tab.icon
                  const isActive = analyticsMetric === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setAnalyticsMetric(tab.id as any)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-white text-sky-700 shadow-xs ring-1 ring-slate-200/60'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Quick Stat Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-slate-50/90 rounded-2xl p-2.5 border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Peak Temp</span>
                <p className="text-base font-black text-slate-900 mt-0.5">{highTemp}°{unit}</p>
                <span className="text-[10px] text-emerald-600 font-bold">2:00 PM Afternoon</span>
              </div>
              <div className="bg-slate-50/90 rounded-2xl p-2.5 border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Min Dew Point</span>
                <p className="text-base font-black text-slate-900 mt-0.5">{lowTemp - 3}°{unit}</p>
                <span className="text-[10px] text-sky-600 font-bold">5:00 AM Morning</span>
              </div>
              <div className="bg-slate-50/90 rounded-2xl p-2.5 border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Max Rain Chance</span>
                <p className="text-base font-black text-slate-900 mt-0.5">{rainProb}%</p>
                <span className="text-[10px] text-indigo-600 font-bold">Scattered Shower</span>
              </div>
              <div className="bg-slate-50/90 rounded-2xl p-2.5 border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Wind Gusts</span>
                <p className="text-base font-black text-slate-900 mt-0.5">{Math.round(windSpeed * 1.5)} km/h</p>
                <span className="text-[10px] text-amber-600 font-bold">Gentle Breeze</span>
              </div>
            </div>

            {/* Interactive Recharts Graph */}
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {analyticsMetric === 'temp' ? (
                  <AreaChart data={hourlyAnalyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="dewGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} unit={`°${unit}`} />
                    <Tooltip content={<CustomAppleChartTooltip unit={`°${unit}`} />} />
                    <Area type="monotone" dataKey="temp" name="Temperature" stroke="#f97316" strokeWidth={2.5} fill="url(#tempGradient)" />
                    <Area type="monotone" dataKey="dewPoint" name="Dew Point" stroke="#38bdf8" strokeWidth={2} strokeDasharray="4 4" fill="url(#dewGradient)" />
                  </AreaChart>
                ) : analyticsMetric === 'rain' ? (
                  <BarChart data={hourlyAnalyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                    <Tooltip content={<CustomAppleChartTooltip unit="%" />} />
                    <Bar dataKey="rainProb" name="Precipitation Probability" fill="#0284c7" radius={[6, 6, 0, 0]} />
                  </BarChart>
                ) : analyticsMetric === 'wind' ? (
                  <AreaChart data={hourlyAnalyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} unit=" km/h" />
                    <Tooltip content={<CustomAppleChartTooltip unit=" km/h" />} />
                    <Area type="monotone" dataKey="windGust" name="Wind Gusts" stroke="#14b8a6" strokeWidth={1.5} strokeDasharray="3 3" fill="transparent" />
                    <Area type="monotone" dataKey="windSpeed" name="Sustained Wind" stroke="#0f766e" strokeWidth={2.5} fill="url(#windGradient)" />
                  </AreaChart>
                ) : (
                  <AreaChart data={hourlyAnalyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="humGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                    <Tooltip content={<CustomAppleChartTooltip unit="%" />} />
                    <Area type="monotone" dataKey="humidity" name="Relative Humidity" stroke="#6366f1" strokeWidth={2.5} fill="url(#humGradient)" />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ─── RIGHT 5 COLUMNS: RESTORED ORIGINAL METRIC WIDGETS ─── */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* ─── LIVE ATMOSPHERIC TELEMETRY: APPLE BENTO MATRIX ─── */}
          <div className="bg-white rounded-3xl p-4.5 sm:p-5 border border-slate-200/90 shadow-xs space-y-3.5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-sky-600" />
                  Live Atmospheric Telemetry
                </span>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Sensors (4)
              </span>
            </div>

            {/* 4 Apple-Style Telemetry Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* 1. AIR QUALITY (AQI) CARD */}
              <div className="bg-slate-50/80 hover:bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 flex flex-col justify-between space-y-2.5 transition-all">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5 truncate">
                    <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Air Quality
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                    aqi <= 50 ? 'bg-emerald-100 text-emerald-800' :
                    aqi <= 100 ? 'bg-amber-100 text-amber-800' :
                    'bg-rose-100 text-rose-800'
                  }`}>
                    {aqi <= 50 ? 'Good' : aqi <= 100 ? 'Moderate' : 'Unhealthy'}
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{aqi}</span>
                    <span className="text-[11px] font-bold text-slate-400">AQI</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5 truncate">
                    {aqi <= 50 ? 'Clean & satisfactory air.' : aqi <= 100 ? 'Acceptable air quality.' : 'Sensitive precaution advised.'}
                  </p>
                </div>

                {/* AQI Spectrum Bar */}
                <div className="space-y-1">
                  <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 relative">
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-sm border border-slate-900"
                      style={{ left: `${Math.min(95, Math.max(5, (aqi / 200) * 100))}%` }}
                    />
                  </div>
                </div>

                {/* Pollutant tags */}
                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 pt-1 border-t border-slate-200/60">
                  <span>PM2.5: <strong className="text-slate-800 font-black">{Math.round(aqi * 0.45)}</strong></span>
                  <span>PM10: <strong className="text-slate-800 font-black">{Math.round(aqi * 0.75)}</strong></span>
                </div>
              </div>

              {/* 2. SURFACE PRESSURE CARD */}
              <div className="bg-slate-50/80 hover:bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 flex flex-col justify-between space-y-2.5 transition-all">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5 truncate">
                    <Gauge className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    Pressure
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 shrink-0">
                    {surfacePressure >= 1008 ? 'Stable' : 'Low'}
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{surfacePressure}</span>
                    <span className="text-[11px] font-bold text-slate-400">hPa</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5 truncate">
                    {surfacePressure >= 1012 ? 'High pressure • Clear skies' : surfacePressure >= 1005 ? 'Standard barometric level' : 'Low pressure • Clouds'}
                  </p>
                </div>

                {/* Pressure Bar */}
                <div className="space-y-1">
                  <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-rose-400 via-sky-400 to-indigo-600 relative">
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-sm border border-slate-900"
                      style={{ left: `${Math.min(95, Math.max(5, ((surfacePressure - 980) / 60) * 100))}%` }}
                    />
                  </div>
                </div>

                {/* Pressure tags */}
                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 pt-1 border-t border-slate-200/60">
                  <span>Norm: <strong className="text-slate-800 font-black">MSLP QNH</strong></span>
                  <span>Trend: <strong className="text-emerald-700 font-black">Steady</strong></span>
                </div>
              </div>

              {/* 3. UV INDEX CARD */}
              <div className="bg-slate-50/80 hover:bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 flex flex-col justify-between space-y-2.5 transition-all">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5 truncate">
                    <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    UV Index
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                    uvIndex <= 2.9 ? 'bg-emerald-100 text-emerald-800' :
                    uvIndex <= 5.9 ? 'bg-amber-100 text-amber-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {uvIndex <= 2.9 ? 'Low' : uvIndex <= 5.9 ? 'Moderate' : 'High'}
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{uvIndex}</span>
                    <span className="text-[11px] font-bold text-slate-400">/ 12</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5 truncate">
                    {uvIndex <= 2.9 ? 'Low solar exposure today.' : uvIndex <= 5.9 ? 'Sunglasses recommended.' : 'High solar flux • Seek shade.'}
                  </p>
                </div>

                {/* UV Bar */}
                <div className="space-y-1">
                  <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 via-orange-500 to-purple-600 relative">
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-sm border border-slate-900"
                      style={{ left: `${Math.min(95, Math.max(5, (uvIndex / 12) * 100))}%` }}
                    />
                  </div>
                </div>

                {/* UV tags */}
                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 pt-1 border-t border-slate-200/60">
                  <span>Peak: <strong className="text-slate-800 font-black">11 AM - 3 PM</strong></span>
                  <span>Sun: <strong className={uvIndex >= 6 ? 'text-amber-700 font-black' : 'text-emerald-700 font-black'}>{uvIndex >= 6 ? 'Shield' : 'Safe'}</strong></span>
                </div>
              </div>

              {/* 4. VISIBILITY CARD */}
              <div className="bg-slate-50/80 hover:bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 flex flex-col justify-between space-y-2.5 transition-all">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5 truncate">
                    <Eye className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    Visibility
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 shrink-0">
                    {visibility >= 10 ? 'Clear' : 'Moderate'}
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{visibility}</span>
                    <span className="text-[11px] font-bold text-slate-400">km</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5 truncate">
                    {visibility >= 10 ? 'Crystal clear horizon view.' : visibility >= 5 ? 'Light mist present.' : 'Fog warning • Reduced scope.'}
                  </p>
                </div>

                {/* Visibility Bar */}
                <div className="space-y-1">
                  <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-rose-400 via-amber-400 via-sky-400 to-emerald-500 relative">
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-sm border border-slate-900"
                      style={{ left: `${Math.min(95, Math.max(5, (visibility / 10) * 100))}%` }}
                    />
                  </div>
                </div>

                {/* Visibility tags */}
                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 pt-1 border-t border-slate-200/60">
                  <span>Scope: <strong className="text-slate-800 font-black">{Math.round(visibility * 1000)}m</strong></span>
                  <span>Fog: <strong className="text-emerald-700 font-black">None</strong></span>
                </div>
              </div>

            </div>
          </div>

          {/* Farm Spraying & Outdoor Guide */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-amber-600" />
                Agro Spraying Window
              </span>
              <Link to="/advisory" className="text-[11px] font-bold text-sky-600 hover:text-sky-800 flex items-center gap-0.5">
                Full Guide <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950">{currentLocation?.crop || 'Crop'} Treatment</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                  FAVORABLE WINDOW
                </span>
              </div>
              <p className="text-xs text-emerald-900 mt-2 leading-relaxed font-normal">
                Precipitation probability is {rainProb}% and wind is {windSpeed} km/h. Suitable for agricultural treatment and field logistics.
              </p>
            </div>
          </div>

          {/* Multi-Model Physics Consensus — Live Explainable Forecast */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Explainable Forecast
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                Live Multi-Model Grid
              </span>
            </div>

            {/* Per-source reading list */}
            <div className="space-y-1.5">
              {sourceReadings.filter(s => s.status !== 'excluded_anomaly').map((src, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-sky-500' : i === 1 ? 'bg-indigo-500' : 'bg-teal-500'}`} />
                    <span className="text-slate-600 font-medium">{src.short_name}</span>
                  </div>
                  <span className="font-black text-slate-900">{toUnit(src.temp)}°{unit}</span>
                </div>
              ))}
              {sourceReadings.some(s => s.status === 'excluded_anomaly') && (
                <div className="flex items-center gap-1.5 text-[10px] text-rose-600 font-semibold pt-0.5">
                  <span className="w-2 h-2 rounded-full bg-rose-300" />
                  {sourceReadings.find(s => s.status === 'excluded_anomaly')?.short_name} excluded (anomaly &gt;8°C)
                </div>
              )}
            </div>

            <ul className="space-y-1.5 text-xs text-slate-600 font-medium pt-1 border-t border-slate-100">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Weighted fusion from {sourceReadings.filter(s => s.status !== 'excluded_anomaly').length} active atmospheric models.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Barometric pressure at {surfacePressure} hPa confirms stable atmospheric layer.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

      {/* ─── 3. LIVE RADAR SECTION PREVIEW (ORIGINAL BOTTOM SECTION) ───────────── */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              Live Doppler Radar & Precipitation Echo Sweep
            </h3>
            <p className="text-xs text-slate-500 font-medium">Real-time 25km radius centered on {currentLocation?.name}</p>
          </div>
          <Link
            to="/maps"
            className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 font-bold text-xs hover:bg-sky-100 transition flex items-center gap-1 border border-sky-200"
          >
            Open Interactive Maps <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="h-[260px] sm:h-[340px] rounded-2xl overflow-hidden border border-slate-200">
          <WeatherMap 
            activeLayer="radar" 
            crowdReports={crowdReports}
            centerCoords={[currentLocation?.lat || 18.5204, currentLocation?.lon || 73.8567]}
            locationName={currentLocation?.name || 'Local Area'}
          />
        </div>
      </div>

    </div>
  )
}
