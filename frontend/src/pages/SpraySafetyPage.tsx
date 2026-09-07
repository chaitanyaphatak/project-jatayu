import React, { useState, useEffect, useCallback } from 'react'
import {
  Sprout, Wind, Droplets, CheckCircle2, XCircle, AlertTriangle,
  RefreshCw, Clock, ChevronRight, FlaskConical, Thermometer,
  CloudRain, Zap, Info, Timer, Leaf
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Factor {
  label: string
  value: string
  safe_range: string
  status: string
  color: string
  ok: boolean
  marginal: boolean
  detail: string
  standard?: string
  wet_bulb_temp?: number
}

interface Decision {
  decision: 'GO' | 'CAUTION' | 'NO_GO'
  label: string
  color: string
  emoji: string
  headline: string
  summary: string
  blockers: string[]
  cautions: string[]
  window_minutes: number
  action: string
}

interface SprayData {
  location: string
  crop: { type: string; stage: string }
  decision: Decision
  factors: { delta_t: Factor; wind: Factor; rain: Factor }
  next_optimal_window: string
  powered_by: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function colorClass(color: string, type: 'bg' | 'text' | 'border' | 'ring') {
  const map: Record<string, Record<string, string>> = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', ring: 'ring-emerald-400' },
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   ring: 'ring-amber-400'   },
    rose:    { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    ring: 'ring-rose-400'    },
  }
  return map[color]?.[type] ?? ''
}

function FactorStatusIcon({ ok, marginal }: { ok: boolean; marginal: boolean }) {
  if (ok) return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
  if (marginal) return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
  return <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
}

