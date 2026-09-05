import React, { useState } from 'react'
import { Layers, CloudRain, Thermometer, Wind, Users, Plane, Info } from 'lucide-react'
import WeatherMap from '../components/WeatherMap'

export default function MapsPage({ currentLocation, crowdReports }) {
  const [activeLayer, setActiveLayer] = useState('temp_heat')

  const layers = [
    {
      id: 'temp_heat',
      label: '🌡️ Temperature Heatmap',
      desc: 'See hot & cool temperature zones across India with color gradients (Red = Hot, Green/Blue = Cool)',
      color: 'border-orange-200 text-orange-800 bg-orange-50'
    },
    {
      id: 'radar',
      label: '🌧️ Live Rain Radar',
      desc: 'Live rainfall clouds and storm echoes around your location',
      color: 'border-sky-200 text-sky-800 bg-sky-50'
    },
    {
      id: 'wind_aqi',
      label: '💨 Wind & Air Quality',
      desc: 'Air Quality Index (AQI) levels and breeze conditions across major cities',
      color: 'border-teal-200 text-teal-800 bg-teal-50'
    },
    {
      id: 'crowd',
      label: '👥 Community Reports',
      desc: 'Real ground weather reported by local citizens and farmers',
      color: 'border-emerald-200 text-emerald-800 bg-emerald-50'
    },
    {
      id: 'route',
      label: '✈️ Travel & Flight Safety',
      desc: 'Airway corridors, highway pass conditions & cloud turbulence alerts',
      color: 'border-indigo-200 text-indigo-800 bg-indigo-50'
    }
  ]

  const currentLayerInfo = layers.find(l => l.id === activeLayer)

  return (
    <div className="space-y-4 animate-in fade-in duration-200 flex flex-col h-[calc(100vh-140px)] min-h-[640px]">
      
      {/* Title Header with Layer Selector */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200/80 shrink-0">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-600" />
            Live Weather & Temperature Maps
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time interactive weather visualization for <strong className="text-slate-800">{currentLocation?.name}</strong>
          </p>
        </div>

        {/* Map Layer Switcher Buttons */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs text-xs font-bold flex-wrap">
          {layers.map(l => (
            <button
              key={l.id}
              onClick={() => setActiveLayer(l.id)}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeLayer === l.id 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Layer Description Banner for Normal Users */}
      <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2.5 text-xs font-medium shrink-0 ${currentLayerInfo?.color || 'bg-slate-50 border-slate-200'}`}>
        <Info className="w-4 h-4 shrink-0" />
        <span><strong>What you are seeing:</strong> {currentLayerInfo?.desc}</span>
      </div>

      {/* Full Map View */}
      <div className="flex-1 rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-white p-2 relative">
        <WeatherMap 
          activeLayer={activeLayer} 
          crowdReports={crowdReports}
          centerCoords={[currentLocation?.lat || 18.5204, currentLocation?.lon || 73.8567]}
          locationName={currentLocation?.name || 'Selected City'}
        />
      </div>

    </div>
  )
}
