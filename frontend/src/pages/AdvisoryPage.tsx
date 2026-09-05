import React from 'react'
import { 
  Sprout, Plane, Flame, ShieldCheck, CheckCircle2, 
  AlertTriangle, Droplets, Wind, Gauge, Sun
} from 'lucide-react'

export default function AdvisoryPage({ currentLocation, weather, userRole, cropStage }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Title Header */}
      <div className="pb-2 border-b border-slate-200/80">
        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          Specialized Decision Support Suite (Agriculture & Aviation)
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Hyperlocal operational criteria for <strong className="text-slate-800">{currentLocation?.name}</strong> • Current Persona: <strong className="text-emerald-700 capitalize">{userRole}</strong>
        </p>
      </div>

      {/* 3 Sector Advisory Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Agricultural Crop Advisory */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm glass-card-hover space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200">
              <Sprout className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
              SAFE APPLICATION
            </span>
          </div>

          <div>
            <h3 className="text-base font-extrabold text-slate-900">Agro-Chemical Treatment Window</h3>
            <p className="text-xs text-slate-500 mt-0.5">Target Crop: <strong className="text-emerald-700">{currentLocation?.crop || 'Soybean / Cotton'}</strong></p>
          </div>

          <div className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
              <span>Spraying Wash-off Risk:</span>
              <strong className="text-emerald-700">{weather?.rainProb < 40 ? 'LOW (Safe)' : 'HIGH (Delay)'}</strong>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
              <span>Drift Wind Velocity:</span>
              <strong className="text-slate-800">{weather?.windSpeed} km/h (Favorable &lt; 15 km/h)</strong>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
              <span>Fungal Blight Humidity Index:</span>
              <strong className="text-amber-700">{weather?.humidity}% (Moderate Vigilance)</strong>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
            <strong>Advisory Verdict:</strong> Favorable application window for foliar fertilizers and bio-pesticides until 16:00 IST.
          </div>
        </div>

        {/* Card 2: Aviation Meteorological Advisory */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm glass-card-hover space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-sky-50 text-sky-700 rounded-2xl border border-sky-200">
              <Plane className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-sky-100 text-sky-800">
              VFR MARGINAL
            </span>
          </div>

          <div>
            <h3 className="text-base font-extrabold text-slate-900">Airway Corridor & Turbulence</h3>
            <p className="text-xs text-slate-500 mt-0.5">Sector: <strong className="text-sky-700">{currentLocation?.region || 'West'} Flight Corridor</strong></p>
          </div>

          <div className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
              <span>Barometric Altimeter:</span>
              <strong className="text-slate-800">{weather?.surfacePressure} hPa (QNH 1008)</strong>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
              <span>Crosswind Vector:</span>
              <strong className="text-slate-800">{weather?.windSpeed} km/h (Within Limits)</strong>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
              <span>Convective Updraft Hazard:</span>
              <strong className="text-amber-700">Moderate above FL120</strong>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900">
            <strong>Advisory Verdict:</strong> VFR flight clearances acceptable. Maintain surveillance for stratocumulus bases below 3,000 ft AGL.
          </div>
        </div>

        {/* Card 3: Disaster & Catchment Inundation */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm glass-card-hover space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200">
              <Flame className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-rose-100 text-rose-800">
              MONITORING
            </span>
          </div>

          <div>
            <h3 className="text-base font-extrabold text-slate-900">Catchment Inundation & Runoff</h3>
            <p className="text-xs text-slate-500 mt-0.5">Basin: <strong className="text-rose-700">{currentLocation?.name?.split(',')[0]} Catchment</strong></p>
          </div>

          <div className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
              <span>Soil Saturation Index:</span>
              <strong className="text-slate-800">54% (Normal Permeability)</strong>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
              <span>4-Hour Inflow Surge:</span>
              <strong className="text-emerald-700">Stable Baseflow</strong>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
              <span>Clustered Street Reports:</span>
              <strong className="text-slate-800">0 Active Inundations</strong>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
            <strong>Advisory Verdict:</strong> No flash flood warnings in effect. Retain regular automated telemetry monitoring.
          </div>
        </div>

      </div>

    </div>
  )
}
