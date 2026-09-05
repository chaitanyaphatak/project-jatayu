import React from 'react'
import { TrendingUp, BarChart3, CloudRain, Sun, Droplets, Thermometer, ShieldAlert } from 'lucide-react'

export default function ClimatePage({ currentLocation }) {
  const state = currentLocation?.state || 'Maharashtra'

  // Seasonal climate data for Indian meteorological subdivision
  const seasonalRainfall = [
    { month: 'Jan', mm: 4.2, normal: 5.0, anomaly: '-16%' },
    { month: 'Feb', mm: 2.1, normal: 3.0, anomaly: '-30%' },
    { month: 'Mar', mm: 8.5, normal: 7.0, anomaly: '+21%' },
    { month: 'Apr', mm: 16.4, normal: 14.0, anomaly: '+17%' },
    { month: 'May', mm: 32.0, normal: 28.0, anomaly: '+14%' },
    { month: 'Jun', mm: 165.0, normal: 150.0, anomaly: '+10%' },
    { month: 'Jul', mm: 280.0, normal: 260.0, anomaly: '+7%' },
    { month: 'Aug', mm: 240.0, normal: 230.0, anomaly: '+4%' },
    { month: 'Sep', mm: 175.0, normal: 160.0, anomaly: '+9%' },
    { month: 'Oct', mm: 78.0, normal: 65.0, anomaly: '+20%' },
    { month: 'Nov', mm: 24.0, normal: 20.0, anomaly: '+20%' },
    { month: 'Dec', mm: 6.0, normal: 5.0, anomaly: '+20%' }
  ]

  const decadalTrends = [
    { year: '2020', monsoonArrival: '08 June', departure: '+12% (Excess)', heatwaveDays: 6 },
    { year: '2021', monsoonArrival: '05 June', departure: '+8% (Normal)', heatwaveDays: 8 },
    { year: '2022', monsoonArrival: '11 June', departure: '+15% (Excess)', heatwaveDays: 12 },
    { year: '2023', monsoonArrival: '14 June', departure: '-6% (Normal)', heatwaveDays: 14 },
    { year: '2024', monsoonArrival: '09 June', departure: '+11% (Excess)', heatwaveDays: 11 },
    { year: '2025', monsoonArrival: '06 June', departure: '+9% (Normal)', heatwaveDays: 9 },
    { year: '2026', monsoonArrival: '07 June (Observed)', departure: '+7% (Active)', heatwaveDays: 8 }
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Title Header */}
      <div className="pb-2 border-b border-slate-200/80">
        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-sky-600" />
          Climate Trends & Historical Meteorological Analytics
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Long-term rainfall departure, monsoon dynamics, and decadal anomaly tracking for <strong className="text-slate-800">{state} ({currentLocation?.name})</strong>
        </p>
      </div>

      {/* Key Climate Indicators Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm glass-card-hover space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Monsoon Cumulative Departure</span>
            <CloudRain className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-blue-700">+7.4%</p>
          <p className="text-xs text-slate-500">Above Long Period Average (LPA)</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm glass-card-hover space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Annual Mean Temp Anomaly</span>
            <Thermometer className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-3xl font-black text-rose-600">+0.62°C</p>
          <p className="text-xs text-slate-500">Compared to 1981-2010 baseline</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm glass-card-hover space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Extreme Rainfall Events</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-black text-amber-600">+14%</p>
          <p className="text-xs text-slate-500">Frequency increase in 50mm+ micro-bursts</p>
        </div>
      </div>

      {/* Monthly Precipitation Profile Grid */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-sky-600" />
          Monthly Precipitation Profile & Normal LPA Departure (mm)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
          {seasonalRainfall.map((m) => (
            <div key={m.month} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
              <p className="text-xs font-bold text-slate-700">{m.month}</p>
              <p className="text-sm font-black text-slate-900">{m.mm}</p>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full inline-block ${m.anomaly.startsWith('+') ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                {m.anomaly}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Monsoon & Heatwave Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Historical Monsoon & Heatwave Records for {state}</h3>
        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
              <tr>
                <th className="py-3 px-4">Season / Year</th>
                <th className="py-3 px-4">Monsoon Onset Date</th>
                <th className="py-3 px-4">Total Rainfall Departure</th>
                <th className="py-3 px-4">Extreme Heatwave Days (&gt;42°C)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {decadalTrends.map((row) => (
                <tr key={row.year} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">{row.year}</td>
                  <td className="py-3 px-4">{row.monsoonArrival}</td>
                  <td className="py-3 px-4 font-semibold text-blue-700">{row.departure}</td>
                  <td className="py-3 px-4 font-mono">{row.heatwaveDays} Days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
