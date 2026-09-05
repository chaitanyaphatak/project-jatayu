import React, { useState } from 'react'
import { Layers, MapPin, Compass, Navigation } from 'lucide-react'
import WeatherMap from '../components/WeatherMap'

export default function MapsPage({ currentLocation, crowdReports }) {
  const [activeLayer, setActiveLayer] = useState('radar')

  return (
    <div className="space-y-4 animate-in fade-in duration-200 flex flex-col h-[calc(100vh-140px)] min-h-[600px]">
      
      {/* Title Header with Layer Selector */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200/80 shrink-0">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-600" />
            Interactive Meteorological Map & Radar Suite
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active Pan-India Map View for <strong className="text-slate-800">{currentLocation?.name}</strong>
          </p>
        </div>

        {/* Map Layer Switcher */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs text-xs font-bold">
          <button
            onClick={() => setActiveLayer('radar')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              activeLayer === 'radar' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Live Radar Tile Overlay
          </button>
          <button
            onClick={() => setActiveLayer('crowd')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              activeLayer === 'crowd' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. DBSCAN Crowd Heatmap
          </button>
          <button
            onClick={() => setActiveLayer('route')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              activeLayer === 'route' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. Airway / Route Advisory
          </button>
        </div>
      </div>

      {/* Full Map Container */}
      <div className="flex-1 rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-white p-2 relative">
        <WeatherMap 
          activeLayer={activeLayer} 
          crowdReports={crowdReports}
          centerCoords={[currentLocation?.lat || 18.5204, currentLocation?.lon || 73.8567]}
          locationName={currentLocation?.name || 'Selected Location'}
        />
      </div>

    </div>
  )
}
