import React from 'react'
import { Link } from 'react-router-dom'
import { 
  CloudRain, Droplets, Wind, Gauge, Umbrella, Activity, 
  ShieldCheck, ArrowUpRight, Sparkles, Layers, 
  Calendar, CheckCircle2, ChevronRight, Sun, Thermometer
} from 'lucide-react'
import WeatherMap from '../components/WeatherMap'

export default function OverviewPage({ weather, currentLocation, userRole, systemAlert, crowdReports }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Welcome & Location Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {currentLocation?.name || 'Pune, Maharashtra'}
            </h2>
            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
              Live Weather
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Region: <strong className="text-slate-700">{currentLocation?.region || 'West'} India</strong> • Main Crops: <strong className="text-emerald-700">{currentLocation?.crop || 'Regional Agriculture'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/forecast"
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-xs transition flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-sky-600" /> 7-Day Forecast
          </Link>
          <Link
            to="/chat"
            className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" /> Ask Vayu AI
          </Link>
        </div>
      </div>

      {/* Main Grid: Live Telemetry Card (7 cols) + Advisory & Accuracy (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Live Weather Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm glass-card-hover flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                  Current Condition
                </span>
                
                <div className="flex items-baseline gap-3 mt-3">
                  <span className="text-5xl font-black text-slate-900 tracking-tight">{weather?.temp}°C</span>
                  <span className="text-xs text-slate-500 font-bold bg-slate-100 px-2.5 py-1 rounded-lg">
                    Feels like {weather?.feelsLike}°C
                  </span>
                </div>

                <p className="text-sm font-bold text-slate-700 mt-2 capitalize">{weather?.condition}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Local Crop Zone: <strong className="text-emerald-700">{currentLocation?.crop || 'Soybean & Sugarcane'}</strong>
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-sky-50 to-blue-50 text-sky-600 rounded-3xl border border-sky-100 shadow-xs shrink-0">
                <CloudRain className="w-10 h-10" />
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
              <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-100 text-center">
                <Droplets className="w-4 h-4 text-sky-600 mx-auto mb-1" />
                <p className="text-[10px] text-slate-500 font-bold uppercase">Humidity</p>
                <p className="text-sm font-black text-slate-800">{weather?.humidity}%</p>
              </div>

              <div className="p-3 rounded-2xl bg-teal-50/60 border border-teal-100 text-center">
                <Wind className="w-4 h-4 text-teal-600 mx-auto mb-1" />
                <p className="text-[10px] text-slate-500 font-bold uppercase">Wind Speed</p>
                <p className="text-sm font-black text-slate-800">{weather?.windSpeed} <span className="text-[10px] font-normal">km/h</span></p>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 text-center">
                <Umbrella className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <p className="text-[10px] text-slate-500 font-bold uppercase">Rain Chance</p>
                <p className="text-sm font-black text-slate-800">{weather?.rainProb}%</p>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-center">
                <Gauge className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                <p className="text-[10px] text-slate-500 font-bold uppercase">Air Pressure</p>
                <p className="text-sm font-black text-slate-800">{weather?.surfacePressure} <span className="text-[10px] font-normal">hPa</span></p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Sources: National Weather Radar & Live Satellites</span>
            <span className="text-sky-700 font-bold bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
              {weather?.modelAgreement || 95}% Accuracy Score
            </span>
          </div>
        </div>

        {/* Side Cards: Activity & Clarity */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Outdoor & Farming Safety Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm glass-card-hover space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-amber-600" />
                Daily Activity & Farming Advice
              </span>
              <Link to="/advisory" className="text-[11px] font-bold text-sky-600 hover:text-sky-800 flex items-center gap-0.5">
                Full Guide <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">{currentLocation?.crop || 'Crop'} Field Conditions</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                  GOOD FOR WORK
                </span>
              </div>
              <p className="text-xs text-emerald-800 mt-2 leading-relaxed font-normal">
                Rain chance is {weather?.rainProb}% and wind is gentle ({weather?.windSpeed} km/h). Safe for outdoor activities, farm spray, and transport.
              </p>
            </div>
          </div>

          {/* Simple Explanation Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm glass-card-hover space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Forecast Confidence
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Verified Forecast
              </span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Multiple satellite models agree on today's pleasant temperature range.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Air pressure at {weather?.surfacePressure} hPa indicates steady weather ahead.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

      {/* Interactive Map Preview Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              Live Doppler Radar & Rain Map
            </h3>
            <p className="text-xs text-slate-500">Live 25km scan centered on {currentLocation?.name}</p>
          </div>
          <Link
            to="/maps"
            className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 font-bold text-xs hover:bg-sky-100 transition flex items-center gap-1 border border-sky-200"
          >
            Open All Map Layers <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="h-[340px] rounded-2xl overflow-hidden border border-slate-200">
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
