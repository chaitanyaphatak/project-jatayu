import React, { useState, useEffect } from 'react'
import { 
  AlertTriangle, ShieldCheck, Flame, Bell, CheckCircle2, 
  MapPin, Activity, ArrowUpRight, Zap, RefreshCw, AlertCircle
} from 'lucide-react'

export default function AlertsPage({ currentLocation, userRole, cropStage }) {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAlerts = async () => {
    setLoading(true)
    try {
      const lat = currentLocation?.lat || 18.5204
      const lon = currentLocation?.lon || 73.8567
      const res = await fetch(`/api/v1/alerts?lat=${lat}&lon=${lon}&role=${userRole}&crop_stage=${encodeURIComponent(cropStage)}`)
      if (res.ok) {
        const data = await res.json()
        setAlerts(data)
      }
    } catch (e) {
      console.warn('Alerts fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [currentLocation, userRole, cropStage])

  const alertLevelColors = {
    WARNING: 'bg-amber-50 border-amber-300 text-amber-900',
    WATCH: 'bg-yellow-50 border-yellow-300 text-yellow-900',
    ADVISORY: 'bg-sky-50 border-sky-300 text-sky-900',
    EMERGENCY: 'bg-rose-50 border-rose-300 text-rose-900'
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Title Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Active Alerts, Warnings & Anomaly Detector
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical Z-Score & Isolation Forest real-time evaluations for <strong className="text-slate-800">{currentLocation?.name}</strong>
          </p>
        </div>

        <button
          onClick={fetchAlerts}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-xs transition flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${loading ? 'animate-spin' : ''}`} />
          Refresh Warnings
        </button>
      </div>

      {/* Warning Severity Level Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></span>
          <span>Green: No Warning (Safe)</span>
        </div>
        <div className="p-3 rounded-2xl bg-yellow-50 border border-yellow-200 text-yellow-800 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-yellow-500 shrink-0"></span>
          <span>Yellow: Watch (Be Updated)</span>
        </div>
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></span>
          <span>Orange: Alert (Be Prepared)</span>
        </div>
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0"></span>
          <span>Red: Warning (Take Action)</span>
        </div>
      </div>

      {/* Active Alerts List */}
      <div className="space-y-4">
        {alerts.length > 0 ? (
          alerts.map((a, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-3xl border shadow-sm transition space-y-3 ${
                alertLevelColors[a.alert_type] || 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/90 border border-current shadow-xs">
                      {a.alert_type}
                    </span>
                    <h3 className="text-base font-extrabold">{a.title}</h3>
                  </div>
                  <p className="text-xs leading-relaxed opacity-95">
                    {a.description}
                  </p>
                </div>
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-xl bg-white/80 border border-current shrink-0">
                  Anomaly: +{a.z_score}σ
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/70 border border-current/20 text-xs flex items-center justify-between">
                <span><strong>Recommended Action:</strong> {a.recommended_action}</span>
                <span className="text-[10px] font-bold opacity-75">Triggered via ML Anomaly Engine</span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Critical Extreme Weather Alarms</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Current ground observations and Doppler radar scans for {currentLocation?.name} show atmospheric conditions within normal standard deviations (z-score &lt; 1.5σ).
            </p>
          </div>
        )}
      </div>

    </div>
  )
}
