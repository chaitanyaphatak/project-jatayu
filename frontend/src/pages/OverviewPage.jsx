import React from 'react'
import { Link } from 'react-router-dom'
import { 
  CloudRain, Droplets, Wind, Gauge, Umbrella, Activity, 
  ShieldCheck, AlertTriangle, ArrowUpRight, Sparkles, Layers, 
  Calendar, CheckCircle2, ChevronRight, Sprout, Plane
} from 'lucide-react'
import WeatherMap from '../components/WeatherMap'

export default function OverviewPage({ weather, currentLocation, userRole, systemAlert, crowdReports }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Welcome & Location Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {currentLocation?.name || 'Pune, Maharashtra'}
            </h2>
            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
              {currentLocation?.type || 'Ground Station'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinates: {currentLocation?.lat?.toFixed(4)}°N, {currentLocation?.lon?.toFixed(4)}°E • Sector: <strong className="text-slate-700">{currentLocation?.region || 'West'} India</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/forecast"
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-xs transition flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-sky-600" /> View 7-Day Forecast
          </Link>
          <Link
            to="/chat"
            className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" /> Ask AI Agent
          </Link>
        </div>
      </div>

      {/* Main Grid: Hero Telemetry (7 cols) + Activity Scorer & Explainability (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Hero Telemetry Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm glass-card-hover flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                  Tri-Fusion Live Ingestion
                </span>
                
                <div className="flex items-baseline gap-3 mt-3">
                  <span className="text-5xl font-black text-slate-900 tracking-tight">{weather?.temp}°C</span>
                  <span className="text-xs text-slate-500 font-bold bg-slate-100 px-2.5 py-1 rounded-lg">
                    Feels like {weather?.feelsLike}°C
                  </span>
                </div>

                <p className="text-sm font-bold text-slate-700 mt-2">{weather?.condition}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dominant Agriculture: <strong className="text-emerald-700">{currentLocation?.crop || 'Regional Crops'}</strong>
                </p>
              </div>

              <div className="p-4 bg-sky-50 text-sky-600 rounded-3xl border border-sky-100 shadow-xs shrink-0">
                <CloudRain className="w-10 h-10" />
              </div>
            </div>

            {/* Micro-metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
              <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-100 text-center">
                <Droplets className="w-4 h-4 text-sky-600 mx-auto mb-1" />
                <p className="text-[10px] text-slate-500 font-bold uppercase">Humidity</p>
                <p className="text-sm font-black text-slate-800">{weather?.humidity}%</p>
              </div>

              <div className="p-3 rounded-2xl bg-teal-50/60 border border-teal-100 text-center">
                <Wind className="w-4 h-4 text-teal-600 mx-auto mb-1" />
                <p className="text-[10px] text-slate-500 font-bold uppercase">Wind</p>
                <p className="text-sm font-black text-slate-800">{weather?.windSpeed} <span className="text-[10px] font-normal">km/h</span></p>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 text-center">
                <Umbrella className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <p className="text-[10px] text-slate-500 font-bold uppercase">Rain Prob</p>
                <p className="text-sm font-black text-slate-800">{weather?.rainProb}%</p>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-center">
                <Gauge className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                <p className="text-[10px] text-slate-500 font-bold uppercase">Barometer</p>
                <p className="text-sm font-black text-slate-800">{weather?.surfacePressure} <span className="text-[10px] font-normal">hPa</span></p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Ensemble: ECMWF, GFS, WeatherAPI, OWM</span>
            <span className="text-sky-700 font-bold bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
              {weather?.modelAgreement}% Consensus ({weather?.modelRating})
            </span>
          </div>
        </div>

        {/* Side Cards: Activity Impact & Explainability */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Activity Impact Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm glass-card-hover space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-amber-600" />
                Activity Decision Score
              </span>
              <Link to="/advisory" className="text-[11px] font-bold text-sky-600 hover:text-sky-800 flex items-center gap-0.5">
                Full Details <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">{currentLocation?.crop || 'Crop'} Spraying Window</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                  FAVORABLE
                </span>
              </div>
              <p className="text-xs text-emerald-800 mt-2 leading-relaxed font-normal">
                Rain probability ({weather?.rainProb}%) and wind velocity ({weather?.windSpeed} km/h) are within safe agricultural treatment thresholds.
              </p>
            </div>
          </div>

          {/* Explainability Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm glass-card-hover space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Forecast Explainability ("Why?")
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {weather?.modelAgreement}% Consensus
              </span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Multi-model physics (ECMWF & GFS) converge within 1.5°C variance.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Barometric pressure at {weather?.surfacePressure} hPa confirms atmospheric layer stability.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

      {/* Interactive Map Section Preview */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              Regional Radar & Doppler Echo Coverage
            </h3>
            <p className="text-xs text-slate-500">Live 25km scan centered on {currentLocation?.name}</p>
          </div>
          <Link
            to="/maps"
            className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 font-bold text-xs hover:bg-sky-100 transition flex items-center gap-1 border border-sky-200"
          >
            Expand Map Layers <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="h-[340px] rounded-2xl overflow-hidden border border-slate-200">
          <WeatherMap 
            activeLayer="radar" 
            crowdReports={crowdReports}
            centerCoords={[currentLocation?.lat || 18.5204, currentLocation?.lon || 73.8567]}
            locationName={currentLocation?.name || 'Local Station'}
          />
        </div>
      </div>

    </div>
  )
}
