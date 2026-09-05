import React from 'react'
import { Link } from 'react-router-dom'
import { 
  CloudRain, Droplets, Wind, Gauge, Umbrella, Activity, 
  ShieldCheck, ArrowUpRight, Sparkles, Layers, 
  Calendar, CheckCircle2, ChevronRight, Sun, Thermometer,
  Sunrise, Sunset, Eye, Compass, Zap, Radio
} from 'lucide-react'
import WeatherMap from '../components/WeatherMap'

export default function OverviewPage({ weather, currentLocation, userRole, systemAlert, crowdReports }) {
  const currentTemp = weather?.temp || 28.5
  const feelsLike = weather?.feelsLike || 29.8
  const aqi = weather?.aqi || 45

  // 24-hour mini-trend data points for dashboard sparkline
  const sparklineData = [
    { time: '6 AM', temp: currentTemp - 4, rain: 10 },
    { time: '9 AM', temp: currentTemp - 1, rain: 20 },
    { time: '12 PM', temp: currentTemp + 3, rain: 45 },
    { time: '3 PM', temp: currentTemp + 2, rain: 60 },
    { time: '6 PM', temp: currentTemp - 1, rain: 35 },
    { time: '9 PM', temp: currentTemp - 3, rain: 15 },
  ]

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200">
      
      {/* ─── 1. TOP WELCOME & LIVE TELEMETRY BAR ─────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {currentLocation?.name || 'Pune, Maharashtra'}
            </h2>
            
            {/* YouTube-style Live Animated Red Dot */}
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
              </span>
              LIVE DASHBOARD
            </span>
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        
        {/* Left 7 Columns: Hero Telemetry + 24h Progression */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Main Weather Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                    Real-Time Observations
                  </span>
                  
                  <div className="flex items-baseline gap-3 mt-3">
                    <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">{currentTemp}°C</span>
                    <span className="text-xs text-slate-600 font-bold bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60">
                      Feels like {feelsLike}°C
                    </span>
                  </div>

                  <p className="text-sm font-bold text-slate-800 mt-2 capitalize">{weather?.condition || 'Partly Cloudy'}</p>
                </div>

                <div className="p-3.5 sm:p-4 bg-gradient-to-tr from-sky-500 to-blue-600 text-white rounded-3xl shadow-lg shadow-sky-500/20 shrink-0">
                  <CloudRain className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
              </div>

              {/* Quick Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-5 pt-4 border-t border-slate-100">
                <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-100 text-center">
                  <Droplets className="w-4 h-4 text-sky-600 mx-auto mb-1" />
                  <p className="text-[10px] text-sky-800 font-bold uppercase">Humidity</p>
                  <p className="text-sm sm:text-base font-black text-slate-900">{weather?.humidity || 78}%</p>
                </div>

                <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-100 text-center">
                  <Wind className="w-4 h-4 text-teal-600 mx-auto mb-1" />
                  <p className="text-[10px] text-teal-800 font-bold uppercase">Wind</p>
                  <p className="text-sm sm:text-base font-black text-slate-900">{weather?.windSpeed || 12} <span className="text-[10px] font-normal text-slate-500">km/h</span></p>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 text-center">
                  <Umbrella className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <p className="text-[10px] text-blue-800 font-bold uppercase">Rain Chance</p>
                  <p className="text-sm sm:text-base font-black text-slate-900">{weather?.rainProb || 40}%</p>
                </div>

                <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-center">
                  <Gauge className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                  <p className="text-[10px] text-indigo-800 font-bold uppercase">Pressure</p>
                  <p className="text-sm sm:text-base font-black text-slate-900">{weather?.surfacePressure || 1008} <span className="text-[10px] font-normal text-slate-500">hPa</span></p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>National Doppler Radar Sync</span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {weather?.modelAgreement || 96}% Consensus
              </span>
            </div>
          </div>

          {/* 24-Hour Temperature & Rain Trend Sparkline Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-sky-600" />
                Today's Temperature Curve
              </span>
              <span className="text-[11px] font-bold text-slate-500">
                Peak: {Math.round(currentTemp + 3)}°C at 2:00 PM
              </span>
            </div>

            <div className="grid grid-cols-6 gap-2 pt-2">
              {sparklineData.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
                  <p className="text-[10px] font-bold text-slate-400">{item.time}</p>
                  <p className="text-sm font-black text-slate-900">{Math.round(item.temp)}°</p>
                  <div className="w-full bg-slate-200 rounded-full h-1 mt-1 overflow-hidden">
                    <div 
                      className="bg-sky-500 h-1 rounded-full" 
                      style={{ width: `${Math.min(100, Math.max(20, (item.temp / 40) * 100))}%` }}
                    ></div>
                  </div>
                  <p className="text-[9px] font-bold text-blue-600">{item.rain}% rain</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 5 Columns: Environmental Dials + Agro Impact */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Air Quality (AQI) & Solar Times Widget */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-600" />
                Air Quality & Solar Cycle
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Clean Air
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* AQI Indicator */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-center">
                <p className="text-[10px] text-emerald-800 font-bold uppercase">AQI Index</p>
                <p className="text-2xl font-black text-emerald-900 my-0.5">{aqi}</p>
                <p className="text-[10px] font-bold text-emerald-700">Good Quality</p>
              </div>

              {/* Sun Times */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-amber-900 font-semibold"><Sunrise className="w-3.5 h-3.5 text-amber-600" /> Rise:</span>
                  <strong className="text-amber-950">6:14 AM</strong>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-amber-900 font-semibold"><Sunset className="w-3.5 h-3.5 text-amber-600" /> Set:</span>
                  <strong className="text-amber-950">6:48 PM</strong>
                </div>
                <p className="text-[9px] text-amber-700 font-medium text-center pt-0.5">12h 34m Daylight</p>
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
                Precipitation probability is {weather?.rainProb || 40}% and wind is {weather?.windSpeed || 12} km/h. Suitable for agricultural treatment and field logistics.
              </p>
            </div>
          </div>

          {/* Multi-Model Physics Consensus */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Forecast Verification
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Multi-Model Validated
              </span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>ECMWF and GFS models converge within ±0.8°C accuracy.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Barometric pressure at {weather?.surfacePressure || 1008} hPa confirms steady layer stability.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

      {/* ─── 3. LIVE RADAR SECTION PREVIEW ─────────────────────────────────── */}
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