// ─── Window Countdown Timer ───────────────────────────────────────────────────
function WindowTimer({ minutes }: { minutes: number }) {
  const [secsLeft, setSecsLeft] = useState(minutes * 60)
  useEffect(() => {
    if (minutes <= 0) return
    setSecsLeft(minutes * 60)
    const t = setInterval(() => setSecsLeft(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [minutes])
  const m = Math.floor(secsLeft / 60)
  const s = secsLeft % 60
  const pct = minutes > 0 ? (secsLeft / (minutes * 60)) * 100 : 0
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
        <span className="flex items-center gap-1.5"><Timer className="w-3.5 h-3.5 text-emerald-600" /> Safe Window Remaining</span>
        <span className="font-black text-emerald-700 tabular-nums text-sm">{m}:{s.toString().padStart(2, '0')}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-emerald-400 to-emerald-600"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ─── Big Decision Badge ───────────────────────────────────────────────────────
function DecisionBadge({ decision }: { decision: Decision }) {
  const configs = {
    GO:      { outer: 'from-emerald-400/20 to-emerald-600/10 border-emerald-300', inner: 'bg-emerald-500 shadow-emerald-300/60', label: 'text-emerald-700', pulse: 'bg-emerald-400' },
    CAUTION: { outer: 'from-amber-400/20 to-amber-600/10 border-amber-300',     inner: 'bg-amber-500 shadow-amber-300/60',     label: 'text-amber-700',   pulse: 'bg-amber-400'   },
    NO_GO:   { outer: 'from-rose-400/20 to-rose-600/10 border-rose-300',        inner: 'bg-rose-500 shadow-rose-300/60',        label: 'text-rose-700',    pulse: 'bg-rose-400'    },
  }
  const cfg = configs[decision.decision]
  return (
    <div className={`relative flex flex-col items-center justify-center rounded-3xl border-2 bg-gradient-to-br p-8 ${cfg.outer}`}>
      {/* Pulsing ring for GO */}
      {decision.decision === 'GO' && (
        <span className="absolute inset-0 rounded-3xl animate-ping opacity-20 border-4 border-emerald-400 pointer-events-none" />
      )}
      {/* Main circle */}
      <div className={`w-28 h-28 rounded-full flex items-center justify-center shadow-2xl ${cfg.inner} mb-4`}>
        <span className="text-5xl select-none">{decision.emoji}</span>
      </div>
      <p className={`text-3xl font-black tracking-wider ${cfg.label}`}>{decision.label}</p>
      <p className="text-base font-extrabold text-slate-800 mt-1">{decision.headline}</p>
      <p className="text-xs text-slate-500 text-center mt-2 max-w-xs">{decision.summary}</p>
    </div>
  )
}

// ─── Factor Card ─────────────────────────────────────────────────────────────
function FactorCard({ factor, icon: Icon }: { factor: Factor; icon: React.ElementType }) {
  return (
    <div className={`rounded-2xl border p-4 space-y-3 ${colorClass(factor.color, 'bg')} ${colorClass(factor.color, 'border')}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-xl ${colorClass(factor.color, 'bg')} border ${colorClass(factor.color, 'border')}`}>
            <Icon className={`w-4 h-4 ${colorClass(factor.color, 'text')}`} />
          </div>
          <span className="text-xs font-bold text-slate-700">{factor.label}</span>
        </div>
        <FactorStatusIcon ok={factor.ok} marginal={factor.marginal} />
      </div>
      <div className="flex items-end justify-between">
        <p className={`text-2xl font-black ${colorClass(factor.color, 'text')}`}>{factor.value}</p>
        <span className="text-[10px] font-bold text-slate-400 bg-white/70 px-2 py-0.5 rounded-lg border border-slate-200">
          Safe: {factor.safe_range}
        </span>
      </div>
      <p className="text-[11px] text-slate-600 leading-relaxed">{factor.detail}</p>
      {factor.standard && (
        <p className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
          <Info className="w-3 h-3" /> {factor.standard}
        </p>
      )}
    </div>
  )
}

// ─── Manual Input Controls ────────────────────────────────────────────────────
interface Inputs { temp: number; humidity: number; wind: number; rain: number; cropType: string; cropStage: string }

function InputSlider({ label, unit, value, min, max, step, onChange, icon: Icon }: {
  label: string; unit: string; value: number; min: number; max: number; step: number
  onChange: (v: number) => void; icon: React.ElementType
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-600 flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-slate-400" />{label}
        </span>
        <span className="font-black text-slate-900">{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full accent-sky-500 cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-slate-400">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SpraySafetyPage({ currentLocation, weather, cropStage }: any) {
  const [data, setData] = useState<SprayData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useWeatherData, setUseWeatherData] = useState(true)
  const [lastFetched, setLastFetched] = useState<Date | null>(null)

  // Manual override inputs (synced with live weather)
  const [inputs, setInputs] = useState<Inputs>({
    temp:      weather?.temp       ?? 28.5,
    humidity:  weather?.humidity   ?? 60,
    wind:      weather?.windSpeed  ?? 10.0,
    rain:      weather?.rainProb   ?? 0,
    cropType:  currentLocation?.crop?.split(' ')[0] ?? 'Soybean',
    cropStage: cropStage ?? 'Flowering'
  })

  // Synchronize when currentLocation or weather changes (e.g. user searches city or clicks Auto-Detect GPS)
  useEffect(() => {
    if (!useWeatherData) return

    let isMounted = true
    const syncLocationWeather = async () => {
      setLoading(true)
      setError(null)
      try {
        const lat = currentLocation?.lat
        const lon = currentLocation?.lon
        const locName = currentLocation?.name ?? 'Your Location'
        const cType = currentLocation?.crop?.split(' ')[0] ?? inputs.cropType
        const cStage = cropStage ?? inputs.cropStage

        // Call spray-safety backend with lat & lon for real-time live telemetry
        const queryParams = new URLSearchParams()
        if (lat !== undefined && lon !== undefined) {
          queryParams.set('lat', String(lat))
          queryParams.set('lon', String(lon))
        } else {
          queryParams.set('temp', String(weather?.temp ?? inputs.temp))
          queryParams.set('humidity', String(weather?.humidity ?? inputs.humidity))
          queryParams.set('wind_kmh', String(weather?.windSpeed ?? inputs.wind))
          queryParams.set('rain_prob', String(weather?.rainProb ?? inputs.rain))
        }
        queryParams.set('crop_type', cType)
        queryParams.set('crop_stage', cStage)
        queryParams.set('location_name', locName)

        const res = await fetch(`/api/v1/agro/spray-safety?${queryParams.toString()}`)
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        const json = await res.json()

        if (isMounted) {
          setData(json)
          setLastFetched(new Date())
          if (json.inputs) {
            setInputs({
              temp: json.inputs.temperature_c,
              humidity: json.inputs.humidity_percent,
              wind: json.inputs.wind_kmh,
              rain: json.inputs.rain_probability_percent,
              cropType: cType,
              cropStage: cStage
            })
          }
        }
      } catch (e: any) {
        if (isMounted) setError(e.message || 'Failed to fetch spray conditions')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    syncLocationWeather()
    return () => { isMounted = false }
  }, [currentLocation?.name, currentLocation?.lat, currentLocation?.lon, weather?.temp, weather?.humidity, weather?.windSpeed, weather?.rainProb, useWeatherData, cropStage])

  // Manual recalculation when user moves sliders
  const fetchSafetyManual = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        temp:          String(inputs.temp),
        humidity:      String(inputs.humidity),
        wind_kmh:      String(inputs.wind),
        rain_prob:     String(inputs.rain),
        crop_type:     inputs.cropType,
        crop_stage:    inputs.cropStage,
        location_name: currentLocation?.name ?? 'Your Farm',
      })
      const res = await fetch(`/api/v1/agro/spray-safety?${params}`)
      if (!res.ok) throw new Error(`API error ${res.status}`)
      const json = await res.json()
      setData(json)
      setLastFetched(new Date())
    } catch (e: any) {
      setError(e.message ?? 'Failed to calculate spray safety data')
    } finally {
      setLoading(false)
    }
  }, [inputs, currentLocation?.name])

  const dec = data?.decision

  return (
    <div className="space-y-6 animate-in fade-in duration-200">

      {/* ── Header ── */}
      <div className="pb-3 border-b border-slate-200/80 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <div className="p-1.5 bg-emerald-50 border border-emerald-200 rounded-xl">
              <Sprout className="w-5 h-5 text-emerald-600" />
            </div>
            GO / NO-GO Spray Safety Engine
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              UNIQUE ✦ JATAYU
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time spray window for <strong className="text-slate-800">{currentLocation?.name ?? 'Your Location'}</strong> •
            Powered by APVMA Delta-T + FAO Wind Drift + Precipitation Washout Model
          </p>
        </div>
        <button
          onClick={() => {
            if (useWeatherData) {
              // Re-trigger live fetch
              const lat = currentLocation?.lat
              const lon = currentLocation?.lon
              if (lat !== undefined && lon !== undefined) {
                setLoading(true)
                fetch(`/api/v1/agro/spray-safety?lat=${lat}&lon=${lon}&location_name=${encodeURIComponent(currentLocation?.name ?? '')}&crop_type=${encodeURIComponent(inputs.cropType)}&crop_stage=${encodeURIComponent(inputs.cropStage)}`)
                  .then(r => r.json())
                  .then(j => {
                    setData(j)
                    setLastFetched(new Date())
                    if (j.inputs) {
                      setInputs(p => ({
                        ...p,
                        temp: j.inputs.temperature_c,
                        humidity: j.inputs.humidity_percent,
                        wind: j.inputs.wind_kmh,
                        rain: j.inputs.rain_probability_percent,
                      }))
                    }
                  })
                  .catch(e => setError(e.message))
                  .finally(() => setLoading(false))
                return
              }
            }
            fetchSafetyManual()
          }}
          disabled={loading}
          className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer select-none
            ${loading
              ? 'bg-sky-500 text-white shadow-lg shadow-sky-300/50 scale-95 cursor-not-allowed'
              : 'bg-slate-100 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 hover:shadow-md hover:shadow-sky-100 text-slate-700 active:scale-95 border border-transparent hover:border-sky-200'
            }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 transition-transform duration-700 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
          {loading ? 'Analyzing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          <XCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── Left: Inputs Panel ── */}
        <div className="xl:col-span-1 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-sky-600" /> Weather Telemetry
              </h3>
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useWeatherData}
                  onChange={e => setUseWeatherData(e.target.checked)}
                  className="accent-sky-500 rounded cursor-pointer"
                />
                Auto (Live)
              </label>
            </div>

            <InputSlider label="Temperature" unit="°C" value={inputs.temp} min={10} max={50} step={0.5}
              onChange={v => { setUseWeatherData(false); setInputs(p => ({ ...p, temp: v })) }}
              icon={Thermometer}
            />
            <InputSlider label="Humidity" unit="%" value={inputs.humidity} min={10} max={100} step={1}
              onChange={v => { setUseWeatherData(false); setInputs(p => ({ ...p, humidity: v })) }}
              icon={Droplets}
            />
            <InputSlider label="Wind Speed" unit=" km/h" value={inputs.wind} min={0} max={60} step={0.5}
              onChange={v => { setUseWeatherData(false); setInputs(p => ({ ...p, wind: v })) }}
              icon={Wind}
            />
            <InputSlider label="Rain Probability" unit="%" value={inputs.rain} min={0} max={100} step={1}
              onChange={v => { setUseWeatherData(false); setInputs(p => ({ ...p, rain: v })) }}
              icon={CloudRain}
            />

            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1"><Leaf className="w-3 h-3"/>Crop Type</label>
                <input
                  value={inputs.cropType}
                  onChange={e => setInputs(p => ({ ...p, cropType: e.target.value }))}
                  className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  placeholder="e.g. Soybean, Cotton, Rice"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1"><Sprout className="w-3 h-3"/>Growth Stage</label>
                <select
                  value={inputs.cropStage}
                  onChange={e => setInputs(p => ({ ...p, cropStage: e.target.value }))}
                  className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400"
                >
                  {['Germination', 'Seedling', 'Vegetative', 'Flowering', 'Pod Formation', 'Grain Fill', 'Maturity', 'Harvesting'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {lastFetched && (
              <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" /> Last calculated: {lastFetched.toLocaleTimeString('en-IN')}
              </p>
            )}
          </div>
        </div>

        {/* ── Right: Decision + Factors ── */}
        <div className="xl:col-span-2 space-y-5 relative">

          {/* ── REFRESH OVERLAY ANIMATION (when re-fetching with existing data) ── */}
          {loading && data && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-3xl bg-white/80 backdrop-blur-sm border border-sky-200 shadow-xl">
              {/* Outer rotating ring */}
              <div className="relative flex items-center justify-center mb-5">
                <div className="w-20 h-20 rounded-full border-4 border-sky-100 absolute" />
                <div className="w-20 h-20 rounded-full border-4 border-t-sky-500 border-r-sky-300 border-b-transparent border-l-transparent animate-spin absolute" />
                <div className="w-12 h-12 rounded-full border-4 border-t-emerald-400 border-r-transparent border-b-transparent border-l-emerald-200 animate-spin absolute" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
                <RefreshCw className="w-6 h-6 text-sky-600 animate-pulse" />
              </div>
              <p className="text-sm font-black text-slate-800 animate-pulse">Re-analyzing Conditions…</p>
              <p className="text-xs text-slate-400 mt-1">Delta-T · Wind · Rain · IST Window</p>
              {/* Shimmer bar */}
              <div className="mt-4 w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full animate-shimmer"
                  style={{ background: 'linear-gradient(90deg, #38bdf8 0%, #34d399 50%, #38bdf8 100%)', backgroundSize: '200% 100%' }}
                />
              </div>
            </div>
          )}

          {/* Initial first-load skeleton (no data yet) */}
          {loading && !data && (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 flex flex-col items-center justify-center gap-4 min-h-[260px]">
              <div className="relative flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border-4 border-slate-100 absolute" />
                <div className="w-20 h-20 rounded-full border-4 border-t-sky-500 border-r-sky-300 border-b-transparent border-l-transparent animate-spin absolute" />
                <RefreshCw className="w-6 h-6 text-sky-500 animate-pulse" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-black text-slate-700">Analyzing spray conditions…</p>
                <p className="text-xs text-slate-400">Checking Delta-T · Wind · Rain Probability</p>
              </div>
              {/* Shimmer skeleton cards */}
              <div className="grid grid-cols-3 gap-3 w-full mt-2">
                {[0,1,2].map(i => (
                  <div key={i} className="rounded-2xl bg-slate-100 h-24 animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          {data && dec && (
            <>
              {/* Big Decision Badge */}
              <DecisionBadge decision={dec} />

              {/* Window timer (only when GO) */}
              {dec.decision === 'GO' && dec.window_minutes > 0 && (
                <div className="bg-white rounded-2xl border border-emerald-200 p-4">
                  <WindowTimer minutes={dec.window_minutes} />
                </div>
              )}

              {/* Blockers */}
              {dec.blockers.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2">
                  <p className="text-xs font-black text-rose-700 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" /> Blocking Conditions
                  </p>
                  {dec.blockers.map((b, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-rose-700 font-semibold">
                      <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {b}
                    </div>
                  ))}
                </div>
              )}

              {/* Cautions */}
              {dec.cautions.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
                  <p className="text-xs font-black text-amber-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Precautions
                  </p>
                  {dec.cautions.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-amber-700 font-semibold">
                      <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {c}
                    </div>
                  ))}
                </div>
              )}

              {/* Three Factor Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FactorCard factor={data.factors.delta_t} icon={Thermometer} />
                <FactorCard factor={data.factors.wind}    icon={Wind}        />
                <FactorCard factor={data.factors.rain}    icon={CloudRain}   />
              </div>

              {/* Action advice */}
              <div className={`rounded-2xl border p-4 flex items-start gap-3 ${
                dec.decision === 'GO'      ? 'bg-emerald-50 border-emerald-200' :
                dec.decision === 'CAUTION' ? 'bg-amber-50 border-amber-200'    :
                                             'bg-rose-50 border-rose-200'
              }`}>
                <Zap className={`w-4 h-4 mt-0.5 shrink-0 ${
                  dec.decision === 'GO' ? 'text-emerald-600' : dec.decision === 'CAUTION' ? 'text-amber-600' : 'text-rose-600'
                }`} />
                <div>
                  <p className="text-xs font-black text-slate-800 mb-0.5">Recommended Action</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{dec.action}</p>
                </div>
              </div>

              {/* Next Safe Window */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-600 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Next Optimal Spray Window</p>
                    <p className="text-sm font-extrabold text-slate-800">{data.next_optimal_window}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-xl border border-sky-200 shrink-0">
                  IST
                </span>
              </div>

              {/* Powered by footer */}
              <p className="text-[10px] text-slate-400 text-center font-medium">{data.powered_by}</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
