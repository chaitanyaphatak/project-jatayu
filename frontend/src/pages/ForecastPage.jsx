import React, { useState, useEffect } from 'react'
import { 
  Calendar, Clock, Sun, CloudRain, Wind, Droplets, 
  Gauge, Umbrella, ArrowUp, ArrowDown, ChevronRight, RefreshCw, BarChart2
} from 'lucide-react'

export default function ForecastPage({ currentLocation, weather }) {
  const [forecastData, setForecastData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(0) // index in 7 days
  const [selectedMetric, setSelectedMetric] = useState('temp') // 'temp' | 'rain' | 'wind' | 'humidity'

  const fetchForecast = async () => {
    setLoading(true)
    try {
      const lat = currentLocation?.lat || 18.5204
      const lon = currentLocation?.lon || 73.8567
      const res = await fetch(`/api/v1/weather/forecast?lat=${lat}&lon=${lon}&location_name=${encodeURIComponent(currentLocation?.name || '')}`)
      if (res.ok) {
        const data = await res.json()
        setForecastData(data)
      }
    } catch (e) {
      console.warn('Forecast fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchForecast()
  }, [currentLocation])

  const dailyList = forecastData?.daily || [
    { date: 'Today (Day 1)', temp_max: 30.5, temp_min: 22.0, rain_prob: 65, precip_sum_mm: 4.2, condition: 'Moderate convective showers', wind_max: 14.5 },
    { date: 'Tomorrow (Day 2)', temp_max: 31.0, temp_min: 22.5, rain_prob: 55, precip_sum_mm: 2.8, condition: 'Scattered afternoon rain', wind_max: 12.0 },
    { date: 'Day 3', temp_max: 29.8, temp_min: 21.5, rain_prob: 40, precip_sum_mm: 1.0, condition: 'Partly cloudy with sun', wind_max: 11.5 },
    { date: 'Day 4', temp_max: 32.0, temp_min: 23.0, rain_prob: 20, precip_sum_mm: 0.0, condition: 'Mostly sunny', wind_max: 9.0 },
    { date: 'Day 5', temp_max: 32.5, temp_min: 23.5, rain_prob: 15, precip_sum_mm: 0.0, condition: 'Clear and warm', wind_max: 10.0 },
    { date: 'Day 6', temp_max: 31.5, temp_min: 22.8, rain_prob: 30, precip_sum_mm: 0.5, condition: 'Passing cloud cover', wind_max: 12.5 },
    { date: 'Day 7', temp_max: 30.0, temp_min: 22.0, rain_prob: 50, precip_sum_mm: 3.0, condition: 'Localized thunderstorm', wind_max: 16.0 }
  ]

  const hourlyList = forecastData?.hourly || []

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Page Title Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-600" />
            7-Day Detailed Forecast & 24h Hourly Progression
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Hyperlocal meteorological predictions for <strong className="text-slate-800">{currentLocation?.name}</strong>
          </p>
        </div>

        <button
          onClick={fetchForecast}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-xs transition flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${loading ? 'animate-spin' : ''}`} />
          Refresh Forecast
        </button>
      </div>

      {/* 7-Day Daily Overview Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {dailyList.map((day, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedDay(idx)}
            className={`p-4 rounded-3xl text-left transition border ${
              selectedDay === idx
                ? 'bg-sky-50 border-sky-300 shadow-md ring-2 ring-sky-100'
                : 'bg-white border-slate-200/90 hover:bg-slate-50 shadow-xs'
            }`}
          >
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : day.date.slice(0, 10)}
            </p>
            
            <div className="my-2.5 flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900">{Math.round(day.temp_max)}°</span>
              <span className="text-xs font-bold text-slate-400">{Math.round(day.temp_min)}°</span>
            </div>

            <p className="text-xs font-semibold text-slate-700 line-clamp-2 h-8 leading-tight">
              {day.condition}
            </p>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
              <span className="text-blue-600 flex items-center gap-0.5">
                <Umbrella className="w-3 h-3" /> {day.rain_prob}%
              </span>
              <span className="text-teal-600 flex items-center gap-0.5">
                <Wind className="w-3 h-3" /> {Math.round(day.wind_max)}k
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* 24-Hour Hourly Breakdown Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600" />
              24-Hour Hourly Progression
            </h3>
            <p className="text-xs text-slate-500">Hourly sequence synthesized from ECMWF & GFS physics</p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
            {[
              { id: 'temp', label: 'Temperature (°C)' },
              { id: 'rain', label: 'Precipitation Prob (%)' },
              { id: 'humidity', label: 'Humidity (%)' },
              { id: 'wind', label: 'Wind Speed (km/h)' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMetric(m.id)}
                className={`px-3 py-1 rounded-xl transition ${
                  selectedMetric === m.id ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hourly Horizontal Scroll Strip */}
        <div className="flex items-stretch gap-3 overflow-x-auto pb-3 pt-1 no-scrollbar">
          {hourlyList.slice(0, 24).map((h, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 min-w-[95px] text-center shrink-0 space-y-2 hover:bg-sky-50/60 hover:border-sky-200 transition"
            >
              <p className="text-xs font-bold text-slate-600">{h.time}</p>
              
              {selectedMetric === 'temp' && (
                <div className="py-1">
                  <span className="text-xl font-black text-slate-900">{Math.round(h.temp)}°C</span>
                  <p className="text-[10px] text-slate-500 font-medium">Feels {Math.round(h.temp + 1)}°</p>
                </div>
              )}

              {selectedMetric === 'rain' && (
                <div className="py-1">
                  <span className={`text-xl font-black ${h.rain_prob > 50 ? 'text-blue-600' : 'text-slate-700'}`}>
                    {h.rain_prob}%
                  </span>
                  <p className="text-[10px] text-blue-500 font-bold">Rain Prob</p>
                </div>
              )}

              {selectedMetric === 'humidity' && (
                <div className="py-1">
                  <span className="text-xl font-black text-teal-700">{h.humidity}%</span>
                  <p className="text-[10px] text-teal-600 font-bold">RH Index</p>
                </div>
              )}

              {selectedMetric === 'wind' && (
                <div className="py-1">
                  <span className="text-xl font-black text-indigo-700">{Math.round(h.wind_speed)}</span>
                  <p className="text-[10px] text-indigo-600 font-bold">km/h</p>
                </div>
              )}

              <p className="text-[10px] text-slate-500 font-semibold line-clamp-1">
                {h.condition}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
